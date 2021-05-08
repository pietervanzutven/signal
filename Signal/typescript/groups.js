require(exports => {
    "use strict";
    /* tslint:disable no-dynamic-delete no-unnecessary-local-variable */
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = require("lodash");
    const groupCredentialFetcher_1 = require("./services/groupCredentialFetcher");
    const zkgroup_1 = require("./util/zkgroup");
    const Crypto_1 = require("./Crypto");
    const uuid_1 = require("uuid");
    const message_1 = require("../js/modules/types/message");
    if (!lodash_1.isNumber(message_1.CURRENT_SCHEMA_VERSION)) {
        throw new Error('groups.ts: Unable to capture max message schema from js/modules/types/message');
    }
    // Constants
    exports.MASTER_KEY_LENGTH = 32;
    const TEMPORAL_AUTH_REJECTED_CODE = 401;
    const GROUP_ACCESS_DENIED_CODE = 403;
    // Group Changes
    function buildDisappearingMessagesTimerChange({ expireTimer, group, }) {
        const actions = new window.textsecure.protobuf.GroupChange.Actions();
        const blob = new window.textsecure.protobuf.GroupAttributeBlob();
        blob.disappearingMessagesDuration = expireTimer;
        if (!group.secretParams) {
            throw new Error('buildDisappearingMessagesTimerChange: group was missing secretParams!');
        }
        const clientZkGroupCipher = zkgroup_1.getClientZkGroupCipher(group.secretParams);
        const blobPlaintext = blob.toArrayBuffer();
        const blobCipherText = zkgroup_1.encryptGroupBlob(clientZkGroupCipher, blobPlaintext);
        const timerAction = new window.textsecure.protobuf.GroupChange.Actions.ModifyDisappearingMessagesTimerAction();
        timerAction.timer = blobCipherText;
        actions.version = (group.revision || 0) + 1;
        actions.modifyDisappearingMessagesTimer = timerAction;
        return actions;
    }
    exports.buildDisappearingMessagesTimerChange = buildDisappearingMessagesTimerChange;
    async function uploadGroupChange({ actions, group, serverPublicParamsBase64, }) {
        const logId = idForLogging(group);
        const sender = window.textsecure.messaging;
        if (!sender) {
            throw new Error('textsecure.messaging is not available!');
        }
        // Ensure we have the credentials we need before attempting GroupsV2 operations
        await groupCredentialFetcher_1.maybeFetchNewCredentials();
        if (!group.secretParams) {
            throw new Error('uploadGroupChange: group was missing secretParams!');
        }
        if (!group.publicParams) {
            throw new Error('uploadGroupChange: group was missing publicParams!');
        }
        const groupCredentials = groupCredentialFetcher_1.getCredentialsForToday(window.storage.get(groupCredentialFetcher_1.GROUP_CREDENTIALS_KEY));
        const options = {
            authCredentialBase64: groupCredentials.today.credential,
            serverPublicParamsBase64,
            groupPublicParamsBase64: group.publicParams,
            groupSecretParamsBase64: group.secretParams,
        };
        try {
            const optionsForToday = getGroupCredentials(options);
            const result = await sender.modifyGroup(actions, optionsForToday);
            return result;
        }
        catch (error) {
            if (error.code === TEMPORAL_AUTH_REJECTED_CODE) {
                window.log.info(`uploadGroupChange/${logId}: Credential for today failed, failing over to tomorrow...`);
                const optionsForTomorrow = getGroupCredentials(Object.assign(Object.assign({}, options), { authCredentialBase64: groupCredentials.tomorrow.credential }));
                return sender.modifyGroup(actions, optionsForTomorrow);
            }
            throw error;
        }
    }
    exports.uploadGroupChange = uploadGroupChange;
    // Utility
    function deriveGroupFields(masterKey) {
        const secretParams = zkgroup_1.deriveGroupSecretParams(masterKey);
        const publicParams = zkgroup_1.deriveGroupPublicParams(secretParams);
        const id = zkgroup_1.deriveGroupID(secretParams);
        return {
            id,
            secretParams,
            publicParams,
        };
    }
    exports.deriveGroupFields = deriveGroupFields;
    async function waitThenMaybeUpdateGroup(options) {
        // First wait to process all incoming messages on the websocket
        await window.waitForEmptyEventQueue();
        // Then wait to process all outstanding messages for this conversation
        const { conversation } = options;
        await conversation.queueJob(async () => {
            try {
                // And finally try to update the group
                await maybeUpdateGroup(options);
            }
            catch (error) {
                window.log.error(`waitThenMaybeUpdateGroup/${conversation.idForLogging()}: maybeUpdateGroup failure:`, error && error.stack ? error.stack : error);
            }
        });
    }
    exports.waitThenMaybeUpdateGroup = waitThenMaybeUpdateGroup;
    async function maybeUpdateGroup({ conversation, dropInitialJoinMessage, groupChangeBase64, newRevision, receivedAt, sentAt, }) {
        const logId = conversation.idForLogging();
        try {
            // Ensure we have the credentials we need before attempting GroupsV2 operations
            await groupCredentialFetcher_1.maybeFetchNewCredentials();
            const { newAttributes, groupChangeMessages, members, } = await getGroupUpdates({
                group: conversation.attributes,
                serverPublicParamsBase64: window.getServerPublicParams(),
                newRevision,
                groupChangeBase64,
                dropInitialJoinMessage,
            });
            conversation.set(newAttributes);
            // Ensure that all generated message are ordered properly. Before the provided timestamp
            //   so update messages appear before the initiating message, or after now().
            let syntheticTimestamp = receivedAt
                ? receivedAt - (groupChangeMessages.length + 1)
                : Date.now();
            // Save all synthetic messages describing group changes
            const changeMessagesToSave = groupChangeMessages.map(changeMessage => {
                // We do this to preserve the order of the timeline
                syntheticTimestamp += 1;
                return Object.assign(Object.assign({}, changeMessage), { conversationId: conversation.id, received_at: syntheticTimestamp, sent_at: sentAt });
            });
            if (changeMessagesToSave.length > 0) {
                await window.Signal.Data.saveMessages(changeMessagesToSave, {
                    forceSave: true,
                });
                changeMessagesToSave.forEach(changeMessage => {
                    const model = new window.Whisper.Message(changeMessage);
                    window.MessageController.register(model.id, model);
                    conversation.trigger('newmessage', model);
                });
            }
            // Capture profile key for each member in the group, if we don't have it yet
            members.forEach(member => {
                const contact = window.ConversationController.get(member.uuid);
                if (member.profileKey && contact && !contact.get('profileKey')) {
                    // tslint:disable-next-line no-floating-promises
                    contact.setProfileKey(member.profileKey);
                }
            });
            await conversation.updateLastMessage();
        }
        catch (error) {
            window.log.error(`maybeUpdateGroup/${logId}: Failed to update group:`, error && error.stack ? error.stack : error);
            throw error;
        }
    }
    exports.maybeUpdateGroup = maybeUpdateGroup;
    function idForLogging(group) {
        return `groupv2(${group.groupId})`;
    }
    async function getGroupUpdates({ dropInitialJoinMessage, group, serverPublicParamsBase64, newRevision, groupChangeBase64, }) {
        const logId = idForLogging(group);
        window.log.info(`getGroupUpdates/${logId}: Starting...`);
        const currentRevision = group.revision;
        const isFirstFetch = !lodash_1.isNumber(group.revision);
        if (groupChangeBase64 &&
            ((isFirstFetch && newRevision === 0) ||
                (lodash_1.isNumber(newRevision) &&
                    lodash_1.isNumber(currentRevision) &&
                    newRevision === currentRevision + 1))) {
            window.log.info(`getGroupUpdates/${logId}: Processing just one change`);
            const groupChangeBuffer = Crypto_1.base64ToArrayBuffer(groupChangeBase64);
            const groupChange = window.textsecure.protobuf.GroupChange.decode(groupChangeBuffer);
            return integrateGroupChange({ group, newRevision, groupChange });
        }
        if (lodash_1.isNumber(newRevision)) {
            try {
                const result = await updateGroupViaLogs({
                    group,
                    serverPublicParamsBase64,
                    newRevision,
                });
                return result;
            }
            catch (error) {
                if (error.code === TEMPORAL_AUTH_REJECTED_CODE) {
                    // We will fail over to the updateGroupViaState call below
                    window.log.info(`getGroupUpdates/${logId}: Temporal credential failure, now fetching full group state`);
                }
                else if (error.code === GROUP_ACCESS_DENIED_CODE) {
                    // We will fail over to the updateGroupViaState call below
                    window.log.info(`getGroupUpdates/${logId}: Log access denied, now fetching full group state`);
                }
                else {
                    throw error;
                }
            }
        }
        return updateGroupViaState({
            dropInitialJoinMessage,
            group,
            serverPublicParamsBase64,
        });
    }
    async function updateGroupViaState({ dropInitialJoinMessage, group, serverPublicParamsBase64, }) {
        const logId = idForLogging(group);
        const data = window.storage.get(groupCredentialFetcher_1.GROUP_CREDENTIALS_KEY);
        if (!data) {
            throw new Error('updateGroupViaState: No group credentials!');
        }
        const groupCredentials = groupCredentialFetcher_1.getCredentialsForToday(data);
        const stateOptions = {
            dropInitialJoinMessage,
            group,
            serverPublicParamsBase64,
            authCredentialBase64: groupCredentials.today.credential,
        };
        try {
            window.log.info(`updateGroupViaState/${logId}: Getting full group state...`);
            // We await this here so our try/catch below takes effect
            const result = await getCurrentGroupState(stateOptions);
            return result;
        }
        catch (error) {
            if (error.code === GROUP_ACCESS_DENIED_CODE) {
                return generateLeftGroupChanges(group);
            }
            if (error.code === TEMPORAL_AUTH_REJECTED_CODE) {
                window.log.info(`updateGroupViaState/${logId}: Credential for today failed, failing over to tomorrow...`);
                try {
                    const result = await getCurrentGroupState(Object.assign(Object.assign({}, stateOptions), { authCredentialBase64: groupCredentials.tomorrow.credential }));
                    return result;
                }
                catch (error) {
                    if (error.code === GROUP_ACCESS_DENIED_CODE) {
                        return generateLeftGroupChanges(group);
                    }
                }
            }
            throw error;
        }
    }
    async function updateGroupViaLogs({ group, serverPublicParamsBase64, newRevision, }) {
        const logId = idForLogging(group);
        const data = window.storage.get(groupCredentialFetcher_1.GROUP_CREDENTIALS_KEY);
        if (!data) {
            throw new Error('getGroupUpdates: No group credentials!');
        }
        const groupCredentials = groupCredentialFetcher_1.getCredentialsForToday(data);
        const deltaOptions = {
            group,
            newRevision,
            serverPublicParamsBase64,
            authCredentialBase64: groupCredentials.today.credential,
        };
        try {
            window.log.info(`updateGroupViaLogs/${logId}: Getting group delta from ${group.revision} to ${newRevision} for group groupv2(${group.groupId})...`);
            const result = await getGroupDelta(deltaOptions);
            return result;
        }
        catch (error) {
            if (error.code === TEMPORAL_AUTH_REJECTED_CODE) {
                window.log.info(`updateGroupViaLogs/${logId}: Credential for today failed, failing over to tomorrow...`);
                return getGroupDelta(Object.assign(Object.assign({}, deltaOptions), { authCredentialBase64: groupCredentials.tomorrow.credential }));
            }
            else {
                throw error;
            }
        }
    }
    function generateBasicMessage() {
        return {
            id: uuid_1.v4(),
            schemaVersion: message_1.CURRENT_SCHEMA_VERSION,
        };
    }
    function generateLeftGroupChanges(group) {
        const idLog = idForLogging(group);
        window.log.info(`generateLeftGroupChanges/${idLog}: Starting...`);
        const ourConversationId = window.ConversationController.getOurConversationId();
        if (!ourConversationId) {
            throw new Error('generateLeftGroupChanges: We do not have a conversationId!');
        }
        const existingMembers = group.membersV2 || [];
        const newAttributes = Object.assign(Object.assign({}, group), { membersV2: existingMembers.filter(member => member.conversationId !== ourConversationId), left: true });
        const isNewlyRemoved = existingMembers.length > (newAttributes.membersV2 || []).length;
        const youWereRemovedMessage = Object.assign(Object.assign({}, generateBasicMessage()), {
            type: 'group-v2-change', groupV2Change: {
                details: [
                    {
                        type: 'member-remove',
                        conversationId: ourConversationId,
                    },
                ],
            }
        });
        return {
            newAttributes,
            groupChangeMessages: isNewlyRemoved ? [youWereRemovedMessage] : [],
            members: [],
        };
    }
    function getGroupCredentials({ authCredentialBase64, groupPublicParamsBase64, groupSecretParamsBase64, serverPublicParamsBase64, }) {
        const authOperations = zkgroup_1.getClientZkAuthOperations(serverPublicParamsBase64);
        const presentation = zkgroup_1.getAuthCredentialPresentation(authOperations, authCredentialBase64, groupSecretParamsBase64);
        return {
            groupPublicParamsHex: Crypto_1.arrayBufferToHex(Crypto_1.base64ToArrayBuffer(groupPublicParamsBase64)),
            authCredentialPresentationHex: Crypto_1.arrayBufferToHex(presentation),
        };
    }
    async function getGroupDelta({ group, newRevision, serverPublicParamsBase64, authCredentialBase64, }) {
        const sender = window.textsecure.messaging;
        if (!sender) {
            throw new Error('getGroupDelta: textsecure.messaging is not available!');
        }
        if (!group.publicParams) {
            throw new Error('getGroupDelta: group was missing publicParams!');
        }
        if (!group.secretParams) {
            throw new Error('getGroupDelta: group was missing secretParams!');
        }
        const options = getGroupCredentials({
            authCredentialBase64,
            groupPublicParamsBase64: group.publicParams,
            groupSecretParamsBase64: group.secretParams,
            serverPublicParamsBase64,
        });
        const currentRevision = group.revision;
        let revisionToFetch = lodash_1.isNumber(currentRevision) ? currentRevision + 1 : 0;
        let response;
        const changes = [];
        do {
            response = await sender.getGroupLog(revisionToFetch, options);
            changes.push(response.changes);
            if (response.end) {
                revisionToFetch = response.end + 1;
            }
        } while (response.end && response.end < newRevision);
        // Would be nice to cache the unused groupChanges here, to reduce server roundtrips
        return integrateGroupChanges({
            changes,
            group,
            newRevision,
        });
    }
    async function integrateGroupChanges({ group, newRevision, changes, }) {
        const idLog = idForLogging(group);
        let attributes = group;
        const finalMessages = [];
        const finalMembers = [];
        const imax = changes.length;
        for (let i = 0; i < imax; i += 1) {
            const { groupChanges } = changes[i];
            if (!groupChanges) {
                continue;
            }
            const jmax = groupChanges.length;
            for (let j = 0; j < jmax; j += 1) {
                const changeState = groupChanges[j];
                const { groupChange } = changeState;
                if (!groupChange) {
                    continue;
                }
                try {
                    const { newAttributes, groupChangeMessages, members, } = await integrateGroupChange({
                        group: attributes,
                        newRevision,
                        groupChange,
                    });
                    attributes = newAttributes;
                    finalMessages.push(groupChangeMessages);
                    finalMembers.push(members);
                }
                catch (error) {
                    window.log.error(`integrateGroupChanges/${idLog}: Failed to apply change log, continuing to apply remaining change logs.`, error && error.stack ? error.stack : error);
                }
            }
        }
        // If this is our first fetch, we will collapse this down to one set of messages
        const isFirstFetch = !lodash_1.isNumber(group.revision);
        if (isFirstFetch) {
            // The first array in finalMessages is from the first revision we could process. It
            //   should contain a message about how we joined the group.
            const joinMessages = finalMessages[0];
            const alreadyHaveJoinMessage = joinMessages && joinMessages.length > 0;
            // There have been other changes since that first revision, so we generate diffs for
            //   the whole of the change since then, likely without the initial join message.
            const otherMessages = extractDiffs({
                old: group,
                current: attributes,
                dropInitialJoinMessage: alreadyHaveJoinMessage,
            });
            const groupChangeMessages = alreadyHaveJoinMessage
                ? [joinMessages[0], ...otherMessages]
                : otherMessages;
            return {
                newAttributes: attributes,
                groupChangeMessages,
                members: lodash_1.flatten(finalMembers),
            };
        }
        return {
            newAttributes: attributes,
            groupChangeMessages: lodash_1.flatten(finalMessages),
            members: lodash_1.flatten(finalMembers),
        };
    }
    async function integrateGroupChange({ group, groupChange, newRevision, }) {
        const logId = idForLogging(group);
        if (!group.secretParams) {
            throw new Error('integrateGroupChange: Group was missing secretParams!');
        }
        const groupChangeActions = window.textsecure.protobuf.GroupChange.Actions.decode(groupChange.actions.toArrayBuffer());
        if (groupChangeActions.version && groupChangeActions.version > newRevision) {
            return {
                newAttributes: group,
                groupChangeMessages: [],
                members: [],
            };
        }
        const decryptedChangeActions = decryptGroupChange(groupChangeActions, group.secretParams, logId);
        const { sourceUuid } = decryptedChangeActions;
        const sourceConversation = window.ConversationController.getOrCreate(sourceUuid, 'private');
        const sourceConversationId = sourceConversation.id;
        const { newAttributes, newProfileKeys } = await applyGroupChange({
            group,
            actions: decryptedChangeActions,
        });
        const groupChangeMessages = extractDiffs({
            old: group,
            current: newAttributes,
            sourceConversationId,
        });
        return {
            newAttributes,
            groupChangeMessages,
            members: newProfileKeys.map(item => (Object.assign(Object.assign({}, item), { profileKey: Crypto_1.arrayBufferToBase64(item.profileKey) }))),
        };
    }
    async function getCurrentGroupState({ authCredentialBase64, dropInitialJoinMessage, group, serverPublicParamsBase64, }) {
        const logId = idForLogging(group);
        const sender = window.textsecure.messaging;
        if (!sender) {
            throw new Error('textsecure.messaging is not available!');
        }
        if (!group.secretParams) {
            throw new Error('getCurrentGroupState: group was missing secretParams!');
        }
        if (!group.publicParams) {
            throw new Error('getCurrentGroupState: group was missing publicParams!');
        }
        const options = getGroupCredentials({
            authCredentialBase64,
            groupPublicParamsBase64: group.publicParams,
            groupSecretParamsBase64: group.secretParams,
            serverPublicParamsBase64,
        });
        const groupState = await sender.getGroup(options);
        const decryptedGroupState = decryptGroupState(groupState, group.secretParams, logId);
        const newAttributes = await applyGroupState(group, decryptedGroupState);
        return {
            newAttributes,
            groupChangeMessages: extractDiffs({
                old: group,
                current: newAttributes,
                dropInitialJoinMessage,
            }),
            members: getMembers(decryptedGroupState),
        };
    }
    exports.getCurrentGroupState = getCurrentGroupState;
    // tslint:disable-next-line max-func-body-length cyclomatic-complexity
    function extractDiffs({ current, dropInitialJoinMessage, old, sourceConversationId, }) {
        var _a, _b;
        const logId = idForLogging(old);
        const details = [];
        const ourConversationId = window.ConversationController.getOurConversationId();
        let areWeInGroup = false;
        if (current.accessControl &&
            (!old.accessControl ||
                old.accessControl.attributes !== current.accessControl.attributes)) {
            details.push({
                type: 'access-attributes',
                newPrivilege: current.accessControl.attributes,
            });
        }
        if (current.accessControl &&
            (!old.accessControl ||
                old.accessControl.members !== current.accessControl.members)) {
            details.push({
                type: 'access-members',
                newPrivilege: current.accessControl.members,
            });
        }
        if (Boolean(old.avatar) !== Boolean(current.avatar) ||
            ((_a = old.avatar) === null || _a === void 0 ? void 0 : _a.hash) !== ((_b = current.avatar) === null || _b === void 0 ? void 0 : _b.hash)) {
            details.push({
                type: 'avatar',
                removed: !current.avatar,
            });
        }
        if (old.name !== current.name) {
            details.push({
                type: 'title',
                newTitle: current.name,
            });
        }
        // No disappearing message timer check here - see below
        const oldMemberLookup = lodash_1.fromPairs((old.membersV2 || []).map(member => [member.conversationId, member]));
        const oldPendingMemberLookup = lodash_1.fromPairs((old.pendingMembersV2 || []).map(member => [member.conversationId, member]));
        (current.membersV2 || []).forEach(currentMember => {
            const { conversationId } = currentMember;
            if (ourConversationId && conversationId === ourConversationId) {
                areWeInGroup = true;
            }
            const oldMember = oldMemberLookup[conversationId];
            if (!oldMember) {
                const pendingMember = oldPendingMemberLookup[conversationId];
                if (pendingMember && pendingMember.addedByUserId) {
                    details.push({
                        type: 'member-add-from-invite',
                        conversationId,
                        inviter: pendingMember.addedByUserId,
                    });
                }
                else {
                    details.push({
                        type: 'member-add',
                        conversationId,
                    });
                }
                // If we capture a pending remove here, it's an 'accept invitation', and we don't
                //   want to generate a generic pending-remove event for it
                delete oldPendingMemberLookup[conversationId];
            }
            else if (oldMember.role !== currentMember.role) {
                details.push({
                    type: 'member-privilege',
                    conversationId,
                    newPrivilege: currentMember.role,
                });
            }
            // This deletion makes it easier to capture removals
            delete oldMemberLookup[conversationId];
        });
        const removedMemberIds = Object.keys(oldMemberLookup);
        removedMemberIds.forEach(conversationId => {
            details.push({
                type: 'member-remove',
                conversationId,
            });
        });
        let lastPendingConversationId;
        let count = 0;
        (current.pendingMembersV2 || []).forEach(currentPendingMember => {
            const { conversationId } = currentPendingMember;
            const oldPendingMember = oldPendingMemberLookup[conversationId];
            if (!oldPendingMember) {
                lastPendingConversationId = conversationId;
                count += 1;
            }
            // This deletion makes it easier to capture removals
            delete oldPendingMemberLookup[conversationId];
        });
        if (count > 1) {
            details.push({
                type: 'pending-add-many',
                count,
            });
        }
        else if (count === 1) {
            if (lastPendingConversationId) {
                details.push({
                    type: 'pending-add-one',
                    conversationId: lastPendingConversationId,
                });
            }
            else {
                window.log.warn(`extractDiffs/${logId}: pending-add count was 1, no last conversationId available`);
            }
        }
        // Note: The only members left over here should be people who were moved from the
        //   pending list but also not added to the group at the same time.
        const removedPendingMemberIds = Object.keys(oldPendingMemberLookup);
        if (removedPendingMemberIds.length > 1) {
            const firstConversationId = removedPendingMemberIds[0];
            const firstRemovedMember = oldPendingMemberLookup[firstConversationId];
            const inviter = firstRemovedMember.addedByUserId;
            const allSameInviter = removedPendingMemberIds.every(id => oldPendingMemberLookup[id].addedByUserId === inviter);
            details.push({
                type: 'pending-remove-many',
                count: removedPendingMemberIds.length,
                inviter: allSameInviter ? inviter : undefined,
            });
        }
        else if (removedPendingMemberIds.length === 1) {
            const conversationId = removedPendingMemberIds[0];
            const removedMember = oldPendingMemberLookup[conversationId];
            details.push({
                type: 'pending-remove-one',
                conversationId,
                inviter: removedMember.addedByUserId,
            });
        }
        let message;
        let timerNotification;
        const conversation = sourceConversationId
            ? window.ConversationController.get(sourceConversationId)
            : null;
        const sourceUuid = conversation ? conversation.get('uuid') : undefined;
        const firstUpdate = !lodash_1.isNumber(old.revision);
        const firstEventSourceId = sourceConversationId || ourConversationId;
        if (firstUpdate && dropInitialJoinMessage) {
            message = undefined;
        }
        else if (firstUpdate && ourConversationId && areWeInGroup) {
            message = Object.assign(Object.assign({}, generateBasicMessage()), {
                type: 'group-v2-change', groupV2Change: {
                    from: firstEventSourceId,
                    details: [
                        {
                            type: 'member-add',
                            conversationId: ourConversationId,
                        },
                    ],
                }
            });
        }
        else if (details.length > 0) {
            message = Object.assign(Object.assign({}, generateBasicMessage()), {
                type: 'group-v2-change', sourceUuid, groupV2Change: {
                    from: sourceConversationId,
                    details,
                }
            });
        }
        // This is checked differently, because it needs to be its own entry in the timeline,
        //   with its own icon, etc.
        if (
            // Turn on or turned off
            Boolean(old.expireTimer) !== Boolean(current.expireTimer) ||
            // Still on, but changed value
            (Boolean(old.expireTimer) &&
                Boolean(current.expireTimer) &&
                old.expireTimer !== current.expireTimer)) {
            timerNotification = Object.assign(Object.assign({}, generateBasicMessage()), {
                type: 'timer-notification', sourceUuid, flags: window.textsecure.protobuf.DataMessage.Flags.EXPIRATION_TIMER_UPDATE, expirationTimerUpdate: {
                    expireTimer: current.expireTimer || 0,
                    sourceUuid,
                }
            });
        }
        const result = lodash_1.compact([message, timerNotification]);
        window.log.info(`extractDiffs/${logId} complete, generated ${result.length} change messages`);
        return result;
    }
    function getMembers(groupState) {
        if (!groupState.members || !groupState.members.length) {
            return [];
        }
        return groupState.members.map((member) => ({
            profileKey: member.profileKey,
            uuid: member.userId,
        }));
    }
    // tslint:disable-next-line cyclomatic-complexity max-func-body-length
    async function applyGroupChange({ group, actions, }) {
        const logId = idForLogging(group);
        const ACCESS_ENUM = window.textsecure.protobuf.AccessControl.AccessRequired;
        const MEMBER_ROLE_ENUM = window.textsecure.protobuf.Member.Role;
        const version = actions.version || 0;
        const result = Object.assign({}, group);
        const newProfileKeys = [];
        const members = lodash_1.fromPairs((result.membersV2 || []).map(member => [member.conversationId, member]));
        const pendingMembers = lodash_1.fromPairs((result.pendingMembersV2 || []).map(member => [
            member.conversationId,
            member,
        ]));
        // version?: number;
        result.revision = version;
        // addMembers?: Array<GroupChangeClass.Actions.AddMemberAction>;
        (actions.addMembers || []).map(addMember => {
            const { added } = addMember;
            if (!added) {
                throw new Error('applyGroupChange: addMember.added is missing');
            }
            const conversation = window.ConversationController.getOrCreate(added.userId, 'private', {
                profileKey: added.profileKey
                    ? Crypto_1.arrayBufferToBase64(added.profileKey)
                    : undefined,
            });
            if (members[conversation.id]) {
                window.log.warn(`applyGroupChange/${logId}: Attempt to add member failed; already in members.`);
                return;
            }
            members[conversation.id] = {
                conversationId: conversation.id,
                role: added.role || MEMBER_ROLE_ENUM.DEFAULT,
                joinedAtVersion: version,
            };
            if (pendingMembers[conversation.id]) {
                window.log.warn(`applyGroupChange/${logId}: Removing newly-added member from pendingMembers.`);
                delete pendingMembers[conversation.id];
            }
            if (added.profileKey) {
                newProfileKeys.push({
                    profileKey: added.profileKey,
                    uuid: added.userId,
                });
            }
        });
        // deleteMembers?: Array<GroupChangeClass.Actions.DeleteMemberAction>;
        (actions.deleteMembers || []).forEach(deleteMember => {
            const { deletedUserId } = deleteMember;
            if (!deletedUserId) {
                throw new Error('applyGroupChange: deleteMember.deletedUserId is missing');
            }
            const conversation = window.ConversationController.getOrCreate(deletedUserId, 'private');
            if (members[conversation.id]) {
                delete members[conversation.id];
            }
            else {
                window.log.warn(`applyGroupChange/${logId}: Attempt to remove member failed; was not in members.`);
            }
        });
        // modifyMemberRoles?: Array<GroupChangeClass.Actions.ModifyMemberRoleAction>;
        (actions.modifyMemberRoles || []).forEach(modifyMemberRole => {
            const { role, userId } = modifyMemberRole;
            if (!role || !userId) {
                throw new Error('applyGroupChange: modifyMemberRole had a missing value');
            }
            const conversation = window.ConversationController.getOrCreate(userId, 'private');
            if (members[conversation.id]) {
                members[conversation.id] = Object.assign(Object.assign({}, members[conversation.id]), { role });
            }
            else {
                throw new Error('applyGroupChange: modifyMemberRole tried to modify nonexistent member');
            }
        });
        // modifyMemberProfileKeys?: Array<GroupChangeClass.Actions.ModifyMemberProfileKeyAction>;
        (actions.modifyMemberProfileKeys || []).forEach(modifyMemberProfileKey => {
            const { profileKey, uuid } = modifyMemberProfileKey;
            if (!profileKey || !uuid) {
                throw new Error('applyGroupChange: modifyMemberProfileKey had a missing value');
            }
            newProfileKeys.push({
                profileKey,
                uuid,
            });
        });
        // addPendingMembers?: Array<GroupChangeClass.Actions.AddPendingMemberAction>;
        (actions.addPendingMembers || []).forEach(addPendingMember => {
            const { added } = addPendingMember;
            if (!added || !added.member) {
                throw new Error('applyGroupChange: modifyMemberProfileKey had a missing value');
            }
            const conversation = window.ConversationController.getOrCreate(added.member.userId, 'private');
            if (members[conversation.id]) {
                window.log.warn(`applyGroupChange/${logId}: Attempt to add pendingMember failed; was already in members.`);
                return;
            }
            if (pendingMembers[conversation.id]) {
                window.log.warn(`applyGroupChange/${logId}: Attempt to add pendingMember failed; was already in pendingMembers.`);
                return;
            }
            pendingMembers[conversation.id] = {
                conversationId: conversation.id,
                addedByUserId: added.addedByUserId,
                timestamp: added.timestamp,
            };
            if (added.member && added.member.profileKey) {
                newProfileKeys.push({
                    profileKey: added.member.profileKey,
                    uuid: added.member.userId,
                });
            }
        });
        // deletePendingMembers?: Array<GroupChangeClass.Actions.DeletePendingMemberAction>;
        (actions.deletePendingMembers || []).forEach(deletePendingMember => {
            const { deletedUserId } = deletePendingMember;
            if (!deletedUserId) {
                throw new Error('applyGroupChange: deletePendingMember.deletedUserId is null!');
            }
            const conversation = window.ConversationController.getOrCreate(deletedUserId, 'private');
            if (pendingMembers[conversation.id]) {
                delete pendingMembers[conversation.id];
            }
            else {
                window.log.warn(`applyGroupChange/${logId}: Attempt to remove pendingMember failed; was not in pendingMembers.`);
            }
        });
        // promotePendingMembers?: Array<GroupChangeClass.Actions.PromotePendingMemberAction>;
        (actions.promotePendingMembers || []).forEach(promotePendingMember => {
            const { profileKey, uuid } = promotePendingMember;
            if (!profileKey || !uuid) {
                throw new Error('applyGroupChange: promotePendingMember had a missing value');
            }
            const conversation = window.ConversationController.getOrCreate(uuid, 'private', {
                profileKey: profileKey ? Crypto_1.arrayBufferToBase64(profileKey) : undefined,
            });
            if (pendingMembers[conversation.id]) {
                delete pendingMembers[conversation.id];
            }
            else {
                window.log.warn(`applyGroupChange/${logId}: Attempt to promote pendingMember failed; was not in pendingMembers.`);
            }
            if (members[conversation.id]) {
                window.log.warn(`applyGroupChange/${logId}: Attempt to promote pendingMember failed; was already in members.`);
                return;
            }
            members[conversation.id] = {
                conversationId: conversation.id,
                joinedAtVersion: version,
                role: MEMBER_ROLE_ENUM.DEFAULT,
            };
            newProfileKeys.push({
                profileKey,
                uuid,
            });
        });
        // modifyTitle?: GroupChangeClass.Actions.ModifyTitleAction;
        if (actions.modifyTitle) {
            const title = actions.modifyTitle.title;
            if (title && title.content === 'title') {
                result.name = title.title;
            }
            else {
                window.log.warn(`applyGroupChange/${logId}: Clearing group title due to missing data.`);
                result.name = undefined;
            }
        }
        // modifyAvatar?: GroupChangeClass.Actions.ModifyAvatarAction;
        if (actions.modifyAvatar) {
            const avatar = actions.modifyAvatar.avatar;
            await applyNewAvatar(avatar, result, logId);
        }
        // modifyDisappearingMessagesTimer?: GroupChangeClass.Actions.ModifyDisappearingMessagesTimerAction;
        if (actions.modifyDisappearingMessagesTimer) {
            const disappearingMessagesTimer = actions.modifyDisappearingMessagesTimer.timer;
            if (disappearingMessagesTimer &&
                disappearingMessagesTimer.content === 'disappearingMessagesDuration') {
                result.expireTimer =
                    disappearingMessagesTimer.disappearingMessagesDuration;
            }
            else {
                window.log.warn(`applyGroupChange/${logId}: Clearing group expireTimer due to missing data.`);
                result.expireTimer = undefined;
            }
        }
        result.accessControl = result.accessControl || {
            members: ACCESS_ENUM.MEMBER,
            attributes: ACCESS_ENUM.MEMBER,
        };
        // modifyAttributesAccess?: GroupChangeClass.Actions.ModifyAttributesAccessControlAction;
        if (actions.modifyAttributesAccess) {
            result.accessControl = Object.assign(Object.assign({}, result.accessControl), { attributes: actions.modifyAttributesAccess.attributesAccess || ACCESS_ENUM.MEMBER });
        }
        // modifyMemberAccess?: GroupChangeClass.Actions.ModifyMembersAccessControlAction;
        if (actions.modifyMemberAccess) {
            result.accessControl = Object.assign(Object.assign({}, result.accessControl), { members: actions.modifyMemberAccess.membersAccess || ACCESS_ENUM.MEMBER });
        }
        const ourConversationId = window.ConversationController.getOurConversationId();
        if (ourConversationId) {
            result.left = !members[ourConversationId];
        }
        // Go from lookups back to arrays
        result.membersV2 = lodash_1.values(members);
        result.pendingMembersV2 = lodash_1.values(pendingMembers);
        return {
            newAttributes: result,
            newProfileKeys,
        };
    }
    async function applyNewAvatar(newAvatar, result, logId) {
        try {
            // Avatar has been dropped
            if (!newAvatar && result.avatar) {
                await window.Signal.Migrations.deleteAttachmentData(result.avatar.path);
                result.avatar = undefined;
            }
            // Group has avatar; has it changed?
            if (newAvatar && (!result.avatar || result.avatar.url !== newAvatar)) {
                const sender = window.textsecure.messaging;
                if (!sender) {
                    throw new Error('applyNewAvatar: textsecure.messaging is not available!');
                }
                if (!result.secretParams) {
                    throw new Error('applyNewAvatar: group was missing secretParams!');
                }
                const ciphertext = await sender.getGroupAvatar(newAvatar);
                const clientZkGroupCipher = zkgroup_1.getClientZkGroupCipher(result.secretParams);
                const plaintext = zkgroup_1.decryptGroupBlob(clientZkGroupCipher, ciphertext);
                const blob = window.textsecure.protobuf.GroupAttributeBlob.decode(plaintext);
                if (blob.content !== 'avatar') {
                    throw new Error(`applyNewAvatar: Returned blob had incorrect content: ${blob.content}`);
                }
                const data = blob.avatar.toArrayBuffer();
                const hash = await Crypto_1.computeHash(data);
                if (result.avatar && result.avatar.path && result.avatar.hash !== hash) {
                    await window.Signal.Migrations.deleteAttachmentData(result.avatar.path);
                    result.avatar = undefined;
                }
                if (!result.avatar) {
                    const path = await window.Signal.Migrations.writeNewAttachmentData(data);
                    result.avatar = {
                        url: newAvatar,
                        path,
                        hash,
                    };
                }
            }
        }
        catch (error) {
            window.log.warn(`applyNewAvatar/${logId} Failed to handle avatar, clearing it`, error.stack);
            if (result.avatar && result.avatar.path) {
                await window.Signal.Migrations.deleteAttachmentData(result.avatar.path);
            }
            result.avatar = undefined;
        }
    }
    // tslint:disable-next-line cyclomatic-complexity max-func-body-length
    async function applyGroupState(group, groupState) {
        const logId = idForLogging(group);
        const ACCESS_ENUM = window.textsecure.protobuf.AccessControl.AccessRequired;
        const version = groupState.version || 0;
        const result = Object.assign({}, group);
        // version
        result.revision = version;
        // title
        // Note: During decryption, title becomes a GroupAttributeBlob
        const title = groupState.title;
        if (title && title.content === 'title') {
            result.name = title.title;
        }
        else {
            result.name = undefined;
        }
        // avatar
        await applyNewAvatar(groupState.avatar, result, logId);
        // disappearingMessagesTimer
        // Note: during decryption, disappearingMessageTimer becomes a GroupAttributeBlob
        const disappearingMessagesTimer = groupState.disappearingMessagesTimer;
        if (disappearingMessagesTimer &&
            disappearingMessagesTimer.content === 'disappearingMessagesDuration') {
            result.expireTimer = disappearingMessagesTimer.disappearingMessagesDuration;
        }
        else {
            result.expireTimer = undefined;
        }
        // accessControl
        const { accessControl } = groupState;
        result.accessControl = {
            attributes: (accessControl && accessControl.attributes) || ACCESS_ENUM.MEMBER,
            members: (accessControl && accessControl.members) || ACCESS_ENUM.MEMBER,
        };
        // Optimization: we assume we have left the group unless we are found in members
        result.left = true;
        const ourConversationId = window.ConversationController.getOurConversationId();
        // members
        if (groupState.members) {
            result.membersV2 = groupState.members.map((member) => {
                const conversation = window.ConversationController.getOrCreate(member.userId, 'private', {
                    profileKey: member.profileKey
                        ? Crypto_1.arrayBufferToBase64(member.profileKey)
                        : undefined,
                });
                if (ourConversationId && conversation.id === ourConversationId) {
                    result.left = false;
                }
                if (!member.role ||
                    member.role === window.textsecure.protobuf.Member.Role.UNKNOWN) {
                    throw new Error('applyGroupState: Received false or UNKNOWN member.role');
                }
                return {
                    role: member.role,
                    joinedAtVersion: member.joinedAtVersion || version,
                    conversationId: conversation.id,
                };
            });
        }
        // pendingMembers
        if (groupState.pendingMembers) {
            result.pendingMembersV2 = groupState.pendingMembers.map((member) => {
                let pending;
                let invitedBy;
                if (member.member && member.member.userId) {
                    pending = window.ConversationController.getOrCreate(member.member.userId, 'private', {
                        profileKey: member.member.profileKey
                            ? Crypto_1.arrayBufferToBase64(member.member.profileKey)
                            : undefined,
                    });
                }
                else {
                    throw new Error('Pending member did not have an associated userId');
                }
                if (member.addedByUserId) {
                    invitedBy = window.ConversationController.getOrCreate(member.addedByUserId, 'private');
                }
                else {
                    throw new Error('Pending member did not have an addedByUserID');
                }
                return {
                    addedByUserId: invitedBy.id,
                    conversationId: pending.id,
                    timestamp: member.timestamp,
                };
            });
        }
        return result;
    }
    function isValidRole(role) {
        const MEMBER_ROLE_ENUM = window.textsecure.protobuf.Member.Role;
        return (role === MEMBER_ROLE_ENUM.ADMINISTRATOR || role === MEMBER_ROLE_ENUM.DEFAULT);
    }
    function isValidAccess(access) {
        const ACCESS_ENUM = window.textsecure.protobuf.AccessControl.AccessRequired;
        return access === ACCESS_ENUM.ADMINISTRATOR || access === ACCESS_ENUM.MEMBER;
    }
    function isValidProfileKey(buffer) {
        return Boolean(buffer && buffer.byteLength === 32);
    }
    function hasData(data) {
        return data && data.limit > 0;
    }
    // tslint:disable-next-line max-func-body-length cyclomatic-complexity
    function decryptGroupChange(actions, groupSecretParams, logId) {
        const clientZkGroupCipher = zkgroup_1.getClientZkGroupCipher(groupSecretParams);
        if (hasData(actions.sourceUuid)) {
            try {
                actions.sourceUuid = zkgroup_1.decryptUuid(clientZkGroupCipher, actions.sourceUuid.toArrayBuffer());
            }
            catch (error) {
                window.log.warn(`decryptGroupChange/${logId}: Unable to decrypt sourceUuid. Clearing sourceUuid.`, error && error.stack ? error.stack : error);
                actions.sourceUuid = undefined;
            }
            window.normalizeUuids(actions, ['sourceUuid'], 'groups.decryptGroupChange');
            if (!window.isValidGuid(actions.sourceUuid)) {
                window.log.warn(`decryptGroupChange/${logId}: Invalid sourceUuid. Clearing sourceUuid.`);
                actions.sourceUuid = undefined;
            }
        }
        else {
            throw new Error('decryptGroupChange: Missing sourceUuid');
        }
        // addMembers?: Array<GroupChangeClass.Actions.AddMemberAction>;
        actions.addMembers = lodash_1.compact((actions.addMembers || []).map(addMember => {
            if (addMember.added) {
                const decrypted = decryptMember(clientZkGroupCipher, addMember.added, logId);
                if (!decrypted) {
                    return null;
                }
                addMember.added = decrypted;
                return addMember;
            }
            else {
                throw new Error('decryptGroupChange: AddMember was missing added field!');
            }
        }));
        // deleteMembers?: Array<GroupChangeClass.Actions.DeleteMemberAction>;
        actions.deleteMembers = lodash_1.compact((actions.deleteMembers || []).map(deleteMember => {
            if (hasData(deleteMember.deletedUserId)) {
                try {
                    deleteMember.deletedUserId = zkgroup_1.decryptUuid(clientZkGroupCipher, deleteMember.deletedUserId.toArrayBuffer());
                }
                catch (error) {
                    window.log.warn(`decryptGroupChange/${logId}: Unable to decrypt deleteMembers.deletedUserId. Dropping member.`, error && error.stack ? error.stack : error);
                    return null;
                }
            }
            else {
                throw new Error('decryptGroupChange: deleteMember.deletedUserId was missing');
            }
            window.normalizeUuids(deleteMember, ['deletedUserId'], 'groups.decryptGroupChange');
            if (!window.isValidGuid(deleteMember.deletedUserId)) {
                window.log.warn(`decryptGroupChange/${logId}: Dropping deleteMember due to invalid userId`);
                return null;
            }
            return deleteMember;
        }));
        // modifyMemberRoles?: Array<GroupChangeClass.Actions.ModifyMemberRoleAction>;
        actions.modifyMemberRoles = lodash_1.compact((actions.modifyMemberRoles || []).map(modifyMember => {
            if (hasData(modifyMember.userId)) {
                try {
                    modifyMember.userId = zkgroup_1.decryptUuid(clientZkGroupCipher, modifyMember.userId.toArrayBuffer());
                }
                catch (error) {
                    window.log.warn(`decryptGroupChange/${logId}: Unable to decrypt modifyMemberRole.userId. Dropping member.`, error && error.stack ? error.stack : error);
                    return null;
                }
            }
            else {
                throw new Error('decryptGroupChange: modifyMemberRole.userId was missing');
            }
            window.normalizeUuids(modifyMember, ['userId'], 'groups.decryptGroupChange');
            if (!window.isValidGuid(modifyMember.userId)) {
                window.log.warn(`decryptGroupChange/${logId}: Dropping modifyMemberRole due to invalid userId`);
                return null;
            }
            if (!isValidRole(modifyMember.role)) {
                throw new Error('decryptGroupChange: modifyMemberRole had invalid role');
            }
            return modifyMember;
        }));
        // modifyMemberProfileKeys?: Array<GroupChangeClass.Actions.ModifyMemberProfileKeyAction>;
        actions.modifyMemberProfileKeys = lodash_1.compact((actions.modifyMemberProfileKeys || []).map(modifyMemberProfileKey => {
            if (hasData(modifyMemberProfileKey.presentation)) {
                const { profileKey, uuid } = zkgroup_1.decryptProfileKeyCredentialPresentation(clientZkGroupCipher, modifyMemberProfileKey.presentation.toArrayBuffer());
                modifyMemberProfileKey.profileKey = profileKey;
                modifyMemberProfileKey.uuid = uuid;
                if (!modifyMemberProfileKey.uuid ||
                    !modifyMemberProfileKey.profileKey) {
                    throw new Error('decryptGroupChange: uuid or profileKey missing after modifyMemberProfileKey decryption!');
                }
                if (!window.isValidGuid(modifyMemberProfileKey.uuid)) {
                    window.log.warn(`decryptGroupChange/${logId}: Dropping modifyMemberProfileKey due to invalid userId`);
                    return null;
                }
                if (!isValidProfileKey(modifyMemberProfileKey.profileKey)) {
                    throw new Error('decryptGroupChange: modifyMemberProfileKey had invalid profileKey');
                }
            }
            else {
                throw new Error('decryptGroupChange: modifyMemberProfileKey.presentation was missing');
            }
            return modifyMemberProfileKey;
        }));
        // addPendingMembers?: Array<GroupChangeClass.Actions.AddPendingMemberAction>;
        actions.addPendingMembers = lodash_1.compact((actions.addPendingMembers || []).map(addPendingMember => {
            if (addPendingMember.added) {
                const decrypted = decryptPendingMember(clientZkGroupCipher, addPendingMember.added, logId);
                if (!decrypted) {
                    return null;
                }
                addPendingMember.added = decrypted;
                return addPendingMember;
            }
            else {
                throw new Error('decryptGroupChange: addPendingMember was missing added field!');
            }
        }));
        // deletePendingMembers?: Array<GroupChangeClass.Actions.DeletePendingMemberAction>;
        actions.deletePendingMembers = lodash_1.compact((actions.deletePendingMembers || []).map(deletePendingMember => {
            if (hasData(deletePendingMember.deletedUserId)) {
                try {
                    deletePendingMember.deletedUserId = zkgroup_1.decryptUuid(clientZkGroupCipher, deletePendingMember.deletedUserId.toArrayBuffer());
                }
                catch (error) {
                    window.log.warn(`decryptGroupChange/${logId}: Unable to decrypt deletePendingMembers.deletedUserId. Dropping member.`, error && error.stack ? error.stack : error);
                    return null;
                }
            }
            else {
                throw new Error('decryptGroupChange: deletePendingMembers.deletedUserId was missing');
            }
            window.normalizeUuids(deletePendingMember, ['deletedUserId'], 'groups.decryptGroupChange');
            if (!window.isValidGuid(deletePendingMember.deletedUserId)) {
                window.log.warn(`decryptGroupChange/${logId}: Dropping deletePendingMember due to invalid deletedUserId`);
                return null;
            }
            return deletePendingMember;
        }));
        // promotePendingMembers?: Array<GroupChangeClass.Actions.PromotePendingMemberAction>;
        actions.promotePendingMembers = lodash_1.compact((actions.promotePendingMembers || []).map(promotePendingMember => {
            if (hasData(promotePendingMember.presentation)) {
                const { profileKey, uuid } = zkgroup_1.decryptProfileKeyCredentialPresentation(clientZkGroupCipher, promotePendingMember.presentation.toArrayBuffer());
                promotePendingMember.profileKey = profileKey;
                promotePendingMember.uuid = uuid;
                if (!promotePendingMember.uuid || !promotePendingMember.profileKey) {
                    throw new Error('decryptGroupChange: uuid or profileKey missing after promotePendingMember decryption!');
                }
                if (!window.isValidGuid(promotePendingMember.uuid)) {
                    window.log.warn(`decryptGroupChange/${logId}: Dropping modifyMemberProfileKey due to invalid userId`);
                    return null;
                }
                if (!isValidProfileKey(promotePendingMember.profileKey)) {
                    throw new Error('decryptGroupChange: modifyMemberProfileKey had invalid profileKey');
                }
            }
            else {
                throw new Error('decryptGroupChange: promotePendingMember.presentation was missing');
            }
            return promotePendingMember;
        }));
        // modifyTitle?: GroupChangeClass.Actions.ModifyTitleAction;
        if (actions.modifyTitle && hasData(actions.modifyTitle.title)) {
            try {
                actions.modifyTitle.title = window.textsecure.protobuf.GroupAttributeBlob.decode(zkgroup_1.decryptGroupBlob(clientZkGroupCipher, actions.modifyTitle.title.toArrayBuffer()));
            }
            catch (error) {
                window.log.warn(`decryptGroupChange/${logId}: Unable to decrypt modifyTitle.title`, error && error.stack ? error.stack : error);
                actions.modifyTitle.title = undefined;
            }
        }
        else if (actions.modifyTitle) {
            actions.modifyTitle.title = undefined;
        }
        // modifyAvatar?: GroupChangeClass.Actions.ModifyAvatarAction;
        // Note: decryption happens during application of the change, on download of the avatar
        // modifyDisappearingMessagesTimer?: GroupChangeClass.Actions.ModifyDisappearingMessagesTimerAction;
        if (actions.modifyDisappearingMessagesTimer &&
            hasData(actions.modifyDisappearingMessagesTimer.timer)) {
            try {
                actions.modifyDisappearingMessagesTimer.timer = window.textsecure.protobuf.GroupAttributeBlob.decode(zkgroup_1.decryptGroupBlob(clientZkGroupCipher, actions.modifyDisappearingMessagesTimer.timer.toArrayBuffer()));
            }
            catch (error) {
                window.log.warn(`decryptGroupChange/${logId}: Unable to decrypt modifyDisappearingMessagesTimer.timer`, error && error.stack ? error.stack : error);
                actions.modifyDisappearingMessagesTimer.timer = undefined;
            }
        }
        else if (actions.modifyDisappearingMessagesTimer) {
            actions.modifyDisappearingMessagesTimer.timer = undefined;
        }
        // modifyAttributesAccess?: GroupChangeClass.Actions.ModifyAttributesAccessControlAction;
        if (actions.modifyAttributesAccess &&
            !isValidAccess(actions.modifyAttributesAccess.attributesAccess)) {
            throw new Error('decryptGroupChange: modifyAttributesAccess.attributesAccess was not a valid role');
        }
        // modifyMemberAccess?: GroupChangeClass.Actions.ModifyMembersAccessControlAction;
        if (actions.modifyMemberAccess &&
            !isValidAccess(actions.modifyMemberAccess.membersAccess)) {
            throw new Error('decryptGroupChange: modifyMemberAccess.membersAccess was not a valid role');
        }
        return actions;
    }
    // tslint:disable-next-line max-func-body-length
    function decryptGroupState(groupState, groupSecretParams, logId) {
        const clientZkGroupCipher = zkgroup_1.getClientZkGroupCipher(groupSecretParams);
        // title
        if (hasData(groupState.title)) {
            try {
                groupState.title = window.textsecure.protobuf.GroupAttributeBlob.decode(zkgroup_1.decryptGroupBlob(clientZkGroupCipher, groupState.title.toArrayBuffer()));
            }
            catch (error) {
                window.log.warn(`decryptGroupState/${logId}: Unable to decrypt title. Clearing it.`, error && error.stack ? error.stack : error);
                groupState.title = undefined;
            }
        }
        else {
            groupState.title = undefined;
        }
        // avatar
        // Note: decryption happens during application of the change, on download of the avatar
        // disappearing message timer
        if (hasData(groupState.disappearingMessagesTimer)) {
            try {
                groupState.disappearingMessagesTimer = window.textsecure.protobuf.GroupAttributeBlob.decode(zkgroup_1.decryptGroupBlob(clientZkGroupCipher, groupState.disappearingMessagesTimer.toArrayBuffer()));
            }
            catch (error) {
                window.log.warn(`decryptGroupState/${logId}: Unable to decrypt disappearing message timer. Clearing it.`, error && error.stack ? error.stack : error);
                groupState.disappearingMessagesTimer = undefined;
            }
        }
        else {
            groupState.disappearingMessagesTimer = undefined;
        }
        // accessControl
        if (!groupState.accessControl ||
            !isValidAccess(groupState.accessControl.attributes)) {
            throw new Error('decryptGroupState: Access control for attributes is missing or invalid');
        }
        if (!groupState.accessControl ||
            !isValidAccess(groupState.accessControl.members)) {
            throw new Error('decryptGroupState: Access control for members is missing or invalid');
        }
        // version
        if (!lodash_1.isNumber(groupState.version)) {
            throw new Error(`decryptGroupState: Expected version to be a number; it was ${groupState.version}`);
        }
        // members
        if (groupState.members) {
            groupState.members = lodash_1.compact(groupState.members.map((member) => decryptMember(clientZkGroupCipher, member, logId)));
        }
        // pending members
        if (groupState.pendingMembers) {
            groupState.pendingMembers = lodash_1.compact(groupState.pendingMembers.map((member) => decryptPendingMember(clientZkGroupCipher, member, logId)));
        }
        return groupState;
    }
    function decryptMember(clientZkGroupCipher, member, logId) {
        // userId
        if (hasData(member.userId)) {
            try {
                member.userId = zkgroup_1.decryptUuid(clientZkGroupCipher, member.userId.toArrayBuffer());
            }
            catch (error) {
                window.log.warn(`decryptMember/${logId}: Unable to decrypt member userid. Dropping member.`, error && error.stack ? error.stack : error);
                return null;
            }
            window.normalizeUuids(member, ['userId'], 'groups.decryptMember');
            if (!window.isValidGuid(member.userId)) {
                window.log.warn(`decryptMember/${logId}: Dropping member due to invalid userId`);
                return null;
            }
        }
        else {
            throw new Error('decryptMember: Member had missing userId');
        }
        // profileKey
        if (hasData(member.profileKey)) {
            member.profileKey = zkgroup_1.decryptProfileKey(clientZkGroupCipher, member.profileKey.toArrayBuffer(), member.userId);
            if (!isValidProfileKey(member.profileKey)) {
                throw new Error('decryptMember: Member had invalid profileKey');
            }
        }
        else {
            throw new Error('decryptMember: Member had missing profileKey');
        }
        // role
        if (!isValidRole(member.role)) {
            throw new Error('decryptMember: Member had invalid role');
        }
        return member;
    }
    // tslint:disable-next-line max-func-body-length cyclomatic-complexity
    function decryptPendingMember(clientZkGroupCipher, member, logId) {
        // addedByUserId
        if (hasData(member.addedByUserId)) {
            try {
                member.addedByUserId = zkgroup_1.decryptUuid(clientZkGroupCipher, member.addedByUserId.toArrayBuffer());
            }
            catch (error) {
                window.log.warn(`decryptPendingMember/${logId}: Unable to decrypt pending member addedByUserId. Dropping member.`, error && error.stack ? error.stack : error);
                return null;
            }
            window.normalizeUuids(member, ['addedByUserId'], 'groups.decryptPendingMember');
            if (!window.isValidGuid(member.addedByUserId)) {
                window.log.warn(`decryptPendingMember/${logId}: Dropping pending member due to invalid addedByUserId`);
                return null;
            }
        }
        else {
            throw new Error('decryptPendingMember: Member had missing addedByUserId');
        }
        // timestamp
        if (member.timestamp) {
            member.timestamp = member.timestamp.toNumber();
            const now = Date.now();
            if (!member.timestamp || member.timestamp > now) {
                member.timestamp = now;
            }
        }
        if (!member.member) {
            window.log.warn(`decryptPendingMember/${logId}: Dropping pending member due to missing member details`);
            return null;
        }
        const { userId, profileKey, role } = member.member;
        // userId
        if (hasData(userId)) {
            try {
                member.member.userId = zkgroup_1.decryptUuid(clientZkGroupCipher, userId.toArrayBuffer());
            }
            catch (error) {
                window.log.warn(`decryptPendingMember/${logId}: Unable to decrypt pending member userId. Dropping member.`, error && error.stack ? error.stack : error);
                return null;
            }
            window.normalizeUuids(member.member, ['userId'], 'groups.decryptPendingMember');
            if (!window.isValidGuid(member.member.userId)) {
                window.log.warn(`decryptPendingMember/${logId}: Dropping pending member due to invalid member.userId`);
                return null;
            }
        }
        else {
            throw new Error('decryptPendingMember: Member had missing member.userId');
        }
        // profileKey
        if (hasData(profileKey)) {
            try {
                member.member.profileKey = zkgroup_1.decryptProfileKey(clientZkGroupCipher, profileKey.toArrayBuffer(), userId);
            }
            catch (error) {
                window.log.warn(`decryptPendingMember/${logId}: Unable to decrypt pending member profileKey. Dropping profileKey.`, error && error.stack ? error.stack : error);
                member.member.profileKey = null;
            }
            if (!isValidProfileKey(member.member.profileKey)) {
                window.log.warn(`decryptPendingMember/${logId}: Dropping profileKey, since it was invalid`);
                member.member.profileKey = null;
            }
        }
        // role
        if (!isValidRole(role)) {
            throw new Error('decryptPendingMember: Member had invalid role');
        }
        return member;
    }
});