require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = require("lodash");
    const uuid_1 = require("uuid");
    const groupCredentialFetcher_1 = require("./services/groupCredentialFetcher");
    const Client_1 = __importDefault(require("./sql/Client"));
    const zkgroup_1 = require("./util/zkgroup");
    const Crypto_1 = require("./Crypto");
    const message_1 = require("../js/modules/types/message");
    const { updateConversation } = Client_1.default;
    if (!lodash_1.isNumber(message_1.CURRENT_SCHEMA_VERSION)) {
        throw new Error('groups.ts: Unable to capture max message schema from js/modules/types/message');
    }
    // Constants
    exports.MASTER_KEY_LENGTH = 32;
    exports.ID_V1_LENGTH = 16;
    exports.ID_LENGTH = 32;
    const TEMPORAL_AUTH_REJECTED_CODE = 401;
    const GROUP_ACCESS_DENIED_CODE = 403;
    const GROUP_NONEXISTENT_CODE = 404;
    const SUPPORTED_CHANGE_EPOCH = 0;
    // Group Modifications
    async function uploadAvatar({ logId, path, publicParams, secretParams, }) {
        try {
            const clientZkGroupCipher = zkgroup_1.getClientZkGroupCipher(secretParams);
            const data = await window.Signal.Migrations.readAttachmentData(path);
            const hash = await Crypto_1.computeHash(data);
            const blob = new window.textsecure.protobuf.GroupAttributeBlob();
            blob.avatar = data;
            const blobPlaintext = blob.toArrayBuffer();
            const ciphertext = zkgroup_1.encryptGroupBlob(clientZkGroupCipher, blobPlaintext);
            const key = await makeRequestWithTemporalRetry({
                logId: `uploadGroupAvatar/${logId}`,
                publicParams,
                secretParams,
                request: (sender, options) => sender.uploadGroupAvatar(ciphertext, options),
            });
            return {
                key,
                hash,
            };
        }
        catch (error) {
            window.log.warn(`uploadAvatar/${logId} Failed to upload avatar`, error.stack);
            throw error;
        }
    }
    async function buildGroupProto({ attributes, }) {
        const MEMBER_ROLE_ENUM = window.textsecure.protobuf.Member.Role;
        const ACCESS_ENUM = window.textsecure.protobuf.AccessControl.AccessRequired;
        const logId = `groupv2(${attributes.id})`;
        const { publicParams, secretParams } = attributes;
        if (!publicParams) {
            throw new Error(`buildGroupProto/${logId}: attributes were missing publicParams!`);
        }
        if (!secretParams) {
            throw new Error(`buildGroupProto/${logId}: attributes were missing secretParams!`);
        }
        const serverPublicParamsBase64 = window.getServerPublicParams();
        const clientZkGroupCipher = zkgroup_1.getClientZkGroupCipher(secretParams);
        const clientZkProfileCipher = zkgroup_1.getClientZkProfileOperations(serverPublicParamsBase64);
        const proto = new window.textsecure.protobuf.Group();
        proto.publicKey = Crypto_1.base64ToArrayBuffer(publicParams);
        proto.version = attributes.revision || 0;
        const titleBlob = new window.textsecure.protobuf.GroupAttributeBlob();
        titleBlob.title = attributes.name;
        const titleBlobPlaintext = titleBlob.toArrayBuffer();
        proto.title = zkgroup_1.encryptGroupBlob(clientZkGroupCipher, titleBlobPlaintext);
        if (attributes.avatar && attributes.avatar.path) {
            const { path } = attributes.avatar;
            const { key, hash } = await uploadAvatar({
                logId,
                path,
                publicParams,
                secretParams,
            });
            // eslint-disable-next-line no-param-reassign
            attributes.avatar.hash = hash;
            // eslint-disable-next-line no-param-reassign
            attributes.avatar.url = key;
            proto.avatar = key;
        }
        if (attributes.expireTimer) {
            const timerBlob = new window.textsecure.protobuf.GroupAttributeBlob();
            timerBlob.disappearingMessagesDuration = attributes.expireTimer;
            const timerBlobPlaintext = timerBlob.toArrayBuffer();
            proto.disappearingMessagesTimer = zkgroup_1.encryptGroupBlob(clientZkGroupCipher, timerBlobPlaintext);
        }
        const accessControl = new window.textsecure.protobuf.AccessControl();
        if (attributes.accessControl) {
            accessControl.attributes =
                attributes.accessControl.attributes || ACCESS_ENUM.MEMBER;
            accessControl.members =
                attributes.accessControl.members || ACCESS_ENUM.MEMBER;
        }
        else {
            accessControl.attributes = ACCESS_ENUM.MEMBER;
            accessControl.members = ACCESS_ENUM.MEMBER;
        }
        proto.accessControl = accessControl;
        proto.members = (attributes.membersV2 || []).map(item => {
            const member = new window.textsecure.protobuf.Member();
            const conversation = window.ConversationController.get(item.conversationId);
            if (!conversation) {
                throw new Error(`buildGroupProto/${logId}: no conversation for member!`);
            }
            const profileKeyCredentialBase64 = conversation.get('profileKeyCredential');
            if (!profileKeyCredentialBase64) {
                throw new Error(`buildGroupProto/${logId}: member was missing profileKeyCredentia!`);
            }
            const presentation = zkgroup_1.createProfileKeyCredentialPresentation(clientZkProfileCipher, profileKeyCredentialBase64, secretParams);
            member.role = item.role || MEMBER_ROLE_ENUM.DEFAULT;
            member.presentation = presentation;
            return member;
        });
        const ourConversationId = window.ConversationController.getOurConversationId();
        if (!ourConversationId) {
            throw new Error(`buildGroupProto/${logId}: unable to find our own conversationId!`);
        }
        const me = window.ConversationController.get(ourConversationId);
        if (!me) {
            throw new Error(`buildGroupProto/${logId}: unable to find our own conversation!`);
        }
        const ourUuid = me.get('uuid');
        if (!ourUuid) {
            throw new Error(`buildGroupProto/${logId}: unable to find our own uuid!`);
        }
        const ourUuidCipherTextBuffer = zkgroup_1.encryptUuid(clientZkGroupCipher, ourUuid);
        proto.pendingMembers = (attributes.pendingMembersV2 || []).map(item => {
            const pendingMember = new window.textsecure.protobuf.PendingMember();
            const member = new window.textsecure.protobuf.Member();
            const conversation = window.ConversationController.get(item.conversationId);
            if (!conversation) {
                throw new Error('buildGroupProto: no conversation for pending member!');
            }
            const uuid = conversation.get('uuid');
            if (!uuid) {
                throw new Error('buildGroupProto: pending member was missing uuid!');
            }
            const uuidCipherTextBuffer = zkgroup_1.encryptUuid(clientZkGroupCipher, uuid);
            member.userId = uuidCipherTextBuffer;
            member.role = item.role || MEMBER_ROLE_ENUM.DEFAULT;
            pendingMember.member = member;
            pendingMember.timestamp = item.timestamp;
            pendingMember.addedByUserId = ourUuidCipherTextBuffer;
            return pendingMember;
        });
        return proto;
    }
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
    function buildDeletePendingMemberChange({ uuid, group, }) {
        const actions = new window.textsecure.protobuf.GroupChange.Actions();
        if (!group.secretParams) {
            throw new Error('buildDeletePendingMemberChange: group was missing secretParams!');
        }
        const clientZkGroupCipher = zkgroup_1.getClientZkGroupCipher(group.secretParams);
        const uuidCipherTextBuffer = zkgroup_1.encryptUuid(clientZkGroupCipher, uuid);
        const deletePendingMember = new window.textsecure.protobuf.GroupChange.Actions.DeletePendingMemberAction();
        deletePendingMember.deletedUserId = uuidCipherTextBuffer;
        actions.version = (group.revision || 0) + 1;
        actions.deletePendingMembers = [deletePendingMember];
        return actions;
    }
    exports.buildDeletePendingMemberChange = buildDeletePendingMemberChange;
    function buildDeleteMemberChange({ uuid, group, }) {
        const actions = new window.textsecure.protobuf.GroupChange.Actions();
        if (!group.secretParams) {
            throw new Error('buildDeleteMemberChange: group was missing secretParams!');
        }
        const clientZkGroupCipher = zkgroup_1.getClientZkGroupCipher(group.secretParams);
        const uuidCipherTextBuffer = zkgroup_1.encryptUuid(clientZkGroupCipher, uuid);
        const deleteMember = new window.textsecure.protobuf.GroupChange.Actions.DeleteMemberAction();
        deleteMember.deletedUserId = uuidCipherTextBuffer;
        actions.version = (group.revision || 0) + 1;
        actions.deleteMembers = [deleteMember];
        return actions;
    }
    exports.buildDeleteMemberChange = buildDeleteMemberChange;
    function buildPromoteMemberChange({ group, profileKeyCredentialBase64, serverPublicParamsBase64, }) {
        const actions = new window.textsecure.protobuf.GroupChange.Actions();
        if (!group.secretParams) {
            throw new Error('buildDisappearingMessagesTimerChange: group was missing secretParams!');
        }
        const clientZkProfileCipher = zkgroup_1.getClientZkProfileOperations(serverPublicParamsBase64);
        const presentation = zkgroup_1.createProfileKeyCredentialPresentation(clientZkProfileCipher, profileKeyCredentialBase64, group.secretParams);
        const promotePendingMember = new window.textsecure.protobuf.GroupChange.Actions.PromotePendingMemberAction();
        promotePendingMember.presentation = presentation;
        actions.version = (group.revision || 0) + 1;
        actions.promotePendingMembers = [promotePendingMember];
        return actions;
    }
    exports.buildPromoteMemberChange = buildPromoteMemberChange;
    async function uploadGroupChange({ actions, group, }) {
        const logId = idForLogging(group);
        // Ensure we have the credentials we need before attempting GroupsV2 operations
        await groupCredentialFetcher_1.maybeFetchNewCredentials();
        if (!group.secretParams) {
            throw new Error('uploadGroupChange: group was missing secretParams!');
        }
        if (!group.publicParams) {
            throw new Error('uploadGroupChange: group was missing publicParams!');
        }
        return makeRequestWithTemporalRetry({
            logId: `uploadGroupChange/${logId}`,
            publicParams: group.publicParams,
            secretParams: group.secretParams,
            request: (sender, options) => sender.modifyGroup(actions, options),
        });
    }
    exports.uploadGroupChange = uploadGroupChange;
    // Utility
    function idForLogging(group) {
        return `groupv2(${group.groupId})`;
    }
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
    async function makeRequestWithTemporalRetry({ logId, publicParams, secretParams, request, }) {
        const data = window.storage.get(groupCredentialFetcher_1.GROUP_CREDENTIALS_KEY);
        if (!data) {
            throw new Error(`makeRequestWithTemporalRetry/${logId}: No group credentials!`);
        }
        const groupCredentials = groupCredentialFetcher_1.getCredentialsForToday(data);
        const sender = window.textsecure.messaging;
        if (!sender) {
            throw new Error(`makeRequestWithTemporalRetry/${logId}: textsecure.messaging is not available!`);
        }
        const todayOptions = getGroupCredentials({
            authCredentialBase64: groupCredentials.today.credential,
            groupPublicParamsBase64: publicParams,
            groupSecretParamsBase64: secretParams,
            serverPublicParamsBase64: window.getServerPublicParams(),
        });
        try {
            return await request(sender, todayOptions);
        }
        catch (todayError) {
            if (todayError.code === TEMPORAL_AUTH_REJECTED_CODE) {
                window.log.warn(`makeRequestWithTemporalRetry/${logId}: Trying again with tomorrow's credentials`);
                const tomorrowOptions = getGroupCredentials({
                    authCredentialBase64: groupCredentials.tomorrow.credential,
                    groupPublicParamsBase64: publicParams,
                    groupSecretParamsBase64: secretParams,
                    serverPublicParamsBase64: window.getServerPublicParams(),
                });
                return request(sender, tomorrowOptions);
            }
            throw todayError;
        }
    }
    async function fetchMembershipProof({ publicParams, secretParams, }) {
        // Ensure we have the credentials we need before attempting GroupsV2 operations
        await groupCredentialFetcher_1.maybeFetchNewCredentials();
        if (!publicParams) {
            throw new Error('fetchMembershipProof: group was missing publicParams!');
        }
        if (!secretParams) {
            throw new Error('fetchMembershipProof: group was missing secretParams!');
        }
        const response = await makeRequestWithTemporalRetry({
            logId: 'fetchMembershipProof',
            publicParams,
            secretParams,
            request: (sender, options) => sender.getGroupMembershipToken(options),
        });
        return response.token;
    }
    exports.fetchMembershipProof = fetchMembershipProof;
    // Migrating a group
    async function hasV1GroupBeenMigrated(conversation) {
        const logId = conversation.idForLogging();
        const isGroupV1 = conversation.isGroupV1();
        if (!isGroupV1) {
            window.log.warn(`checkForGV2Existence/${logId}: Called for non-GroupV1 conversation!`);
            return false;
        }
        // Ensure we have the credentials we need before attempting GroupsV2 operations
        await groupCredentialFetcher_1.maybeFetchNewCredentials();
        const groupId = conversation.get('groupId');
        if (!groupId) {
            throw new Error(`checkForGV2Existence/${logId}: No groupId!`);
        }
        const idBuffer = Crypto_1.fromEncodedBinaryToArrayBuffer(groupId);
        const masterKeyBuffer = await Crypto_1.deriveMasterKeyFromGroupV1(idBuffer);
        const fields = deriveGroupFields(masterKeyBuffer);
        try {
            await makeRequestWithTemporalRetry({
                logId: `getGroup/${logId}`,
                publicParams: Crypto_1.arrayBufferToBase64(fields.publicParams),
                secretParams: Crypto_1.arrayBufferToBase64(fields.secretParams),
                request: (sender, options) => sender.getGroup(options),
            });
            return true;
        }
        catch (error) {
            const { code } = error;
            return code !== GROUP_NONEXISTENT_CODE && code !== GROUP_ACCESS_DENIED_CODE;
        }
    }
    exports.hasV1GroupBeenMigrated = hasV1GroupBeenMigrated;
    async function maybeDeriveGroupV2Id(conversation) {
        const isGroupV1 = conversation.isGroupV1();
        const groupV1Id = conversation.get('groupId');
        const derived = conversation.get('derivedGroupV2Id');
        if (!isGroupV1 || !groupV1Id || derived) {
            return false;
        }
        const v1IdBuffer = Crypto_1.fromEncodedBinaryToArrayBuffer(groupV1Id);
        const masterKeyBuffer = await Crypto_1.deriveMasterKeyFromGroupV1(v1IdBuffer);
        const fields = deriveGroupFields(masterKeyBuffer);
        const derivedGroupV2Id = Crypto_1.arrayBufferToBase64(fields.id);
        conversation.set({
            derivedGroupV2Id,
        });
        return true;
    }
    exports.maybeDeriveGroupV2Id = maybeDeriveGroupV2Id;
    async function isGroupEligibleToMigrate(conversation) {
        if (!conversation.isGroupV1()) {
            return false;
        }
        const ourConversationId = window.ConversationController.getOurConversationId();
        const areWeMember = !conversation.get('left') &&
            ourConversationId &&
            conversation.hasMember(ourConversationId);
        if (!areWeMember) {
            return false;
        }
        const members = conversation.get('members') || [];
        for (let i = 0, max = members.length; i < max; i += 1) {
            const identifier = members[i];
            const contact = window.ConversationController.get(identifier);
            if (!contact) {
                return false;
            }
            if (!contact.get('uuid')) {
                return false;
            }
        }
        return true;
    }
    exports.isGroupEligibleToMigrate = isGroupEligibleToMigrate;
    async function getGroupMigrationMembers(conversation) {
        const logId = conversation.idForLogging();
        const MEMBER_ROLE_ENUM = window.textsecure.protobuf.Member.Role;
        const ourConversationId = window.ConversationController.getOurConversationId();
        if (!ourConversationId) {
            throw new Error(`getGroupMigrationMembers/${logId}: Couldn't fetch our own conversationId!`);
        }
        let areWeMember = false;
        let areWeInvited = false;
        const previousGroupV1Members = conversation.get('members') || [];
        const now = Date.now();
        const memberLookup = {};
        const membersV2 = lodash_1.compact(await Promise.all(previousGroupV1Members.map(async (e164) => {
            const contact = window.ConversationController.get(e164);
            if (!contact) {
                throw new Error(`getGroupMigrationMembers/${logId}: membersV2 - missing local contact for ${e164}, skipping.`);
            }
            if (!contact.get('uuid')) {
                window.log.warn(`getGroupMigrationMembers/${logId}: membersV2 - missing uuid for ${e164}, skipping.`);
                return null;
            }
            if (!contact.get('profileKey')) {
                window.log.warn(`getGroupMigrationMembers/${logId}: membersV2 - missing profileKey for member ${e164}, skipping.`);
                return null;
            }
            let capabilities = contact.get('capabilities');
            // Refresh our local data to be sure
            if (!capabilities ||
                !capabilities.gv2 ||
                !capabilities['gv1-migration'] ||
                !contact.get('profileKeyCredential')) {
                await contact.getProfiles();
            }
            capabilities = contact.get('capabilities');
            if (!capabilities || !capabilities.gv2) {
                window.log.warn(`getGroupMigrationMembers/${logId}: membersV2 - member ${e164} is missing gv2 capability, skipping.`);
                return null;
            }
            if (!capabilities || !capabilities['gv1-migration']) {
                window.log.warn(`getGroupMigrationMembers/${logId}: membersV2 - member ${e164} is missing gv1-migration capability, skipping.`);
                return null;
            }
            if (!contact.get('profileKeyCredential')) {
                window.log.warn(`getGroupMigrationMembers/${logId}: membersV2 - no profileKeyCredential for ${e164}, skipping.`);
                return null;
            }
            const conversationId = contact.id;
            if (conversationId === ourConversationId) {
                areWeMember = true;
            }
            memberLookup[conversationId] = true;
            return {
                conversationId,
                role: MEMBER_ROLE_ENUM.ADMINISTRATOR,
                joinedAtVersion: 0,
            };
        })));
        const droppedGV2MemberIds = [];
        const pendingMembersV2 = lodash_1.compact((previousGroupV1Members || []).map(e164 => {
            const contact = window.ConversationController.get(e164);
            if (!contact) {
                throw new Error(`getGroupMigrationMembers/${logId}: pendingMembersV2 - missing local contact for ${e164}, skipping.`);
            }
            const conversationId = contact.id;
            // If we've already added this contact above, we'll skip here
            if (memberLookup[conversationId]) {
                return null;
            }
            if (!contact.get('uuid')) {
                window.log.warn(`getGroupMigrationMembers/${logId}: pendingMembersV2 - missing uuid for ${e164}, skipping.`);
                droppedGV2MemberIds.push(conversationId);
                return null;
            }
            const capabilities = contact.get('capabilities');
            if (!capabilities || !capabilities.gv2) {
                window.log.warn(`getGroupMigrationMembers/${logId}: pendingMembersV2 - member ${e164} is missing gv2 capability, skipping.`);
                droppedGV2MemberIds.push(conversationId);
                return null;
            }
            if (!capabilities || !capabilities['gv1-migration']) {
                window.log.warn(`getGroupMigrationMembers/${logId}: pendingMembersV2 - member ${e164} is missing gv1-migration capability, skipping.`);
                droppedGV2MemberIds.push(conversationId);
                return null;
            }
            if (conversationId === ourConversationId) {
                areWeInvited = true;
            }
            return {
                conversationId,
                timestamp: now,
                addedByUserId: ourConversationId,
                role: MEMBER_ROLE_ENUM.ADMINISTRATOR,
            };
        }));
        if (!areWeMember) {
            throw new Error(`getGroupMigrationMembers/${logId}: We are not a member!`);
        }
        if (areWeInvited) {
            throw new Error(`getGroupMigrationMembers/${logId}: We are invited!`);
        }
        return {
            droppedGV2MemberIds,
            membersV2,
            pendingMembersV2,
            previousGroupV1Members,
        };
    }
    exports.getGroupMigrationMembers = getGroupMigrationMembers;
    // This is called when the user chooses to migrate a GroupV1. It will update the server,
    //   then let all members know about the new group.
    async function initiateMigrationToGroupV2(conversation) {
        // Ensure we have the credentials we need before attempting GroupsV2 operations
        await groupCredentialFetcher_1.maybeFetchNewCredentials();
        try {
            await conversation.queueJob(async () => {
                const ACCESS_ENUM = window.textsecure.protobuf.AccessControl.AccessRequired;
                const isEligible = isGroupEligibleToMigrate(conversation);
                const previousGroupV1Id = conversation.get('groupId');
                if (!isEligible || !previousGroupV1Id) {
                    throw new Error(`initiateMigrationToGroupV2: conversation is not eligible to migrate! ${conversation.idForLogging()}`);
                }
                const groupV1IdBuffer = Crypto_1.fromEncodedBinaryToArrayBuffer(previousGroupV1Id);
                const masterKeyBuffer = await Crypto_1.deriveMasterKeyFromGroupV1(groupV1IdBuffer);
                const fields = deriveGroupFields(masterKeyBuffer);
                const groupId = Crypto_1.arrayBufferToBase64(fields.id);
                const logId = `groupv2(${groupId})`;
                window.log.info(`initiateMigrationToGroupV2/${logId}: Migrating from ${conversation.idForLogging()}`);
                const masterKey = Crypto_1.arrayBufferToBase64(masterKeyBuffer);
                const secretParams = Crypto_1.arrayBufferToBase64(fields.secretParams);
                const publicParams = Crypto_1.arrayBufferToBase64(fields.publicParams);
                const ourConversationId = window.ConversationController.getOurConversationId();
                if (!ourConversationId) {
                    throw new Error(`initiateMigrationToGroupV2/${logId}: Couldn't fetch our own conversationId!`);
                }
                const { membersV2, pendingMembersV2, droppedGV2MemberIds, previousGroupV1Members, } = await getGroupMigrationMembers(conversation);
                const rawSizeLimit = window.Signal.RemoteConfig.getValue('global.groupsv2.groupSizeHardLimit');
                if (!rawSizeLimit) {
                    throw new Error(`initiateMigrationToGroupV2/${logId}: Failed to fetch group size limit`);
                }
                const sizeLimit = parseInt(rawSizeLimit, 10);
                if (!lodash_1.isFinite(sizeLimit)) {
                    throw new Error(`initiateMigrationToGroupV2/${logId}: Failed to parse group size limit`);
                }
                if (membersV2.length + pendingMembersV2.length > sizeLimit) {
                    throw new Error(`initiateMigrationToGroupV2/${logId}: Too many members! Member count: ${membersV2.length}, Pending member count: ${pendingMembersV2.length}`);
                }
                // Note: A few group elements don't need to change here:
                //   - avatar
                //   - name
                //   - expireTimer
                const newAttributes = Object.assign(Object.assign({}, conversation.attributes), {
                    // Core GroupV2 info
                    revision: 0, groupId, groupVersion: 2, masterKey,
                    publicParams,
                    secretParams,
                    // GroupV2 state
                    accessControl: {
                        attributes: ACCESS_ENUM.MEMBER,
                        members: ACCESS_ENUM.MEMBER,
                    }, membersV2,
                    pendingMembersV2,
                    // Capture previous GroupV1 data for future use
                    previousGroupV1Id,
                    previousGroupV1Members,
                    // Clear storage ID, since we need to start over on the storage service
                    storageID: undefined,
                    // Clear obsolete data
                    derivedGroupV2Id: undefined, members: undefined
                });
                const groupProto = await buildGroupProto({ attributes: newAttributes });
                // Capture the CDK key provided by the server when we uploade
                if (groupProto.avatar && newAttributes.avatar) {
                    newAttributes.avatar.url = groupProto.avatar;
                }
                try {
                    await makeRequestWithTemporalRetry({
                        logId: `createGroup/${logId}`,
                        publicParams,
                        secretParams,
                        request: (sender, options) => sender.createGroup(groupProto, options),
                    });
                }
                catch (error) {
                    window.log.error(`initiateMigrationToGroupV2/${logId}: Error creating group:`, error.stack);
                    throw error;
                }
                const groupChangeMessages = [];
                groupChangeMessages.push(Object.assign(Object.assign({}, generateBasicMessage()), { type: 'group-v1-migration', invitedGV2Members: pendingMembersV2, droppedGV2MemberIds }));
                await updateGroup({
                    conversation,
                    updates: {
                        newAttributes,
                        groupChangeMessages,
                        members: [],
                    },
                });
                if (window.storage.isGroupBlocked(previousGroupV1Id)) {
                    window.storage.addBlockedGroup(groupId);
                }
                // Save these most recent updates to conversation
                updateConversation(conversation.attributes);
            });
        }
        catch (error) {
            const logId = conversation.idForLogging();
            if (!conversation.isGroupV1()) {
                throw error;
            }
            const alreadyMigrated = await hasV1GroupBeenMigrated(conversation);
            if (!alreadyMigrated) {
                window.log.error(`initiateMigrationToGroupV2/${logId}: Group has not already been migrated, re-throwing error`);
                throw error;
            }
            await respondToGroupV2Migration({
                conversation,
            });
            return;
        }
        // We've migrated the group, now we need to let all other group members know about it
        const logId = conversation.idForLogging();
        const timestamp = Date.now();
        const profileKey = conversation.get('profileKey');
        await wrapWithSyncMessageSend({
            conversation,
            logId: `sendMessageToGroup/${logId}`,
            send: async (sender) =>
                // Minimal message to notify group members about migration
                sender.sendMessageToGroup({
                    groupV2: conversation.getGroupV2Info({
                        includePendingMembers: true,
                    }),
                    timestamp,
                    profileKey: profileKey ? Crypto_1.base64ToArrayBuffer(profileKey) : undefined,
                }),
            timestamp,
        });
    }
    exports.initiateMigrationToGroupV2 = initiateMigrationToGroupV2;
    async function wrapWithSyncMessageSend({ conversation, logId, send, timestamp, }) {
        const sender = window.textsecure.messaging;
        if (!sender) {
            throw new Error(`initiateMigrationToGroupV2/${logId}: textsecure.messaging is not available!`);
        }
        let response;
        try {
            response = await send(sender);
        }
        catch (error) {
            if (conversation.processSendResponse(error)) {
                response = error;
            }
        }
        if (!response) {
            throw new Error(`wrapWithSyncMessageSend/${logId}: message send didn't return result!!`);
        }
        // Minimal implementation of sending same message to linked devices
        const { dataMessage } = response;
        if (!dataMessage) {
            throw new Error(`wrapWithSyncMessageSend/${logId}: dataMessage was not returned by send!`);
        }
        const ourConversationId = window.ConversationController.getOurConversationId();
        if (!ourConversationId) {
            throw new Error(`wrapWithSyncMessageSend/${logId}: Cannot get our conversationId!`);
        }
        const ourConversation = window.ConversationController.get(ourConversationId);
        if (!ourConversation) {
            throw new Error(`wrapWithSyncMessageSend/${logId}: Cannot get our conversation!`);
        }
        await sender.sendSyncMessage(dataMessage, timestamp, ourConversation.get('e164'), ourConversation.get('uuid'), null, // expirationStartTimestamp
            [], // sentTo
            [], // unidentifiedDeliveries
            undefined, // isUpdate
            undefined // options
        );
    }
    exports.wrapWithSyncMessageSend = wrapWithSyncMessageSend;
    async function waitThenRespondToGroupV2Migration(options) {
        // First wait to process all incoming messages on the websocket
        await window.waitForEmptyEventQueue();
        // Then wait to process all outstanding messages for this conversation
        const { conversation } = options;
        await conversation.queueJob(async () => {
            try {
                // And finally try to migrate the group
                await respondToGroupV2Migration(options);
            }
            catch (error) {
                window.log.error(`waitThenRespondToGroupV2Migration/${conversation.idForLogging()}: respondToGroupV2Migration failure:`, error && error.stack ? error.stack : error);
            }
        });
    }
    exports.waitThenRespondToGroupV2Migration = waitThenRespondToGroupV2Migration;
    // This may be called from storage service, an out-of-band check, or an incoming message.
    //   If this is kicked off via an incoming message, we want to do the right thing and hit
    //   the log endpoint - the parameters beyond conversation are needed in that scenario.
    async function respondToGroupV2Migration({ conversation, groupChangeBase64, newRevision, receivedAt, sentAt, }) {
        var _a, _b, _c;
        // Ensure we have the credentials we need before attempting GroupsV2 operations
        await groupCredentialFetcher_1.maybeFetchNewCredentials();
        const isGroupV1 = conversation.isGroupV1();
        const previousGroupV1Id = conversation.get('groupId');
        if (!isGroupV1 || !previousGroupV1Id) {
            throw new Error(`respondToGroupV2Migration: Conversation is not GroupV1! ${conversation.idForLogging()}`);
        }
        // If we were not previously a member, we won't migrate
        const ourConversationId = window.ConversationController.getOurConversationId();
        const wereWePreviouslyAMember = !conversation.get('left') &&
            ourConversationId &&
            conversation.hasMember(ourConversationId);
        if (!ourConversationId || !wereWePreviouslyAMember) {
            window.log.info(`respondToGroupV2Migration: Not currently a member of ${conversation.idForLogging()}, returning early.`);
            return;
        }
        // Derive GroupV2 fields
        const groupV1IdBuffer = Crypto_1.fromEncodedBinaryToArrayBuffer(previousGroupV1Id);
        const masterKeyBuffer = await Crypto_1.deriveMasterKeyFromGroupV1(groupV1IdBuffer);
        const fields = deriveGroupFields(masterKeyBuffer);
        const groupId = Crypto_1.arrayBufferToBase64(fields.id);
        const logId = `groupv2(${groupId})`;
        window.log.info(`respondToGroupV2Migration/${logId}: Migrating from ${conversation.idForLogging()}`);
        const masterKey = Crypto_1.arrayBufferToBase64(masterKeyBuffer);
        const secretParams = Crypto_1.arrayBufferToBase64(fields.secretParams);
        const publicParams = Crypto_1.arrayBufferToBase64(fields.publicParams);
        const previousGroupV1Members = conversation.get('members');
        const previousGroupV1MembersIds = conversation.getMemberIds();
        // Skeleton of the new group state - not useful until we add the group's server state
        const attributes = Object.assign(Object.assign({}, conversation.attributes), {
            // Core GroupV2 info
            revision: 0, groupId, groupVersion: 2, masterKey,
            publicParams,
            secretParams,
            // Capture previous GroupV1 data for future use
            previousGroupV1Id,
            previousGroupV1Members,
            // Clear storage ID, since we need to start over on the storage service
            storageID: undefined,
            // Clear obsolete data
            derivedGroupV2Id: undefined, members: undefined
        });
        let firstGroupState;
        try {
            const response = await makeRequestWithTemporalRetry({
                logId: `getGroupLog/${logId}`,
                publicParams,
                secretParams,
                request: (sender, options) => sender.getGroupLog(0, options),
            });
            // Attempt to start with the first group state, only later processing future updates
            firstGroupState = (_c = (_b = (_a = response === null || response === void 0 ? void 0 : response.changes) === null || _a === void 0 ? void 0 : _a.groupChanges) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.groupState;
        }
        catch (error) {
            if (error.code === GROUP_ACCESS_DENIED_CODE) {
                window.log.info(`respondToGroupV2Migration/${logId}: Failed to access log endpoint; fetching full group state`);
                firstGroupState = await makeRequestWithTemporalRetry({
                    logId: `getGroup/${logId}`,
                    publicParams,
                    secretParams,
                    request: (sender, options) => sender.getGroup(options),
                });
            }
            else {
                throw error;
            }
        }
        if (!firstGroupState) {
            throw new Error(`respondToGroupV2Migration/${logId}: Couldn't get a first group state!`);
        }
        const groupState = decryptGroupState(firstGroupState, attributes.secretParams, logId);
        const newAttributes = await applyGroupState({
            group: attributes,
            groupState,
        });
        // Assemble items to commemorate this event for the timeline..
        const combinedConversationIds = [
            ...(newAttributes.membersV2 || []).map(item => item.conversationId),
            ...(newAttributes.pendingMembersV2 || []).map(item => item.conversationId),
        ];
        const droppedMemberIds = lodash_1.difference(previousGroupV1MembersIds, combinedConversationIds).filter(id => id && id !== ourConversationId);
        const invitedMembers = (newAttributes.pendingMembersV2 || []).filter(item => item.conversationId !== ourConversationId);
        const areWeInvited = (newAttributes.pendingMembersV2 || []).some(item => item.conversationId === ourConversationId);
        const areWeMember = (newAttributes.membersV2 || []).some(item => item.conversationId === ourConversationId);
        // Generate notifications into the timeline
        const groupChangeMessages = [];
        groupChangeMessages.push(Object.assign(Object.assign({}, generateBasicMessage()), {
            type: 'group-v1-migration', groupMigration: {
                areWeInvited,
                invitedMembers,
                droppedMemberIds,
            }
        }));
        if (!areWeInvited && !areWeMember) {
            // Add a message to the timeline saying the user was removed. This shouldn't happen.
            groupChangeMessages.push(Object.assign(Object.assign({}, generateBasicMessage()), {
                type: 'group-v2-change', groupV2Change: {
                    details: [
                        {
                            type: 'member-remove',
                            conversationId: ourConversationId,
                        },
                    ],
                }
            }));
        }
        // This buffer ensures that all migration-related messages are sorted above
        //   any initiating message. We need to do this because groupChangeMessages are
        //   already sorted via updates to sentAt inside of updateGroup().
        const SORT_BUFFER = 1000;
        await updateGroup({
            conversation,
            receivedAt,
            sentAt: sentAt ? sentAt - SORT_BUFFER : undefined,
            updates: {
                newAttributes,
                groupChangeMessages,
                members: [],
            },
        });
        if (window.storage.isGroupBlocked(previousGroupV1Id)) {
            window.storage.addBlockedGroup(groupId);
        }
        // Save these most recent updates to conversation
        updateConversation(conversation.attributes);
        // Finally, check for any changes to the group since its initial creation using normal
        //   group update codepaths.
        await maybeUpdateGroup({
            conversation,
            groupChangeBase64,
            newRevision,
            receivedAt,
            sentAt,
        });
    }
    exports.respondToGroupV2Migration = respondToGroupV2Migration;
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
            const updates = await getGroupUpdates({
                group: conversation.attributes,
                serverPublicParamsBase64: window.getServerPublicParams(),
                newRevision,
                groupChangeBase64,
                dropInitialJoinMessage,
            });
            await updateGroup({ conversation, receivedAt, sentAt, updates });
        }
        catch (error) {
            window.log.error(`maybeUpdateGroup/${logId}: Failed to update group:`, error && error.stack ? error.stack : error);
            throw error;
        }
    }
    exports.maybeUpdateGroup = maybeUpdateGroup;
    async function updateGroup({ conversation, receivedAt, sentAt, updates, }) {
        const { newAttributes, groupChangeMessages, members } = updates;
        const startingRevision = conversation.get('revision');
        const endingRevision = newAttributes.revision;
        const isInitialDataFetch = !lodash_1.isNumber(startingRevision) && lodash_1.isNumber(endingRevision);
        // Ensure that all generated messages are ordered properly.
        // Before the provided timestamp so update messages appear before the
        //   initiating message, or after now().
        const finalReceivedAt = receivedAt || Date.now();
        const finalSentAt = sentAt || Date.now();
        // GroupV1 -> GroupV2 migration changes the groupId, and we need to update our id-based
        //   lookups if there's a change on that field.
        const previousId = conversation.get('groupId');
        const idChanged = previousId && previousId !== newAttributes.groupId;
        conversation.set(Object.assign(Object.assign({}, newAttributes), {
            // We force this conversation into the left pane if this is the first time we've
            //   fetched data about it, and we were able to fetch its name. Nobody likes to see
            //   Unknown Group in the left pane.
            active_at: isInitialDataFetch && newAttributes.name
                ? finalReceivedAt
                : newAttributes.active_at
        }));
        if (idChanged) {
            conversation.trigger('idUpdated', conversation, 'groupId', previousId);
        }
        // Save all synthetic messages describing group changes
        let syntheticSentAt = finalSentAt - (groupChangeMessages.length + 1);
        const changeMessagesToSave = groupChangeMessages.map(changeMessage => {
            // We do this to preserve the order of the timeline. We only update sentAt to ensure
            //   that we don't stomp on messages received around the same time as the message
            //   which initiated this group fetch and in-conversation messages.
            syntheticSentAt += 1;
            return Object.assign(Object.assign({}, changeMessage), { conversationId: conversation.id, received_at: finalReceivedAt, sent_at: syntheticSentAt });
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
                contact.setProfileKey(member.profileKey);
            }
        });
        // No need for convo.updateLastMessage(), 'newmessage' handler does that
    }
    async function getGroupUpdates({ dropInitialJoinMessage, group, serverPublicParamsBase64, newRevision, groupChangeBase64, }) {
        const logId = idForLogging(group);
        window.log.info(`getGroupUpdates/${logId}: Starting...`);
        const currentRevision = group.revision;
        const isFirstFetch = !lodash_1.isNumber(group.revision);
        const isInitialCreationMessage = isFirstFetch && newRevision === 0;
        const isOneVersionUp = lodash_1.isNumber(currentRevision) &&
            lodash_1.isNumber(newRevision) &&
            newRevision === currentRevision + 1;
        if (groupChangeBase64 &&
            lodash_1.isNumber(newRevision) &&
            (isInitialCreationMessage || isOneVersionUp)) {
            window.log.info(`getGroupUpdates/${logId}: Processing just one change`);
            const groupChangeBuffer = Crypto_1.base64ToArrayBuffer(groupChangeBase64);
            const groupChange = window.textsecure.protobuf.GroupChange.decode(groupChangeBuffer);
            const isChangeSupported = !lodash_1.isNumber(groupChange.changeEpoch) ||
                groupChange.changeEpoch <= SUPPORTED_CHANGE_EPOCH;
            if (isChangeSupported) {
                return integrateGroupChange({ group, newRevision, groupChange });
            }
            window.log.info(`getGroupUpdates/${logId}: Failing over; group change unsupported`);
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
                catch (subError) {
                    if (subError.code === GROUP_ACCESS_DENIED_CODE) {
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
            throw error;
        }
    }
    function generateBasicMessage() {
        return {
            id: uuid_1.v4(),
            schemaVersion: message_1.CURRENT_SCHEMA_VERSION,
        };
    }
    function generateLeftGroupChanges(group) {
        const logId = idForLogging(group);
        window.log.info(`generateLeftGroupChanges/${logId}: Starting...`);
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
            // eslint-disable-next-line no-await-in-loop
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
        const logId = idForLogging(group);
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
                const { groupChange, groupState } = changeState;
                if (!groupChange || !groupState) {
                    window.log.warn('integrateGroupChanges: item had neither groupState nor groupChange. Skipping.');
                    continue;
                }
                try {
                    const { newAttributes, groupChangeMessages, members, } = await integrateGroupChange({
                        group: attributes,
                        newRevision,
                        groupChange,
                        groupState,
                    });
                    attributes = newAttributes;
                    finalMessages.push(groupChangeMessages);
                    finalMembers.push(members);
                }
                catch (error) {
                    window.log.error(`integrateGroupChanges/${logId}: Failed to apply change log, continuing to apply remaining change logs.`, error && error.stack ? error.stack : error);
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
    async function integrateGroupChange({ group, groupChange, groupState, newRevision, }) {
        const logId = idForLogging(group);
        if (!group.secretParams) {
            throw new Error(`integrateGroupChange/${logId}: Group was missing secretParams!`);
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
        const isChangeSupported = !lodash_1.isNumber(groupChange.changeEpoch) ||
            groupChange.changeEpoch <= SUPPORTED_CHANGE_EPOCH;
        const isFirstFetch = !lodash_1.isNumber(group.revision);
        const isMoreThanOneVersionUp = groupChangeActions.version &&
            lodash_1.isNumber(group.revision) &&
            groupChangeActions.version > group.revision + 1;
        if (!isChangeSupported || isFirstFetch || isMoreThanOneVersionUp) {
            if (!groupState) {
                throw new Error(`integrateGroupChange/${logId}: No group state, but we can't apply changes!`);
            }
            window.log.info(`integrateGroupChange/${logId}: Applying full group state, from version ${group.revision} to ${groupState.version}`, {
                isChangeSupported,
            });
            const decryptedGroupState = decryptGroupState(groupState, group.secretParams, logId);
            const newAttributes = await applyGroupState({
                group,
                groupState: decryptedGroupState,
                sourceConversationId: isFirstFetch ? sourceConversationId : undefined,
            });
            return {
                newAttributes,
                groupChangeMessages: extractDiffs({
                    old: group,
                    current: newAttributes,
                    sourceConversationId: isFirstFetch ? sourceConversationId : undefined,
                }),
                members: getMembers(decryptedGroupState),
            };
        }
        window.log.info(`integrateGroupChange/${logId}: Applying group change actions, from version ${group.revision} to ${groupChangeActions.version}`);
        const { newAttributes, newProfileKeys } = await applyGroupChange({
            group,
            actions: decryptedChangeActions,
            sourceConversationId,
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
        const newAttributes = await applyGroupState({
            group,
            groupState: decryptedGroupState,
        });
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
    function extractDiffs({ current, dropInitialJoinMessage, old, sourceConversationId, }) {
        var _a, _b;
        const logId = idForLogging(old);
        const details = [];
        const ourConversationId = window.ConversationController.getOurConversationId();
        let areWeInGroup = false;
        let areWeInvitedToGroup = false;
        let whoInvitedUsUserId = null;
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
                if (pendingMember) {
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
            if (ourConversationId && conversationId === ourConversationId) {
                areWeInvitedToGroup = true;
                whoInvitedUsUserId = currentPendingMember.addedByUserId;
            }
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
        // Here we hardcode initial messages if this is our first time processing data this
        //   group. Ideally we can collapse it down to just one of: 'you were added',
        //   'you were invited', or 'you created.'
        if (firstUpdate && ourConversationId && areWeInvitedToGroup) {
            // Note, we will add 'you were invited' to group even if dropInitialJoinMessage = true
            message = Object.assign(Object.assign({}, generateBasicMessage()), {
                type: 'group-v2-change', groupV2Change: {
                    from: whoInvitedUsUserId || sourceConversationId,
                    details: [
                        {
                            type: 'pending-add-one',
                            conversationId: ourConversationId,
                        },
                    ],
                }
            });
        }
        else if (firstUpdate && dropInitialJoinMessage) {
            // None of the rest of the messages should be added if dropInitialJoinMessage = true
            message = undefined;
        }
        else if (firstUpdate &&
            ourConversationId &&
            sourceConversationId &&
            sourceConversationId === ourConversationId) {
            message = Object.assign(Object.assign({}, generateBasicMessage()), {
                type: 'group-v2-change', groupV2Change: {
                    from: sourceConversationId,
                    details: [
                        {
                            type: 'create',
                        },
                    ],
                }
            });
        }
        else if (firstUpdate && ourConversationId && areWeInGroup) {
            message = Object.assign(Object.assign({}, generateBasicMessage()), {
                type: 'group-v2-change', groupV2Change: {
                    from: sourceConversationId,
                    details: [
                        {
                            type: 'member-add',
                            conversationId: ourConversationId,
                        },
                    ],
                }
            });
        }
        else if (firstUpdate) {
            message = Object.assign(Object.assign({}, generateBasicMessage()), {
                type: 'group-v2-change', groupV2Change: {
                    from: sourceConversationId,
                    details: [
                        {
                            type: 'create',
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
            profileKey: Crypto_1.arrayBufferToBase64(member.profileKey),
            uuid: member.userId,
        }));
    }
    async function applyGroupChange({ actions, group, sourceConversationId, }) {
        const logId = idForLogging(group);
        const ourConversationId = window.ConversationController.getOurConversationId();
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
        (actions.addMembers || []).forEach(addMember => {
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
            // Capture who added us
            if (ourConversationId &&
                sourceConversationId &&
                conversation.id === ourConversationId) {
                result.addedBy = sourceConversationId;
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
        // modifyMemberProfileKeys?:
        // Array<GroupChangeClass.Actions.ModifyMemberProfileKeyAction>;
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
                role: added.member.role || MEMBER_ROLE_ENUM.DEFAULT,
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
            const previousRecord = pendingMembers[conversation.id];
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
                role: previousRecord.role || MEMBER_ROLE_ENUM.DEFAULT,
            };
            newProfileKeys.push({
                profileKey,
                uuid,
            });
        });
        // modifyTitle?: GroupChangeClass.Actions.ModifyTitleAction;
        if (actions.modifyTitle) {
            const { title } = actions.modifyTitle;
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
            const { avatar } = actions.modifyAvatar;
            await applyNewAvatar(avatar, result, logId);
        }
        // modifyDisappearingMessagesTimer?:
        // GroupChangeClass.Actions.ModifyDisappearingMessagesTimerAction;
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
        // modifyAttributesAccess?:
        // GroupChangeClass.Actions.ModifyAttributesAccessControlAction;
        if (actions.modifyAttributesAccess) {
            result.accessControl = Object.assign(Object.assign({}, result.accessControl), { attributes: actions.modifyAttributesAccess.attributesAccess || ACCESS_ENUM.MEMBER });
        }
        // modifyMemberAccess?: GroupChangeClass.Actions.ModifyMembersAccessControlAction;
        if (actions.modifyMemberAccess) {
            result.accessControl = Object.assign(Object.assign({}, result.accessControl), { members: actions.modifyMemberAccess.membersAccess || ACCESS_ENUM.MEMBER });
        }
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
    // Ovewriting result.avatar as part of functionality
    /* eslint-disable no-param-reassign */
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
    /* eslint-enable no-param-reassign */
    async function applyGroupState({ group, groupState, sourceConversationId, }) {
        const logId = idForLogging(group);
        const ACCESS_ENUM = window.textsecure.protobuf.AccessControl.AccessRequired;
        const MEMBER_ROLE_ENUM = window.textsecure.protobuf.Member.Role;
        const version = groupState.version || 0;
        const result = Object.assign({}, group);
        // version
        result.revision = version;
        // title
        // Note: During decryption, title becomes a GroupAttributeBlob
        const { title } = groupState;
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
        const { disappearingMessagesTimer } = groupState;
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
                    // Capture who added us if we were previously not in group
                    if (sourceConversationId &&
                        (result.membersV2 || []).every(item => item.conversationId !== ourConversationId)) {
                        result.addedBy = sourceConversationId;
                    }
                }
                if (!isValidRole(member.role)) {
                    throw new Error('applyGroupState: Member had invalid role');
                }
                return {
                    role: member.role || MEMBER_ROLE_ENUM.DEFAULT,
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
                    throw new Error('applyGroupState: Pending member did not have an associated userId');
                }
                if (member.addedByUserId) {
                    invitedBy = window.ConversationController.getOrCreate(member.addedByUserId, 'private');
                }
                else {
                    throw new Error('applyGroupState: Pending member did not have an addedByUserID');
                }
                if (!isValidRole(member.member.role)) {
                    throw new Error('applyGroupState: Pending member had invalid role');
                }
                return {
                    addedByUserId: invitedBy.id,
                    conversationId: pending.id,
                    timestamp: member.timestamp,
                    role: member.member.role || MEMBER_ROLE_ENUM.DEFAULT,
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
    function decryptGroupChange(_actions, groupSecretParams, logId) {
        const clientZkGroupCipher = zkgroup_1.getClientZkGroupCipher(groupSecretParams);
        const actions = _actions;
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
        actions.addMembers = lodash_1.compact((actions.addMembers || []).map(_addMember => {
            const addMember = _addMember;
            if (addMember.added) {
                const decrypted = decryptMember(clientZkGroupCipher, addMember.added, logId);
                if (!decrypted) {
                    return null;
                }
                addMember.added = decrypted;
                return addMember;
            }
            throw new Error('decryptGroupChange: AddMember was missing added field!');
        }));
        // deleteMembers?: Array<GroupChangeClass.Actions.DeleteMemberAction>;
        actions.deleteMembers = lodash_1.compact((actions.deleteMembers || []).map(_deleteMember => {
            const deleteMember = _deleteMember;
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
        actions.modifyMemberRoles = lodash_1.compact((actions.modifyMemberRoles || []).map(_modifyMember => {
            const modifyMember = _modifyMember;
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
        // modifyMemberProfileKeys?:
        // Array<GroupChangeClass.Actions.ModifyMemberProfileKeyAction>;
        actions.modifyMemberProfileKeys = lodash_1.compact((actions.modifyMemberProfileKeys || []).map(_modifyMemberProfileKey => {
            const modifyMemberProfileKey = _modifyMemberProfileKey;
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
        actions.addPendingMembers = lodash_1.compact((actions.addPendingMembers || []).map(_addPendingMember => {
            const addPendingMember = _addPendingMember;
            if (addPendingMember.added) {
                const decrypted = decryptPendingMember(clientZkGroupCipher, addPendingMember.added, logId);
                if (!decrypted) {
                    return null;
                }
                addPendingMember.added = decrypted;
                return addPendingMember;
            }
            throw new Error('decryptGroupChange: addPendingMember was missing added field!');
        }));
        // deletePendingMembers?: Array<GroupChangeClass.Actions.DeletePendingMemberAction>;
        actions.deletePendingMembers = lodash_1.compact((actions.deletePendingMembers || []).map(_deletePendingMember => {
            const deletePendingMember = _deletePendingMember;
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
        actions.promotePendingMembers = lodash_1.compact((actions.promotePendingMembers || []).map(_promotePendingMember => {
            const promotePendingMember = _promotePendingMember;
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
        // modifyDisappearingMessagesTimer?:
        // GroupChangeClass.Actions.ModifyDisappearingMessagesTimerAction;
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
        // modifyAttributesAccess?:
        // GroupChangeClass.Actions.ModifyAttributesAccessControlAction;
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
    function decryptGroupState(_groupState, groupSecretParams, logId) {
        const clientZkGroupCipher = zkgroup_1.getClientZkGroupCipher(groupSecretParams);
        const groupState = _groupState;
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
    function decryptMember(clientZkGroupCipher, _member, logId) {
        const member = _member;
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
    function decryptPendingMember(clientZkGroupCipher, _member, logId) {
        const member = _member;
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
    function getMembershipList(conversationId) {
        const conversation = window.ConversationController.get(conversationId);
        if (!conversation) {
            throw new Error('getMembershipList: cannot find conversation');
        }
        const secretParams = conversation.get('secretParams');
        if (!secretParams) {
            throw new Error('getMembershipList: no secretParams');
        }
        const clientZkGroupCipher = zkgroup_1.getClientZkGroupCipher(secretParams);
        return conversation.getMembers().map(member => {
            const uuid = member.get('uuid');
            if (!uuid) {
                throw new Error('getMembershipList: member has no UUID');
            }
            const uuidCiphertext = zkgroup_1.encryptUuid(clientZkGroupCipher, uuid);
            return { uuid, uuidCiphertext };
        });
    }
    exports.getMembershipList = getMembershipList;
});