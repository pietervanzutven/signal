require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = require("lodash");
    const Crypto_1 = require("../Crypto");
    const Client_1 = __importDefault(require("../sql/Client"));
    const groups_1 = require("../groups");
    const { updateConversation } = Client_1.default;
    function toRecordVerified(verified) {
        const VERIFIED_ENUM = window.textsecure.storage.protocol.VerifiedStatus;
        const STATE_ENUM = window.textsecure.protobuf.ContactRecord.IdentityState;
        switch (verified) {
            case VERIFIED_ENUM.VERIFIED:
                return STATE_ENUM.VERIFIED;
            case VERIFIED_ENUM.UNVERIFIED:
                return STATE_ENUM.UNVERIFIED;
            default:
                return STATE_ENUM.DEFAULT;
        }
    }
    function addUnknownFields(record, conversation) {
        if (record.__unknownFields) {
            window.log.info(`storageService.addUnknownFields: Unknown fields found for ${conversation.get('id')}`);
            conversation.set({
                storageUnknownFields: Crypto_1.arrayBufferToBase64(record.__unknownFields),
            });
        }
    }
    function applyUnknownFields(record, conversation) {
        if (conversation.get('storageUnknownFields')) {
            window.log.info(`storageService.applyUnknownFields: Applying unknown fields for ${conversation.get('id')}`);
            // eslint-disable-next-line no-param-reassign
            record.__unknownFields = Crypto_1.base64ToArrayBuffer(conversation.get('storageUnknownFields'));
        }
    }
    async function toContactRecord(conversation) {
        const contactRecord = new window.textsecure.protobuf.ContactRecord();
        if (conversation.get('uuid')) {
            contactRecord.serviceUuid = conversation.get('uuid');
        }
        if (conversation.get('e164')) {
            contactRecord.serviceE164 = conversation.get('e164');
        }
        if (conversation.get('profileKey')) {
            contactRecord.profileKey = Crypto_1.base64ToArrayBuffer(String(conversation.get('profileKey')));
        }
        const identityKey = await window.textsecure.storage.protocol.loadIdentityKey(conversation.id);
        if (identityKey) {
            contactRecord.identityKey = identityKey;
        }
        if (conversation.get('verified')) {
            contactRecord.identityState = toRecordVerified(Number(conversation.get('verified')));
        }
        if (conversation.get('profileName')) {
            contactRecord.givenName = conversation.get('profileName');
        }
        if (conversation.get('profileFamilyName')) {
            contactRecord.familyName = conversation.get('profileFamilyName');
        }
        contactRecord.blocked = conversation.isBlocked();
        contactRecord.whitelisted = Boolean(conversation.get('profileSharing'));
        contactRecord.archived = Boolean(conversation.get('isArchived'));
        applyUnknownFields(contactRecord, conversation);
        return contactRecord;
    }
    exports.toContactRecord = toContactRecord;
    async function toAccountRecord(conversation) {
        const accountRecord = new window.textsecure.protobuf.AccountRecord();
        if (conversation.get('profileKey')) {
            accountRecord.profileKey = Crypto_1.base64ToArrayBuffer(String(conversation.get('profileKey')));
        }
        if (conversation.get('profileName')) {
            accountRecord.givenName = conversation.get('profileName') || '';
        }
        if (conversation.get('profileFamilyName')) {
            accountRecord.familyName = conversation.get('profileFamilyName') || '';
        }
        accountRecord.avatarUrl = window.storage.get('avatarUrl') || '';
        accountRecord.noteToSelfArchived = Boolean(conversation.get('isArchived'));
        accountRecord.readReceipts = Boolean(window.storage.get('read-receipt-setting'));
        accountRecord.sealedSenderIndicators = Boolean(window.storage.get('sealedSenderIndicators'));
        accountRecord.typingIndicators = Boolean(window.storage.get('typingIndicators'));
        accountRecord.linkPreviews = Boolean(window.storage.get('linkPreviews'));
        accountRecord.pinnedConversations = window.storage
            .get('pinnedConversationIds', [])
            .map(id => {
                const pinnedConversation = window.ConversationController.get(id);
                if (pinnedConversation) {
                    const pinnedConversationRecord = new window.textsecure.protobuf.AccountRecord.PinnedConversation();
                    if (pinnedConversation.get('type') === 'private') {
                        pinnedConversationRecord.identifier = 'contact';
                        pinnedConversationRecord.contact = {
                            uuid: pinnedConversation.get('uuid'),
                            e164: pinnedConversation.get('e164'),
                        };
                    }
                    else if (pinnedConversation.isGroupV1()) {
                        pinnedConversationRecord.identifier = 'legacyGroupId';
                        const groupId = pinnedConversation.get('groupId');
                        if (!groupId) {
                            throw new Error('toAccountRecord: trying to pin a v1 Group without groupId');
                        }
                        pinnedConversationRecord.legacyGroupId = Crypto_1.fromEncodedBinaryToArrayBuffer(groupId);
                    }
                    else if (pinnedConversation.isGroupV2()) {
                        pinnedConversationRecord.identifier = 'groupMasterKey';
                        const masterKey = pinnedConversation.get('masterKey');
                        if (!masterKey) {
                            throw new Error('toAccountRecord: trying to pin a v2 Group without masterKey');
                        }
                        pinnedConversationRecord.groupMasterKey = Crypto_1.base64ToArrayBuffer(masterKey);
                    }
                    return pinnedConversationRecord;
                }
                return undefined;
            })
            .filter((pinnedConversationClass) => pinnedConversationClass !== undefined);
        applyUnknownFields(accountRecord, conversation);
        return accountRecord;
    }
    exports.toAccountRecord = toAccountRecord;
    async function toGroupV1Record(conversation) {
        const groupV1Record = new window.textsecure.protobuf.GroupV1Record();
        groupV1Record.id = Crypto_1.fromEncodedBinaryToArrayBuffer(String(conversation.get('groupId')));
        groupV1Record.blocked = conversation.isBlocked();
        groupV1Record.whitelisted = Boolean(conversation.get('profileSharing'));
        groupV1Record.archived = Boolean(conversation.get('isArchived'));
        applyUnknownFields(groupV1Record, conversation);
        return groupV1Record;
    }
    exports.toGroupV1Record = toGroupV1Record;
    async function toGroupV2Record(conversation) {
        const groupV2Record = new window.textsecure.protobuf.GroupV2Record();
        const masterKey = conversation.get('masterKey');
        if (masterKey !== undefined) {
            groupV2Record.masterKey = Crypto_1.base64ToArrayBuffer(masterKey);
        }
        groupV2Record.blocked = conversation.isBlocked();
        groupV2Record.whitelisted = Boolean(conversation.get('profileSharing'));
        groupV2Record.archived = Boolean(conversation.get('isArchived'));
        applyUnknownFields(groupV2Record, conversation);
        return groupV2Record;
    }
    exports.toGroupV2Record = toGroupV2Record;
    function applyMessageRequestState(record, conversation) {
        if (record.blocked) {
            conversation.applyMessageRequestResponse(conversation.messageRequestEnum.BLOCK, { fromSync: true, viaStorageServiceSync: true });
        }
        else if (record.whitelisted) {
            // unblocking is also handled by this function which is why the next
            // condition is part of the else-if and not separate
            conversation.applyMessageRequestResponse(conversation.messageRequestEnum.ACCEPT, { fromSync: true, viaStorageServiceSync: true });
        }
        else if (!record.blocked) {
            // if the condition above failed the state could still be blocked=false
            // in which case we should unblock the conversation
            conversation.unblock({ viaStorageServiceSync: true });
        }
        if (!record.whitelisted) {
            conversation.disableProfileSharing({ viaStorageServiceSync: true });
        }
    }
    function doRecordsConflict(localRecord, remoteRecord, conversation) {
        const debugID = conversation.debugID();
        const localKeys = Object.keys(localRecord);
        const remoteKeys = Object.keys(remoteRecord);
        if (localKeys.length !== remoteKeys.length) {
            window.log.info('storageService.doRecordsConflict: Local keys do not match remote keys', debugID, localKeys.join(','), remoteKeys.join(','));
            return true;
        }
        return localKeys.reduce((hasConflict, key) => {
            const localValue = localRecord[key];
            const remoteValue = remoteRecord[key];
            if (Object.prototype.toString.call(localValue) === '[object ArrayBuffer]') {
                const isEqual = Crypto_1.arrayBufferToBase64(localValue) === Crypto_1.arrayBufferToBase64(remoteValue);
                if (!isEqual) {
                    window.log.info('storageService.doRecordsConflict: Conflict found for', key, debugID);
                }
                return hasConflict || !isEqual;
            }
            if (localValue === remoteValue) {
                return hasConflict || false;
            }
            // Sometimes we get `null` values from Protobuf and they should default to
            // false, empty string, or 0 for these records we do not count them as
            // conflicting.
            if (remoteValue === null &&
                (localValue === false || localValue === '' || localValue === 0)) {
                return hasConflict || false;
            }
            window.log.info('storageService.doRecordsConflict: Conflict found for', key, debugID);
            return true;
        }, false);
    }
    function doesRecordHavePendingChanges(mergedRecord, serviceRecord, conversation) {
        const shouldSync = Boolean(conversation.get('needsStorageServiceSync'));
        if (!shouldSync) {
            return false;
        }
        const hasConflict = doRecordsConflict(mergedRecord, serviceRecord, conversation);
        if (!hasConflict) {
            conversation.set({ needsStorageServiceSync: false });
        }
        return hasConflict;
    }
    async function mergeGroupV1Record(storageID, groupV1Record) {
        if (!groupV1Record.id) {
            throw new Error(`No ID for ${storageID}`);
        }
        const groupId = groupV1Record.id.toBinary();
        // We do a get here because we don't get enough information from just this source to
        //   be able to do the right thing with this group. So we'll update the local group
        //   record if we have one; otherwise we'll just drop this update.
        const conversation = window.ConversationController.get(groupId);
        if (!conversation) {
            throw new Error(`No conversation for group(${groupId})`);
        }
        if (!conversation.isGroupV1()) {
            throw new Error(`Record has group type mismatch ${conversation.debugID()}`);
        }
        conversation.set({
            isArchived: Boolean(groupV1Record.archived),
            storageID,
        });
        applyMessageRequestState(groupV1Record, conversation);
        addUnknownFields(groupV1Record, conversation);
        const hasPendingChanges = doesRecordHavePendingChanges(await toGroupV1Record(conversation), groupV1Record, conversation);
        updateConversation(conversation.attributes);
        return hasPendingChanges;
    }
    exports.mergeGroupV1Record = mergeGroupV1Record;
    async function mergeGroupV2Record(storageID, groupV2Record) {
        if (!groupV2Record.masterKey) {
            throw new Error(`No master key for ${storageID}`);
        }
        const masterKeyBuffer = groupV2Record.masterKey.toArrayBuffer();
        const groupFields = groups_1.deriveGroupFields(masterKeyBuffer);
        const groupId = Crypto_1.arrayBufferToBase64(groupFields.id);
        const masterKey = Crypto_1.arrayBufferToBase64(masterKeyBuffer);
        const secretParams = Crypto_1.arrayBufferToBase64(groupFields.secretParams);
        const publicParams = Crypto_1.arrayBufferToBase64(groupFields.publicParams);
        const now = Date.now();
        const conversationId = window.ConversationController.ensureGroup(groupId, {
            // We want this conversation to show in the left pane when we first learn about it
            active_at: now,
            timestamp: now,
            // Basic GroupV2 data
            groupVersion: 2,
            masterKey,
            secretParams,
            publicParams,
        });
        const conversation = window.ConversationController.get(conversationId);
        if (!conversation) {
            throw new Error(`No conversation for groupv2(${groupId})`);
        }
        conversation.maybeRepairGroupV2({
            masterKey,
            secretParams,
            publicParams,
        });
        conversation.set({
            isArchived: Boolean(groupV2Record.archived),
            storageID,
        });
        applyMessageRequestState(groupV2Record, conversation);
        addUnknownFields(groupV2Record, conversation);
        const hasPendingChanges = doesRecordHavePendingChanges(await toGroupV2Record(conversation), groupV2Record, conversation);
        updateConversation(conversation.attributes);
        const isFirstSync = !lodash_1.isNumber(window.storage.get('manifestVersion'));
        const dropInitialJoinMessage = isFirstSync;
        groups_1.waitThenMaybeUpdateGroup({
            conversation,
            dropInitialJoinMessage,
        });
        return hasPendingChanges;
    }
    exports.mergeGroupV2Record = mergeGroupV2Record;
    async function mergeContactRecord(storageID, contactRecord) {
        window.normalizeUuids(contactRecord, ['serviceUuid'], 'storageService.mergeContactRecord');
        const e164 = contactRecord.serviceE164 || undefined;
        const uuid = contactRecord.serviceUuid || undefined;
        const id = window.ConversationController.ensureContactIds({
            e164,
            uuid,
            highTrust: true,
        });
        if (!id) {
            throw new Error(`No ID for ${storageID}`);
        }
        const conversation = await window.ConversationController.getOrCreateAndWait(id, 'private');
        if (contactRecord.profileKey) {
            await conversation.setProfileKey(Crypto_1.arrayBufferToBase64(contactRecord.profileKey.toArrayBuffer()), { viaStorageServiceSync: true });
        }
        const verified = await conversation.safeGetVerified();
        const storageServiceVerified = contactRecord.identityState || 0;
        if (verified !== storageServiceVerified) {
            const verifiedOptions = { viaStorageServiceSync: true };
            const STATE_ENUM = window.textsecure.protobuf.ContactRecord.IdentityState;
            switch (storageServiceVerified) {
                case STATE_ENUM.VERIFIED:
                    await conversation.setVerified(verifiedOptions);
                    break;
                case STATE_ENUM.UNVERIFIED:
                    await conversation.setUnverified(verifiedOptions);
                    break;
                default:
                    await conversation.setVerifiedDefault(verifiedOptions);
            }
        }
        applyMessageRequestState(contactRecord, conversation);
        addUnknownFields(contactRecord, conversation);
        conversation.set({
            isArchived: Boolean(contactRecord.archived),
            storageID,
        });
        const hasPendingChanges = doesRecordHavePendingChanges(await toContactRecord(conversation), contactRecord, conversation);
        updateConversation(conversation.attributes);
        return hasPendingChanges;
    }
    exports.mergeContactRecord = mergeContactRecord;
    async function mergeAccountRecord(storageID, accountRecord) {
        const { avatarUrl, linkPreviews, noteToSelfArchived, pinnedConversations: remotelyPinnedConversationClasses, profileKey, readReceipts, sealedSenderIndicators, typingIndicators, } = accountRecord;
        window.storage.put('read-receipt-setting', readReceipts);
        if (typeof sealedSenderIndicators === 'boolean') {
            window.storage.put('sealedSenderIndicators', sealedSenderIndicators);
        }
        if (typeof typingIndicators === 'boolean') {
            window.storage.put('typingIndicators', typingIndicators);
        }
        if (typeof linkPreviews === 'boolean') {
            window.storage.put('linkPreviews', linkPreviews);
        }
        if (profileKey) {
            window.storage.put('profileKey', profileKey.toArrayBuffer());
        }
        if (remotelyPinnedConversationClasses) {
            const locallyPinnedConversations = window.ConversationController._conversations.filter(conversation => Boolean(conversation.get('isPinned')));
            const remotelyPinnedConversationPromises = remotelyPinnedConversationClasses.map(async (pinnedConversation) => {
                let conversationId;
                let conversationType = 'private';
                switch (pinnedConversation.identifier) {
                    case 'contact': {
                        if (!pinnedConversation.contact) {
                            throw new Error('mergeAccountRecord: no contact found');
                        }
                        conversationId = window.ConversationController.ensureContactIds(pinnedConversation.contact);
                        conversationType = 'private';
                        break;
                    }
                    case 'legacyGroupId': {
                        if (!pinnedConversation.legacyGroupId) {
                            throw new Error('mergeAccountRecord: no legacyGroupId found');
                        }
                        conversationId = pinnedConversation.legacyGroupId.toBinary();
                        conversationType = 'group';
                        break;
                    }
                    case 'groupMasterKey': {
                        if (!pinnedConversation.groupMasterKey) {
                            throw new Error('mergeAccountRecord: no groupMasterKey found');
                        }
                        const masterKeyBuffer = pinnedConversation.groupMasterKey.toArrayBuffer();
                        const groupFields = groups_1.deriveGroupFields(masterKeyBuffer);
                        const groupId = Crypto_1.arrayBufferToBase64(groupFields.id);
                        conversationId = groupId;
                        conversationType = 'group';
                        break;
                    }
                    default: {
                        window.log.error('mergeAccountRecord: Invalid identifier received');
                    }
                }
                if (!conversationId) {
                    window.log.error(`mergeAccountRecord: missing conversation id. looking based on ${pinnedConversation.identifier}`);
                    return undefined;
                }
                if (conversationType === 'private') {
                    return window.ConversationController.getOrCreateAndWait(conversationId, conversationType);
                }
                return window.ConversationController.get(conversationId);
            });
            const remotelyPinnedConversations = (await Promise.all(remotelyPinnedConversationPromises)).filter((conversation) => conversation !== undefined);
            const remotelyPinnedConversationIds = remotelyPinnedConversations.map(({ id }) => id);
            const conversationsToUnpin = locallyPinnedConversations.filter(({ id }) => !remotelyPinnedConversationIds.includes(id));
            window.log.info(`mergeAccountRecord: unpinning ${conversationsToUnpin.length} conversations`);
            window.log.info(`mergeAccountRecord: pinning ${conversationsToUnpin.length} conversations`);
            conversationsToUnpin.forEach(conversation => {
                conversation.set({ isPinned: false, pinIndex: undefined });
                updateConversation(conversation.attributes);
            });
            remotelyPinnedConversations.forEach((conversation, index) => {
                conversation.set({ isPinned: true, pinIndex: index });
                updateConversation(conversation.attributes);
            });
            window.storage.put('pinnedConversationIds', remotelyPinnedConversationIds);
        }
        const ourID = window.ConversationController.getOurConversationId();
        if (!ourID) {
            throw new Error('Could not find ourID');
        }
        const conversation = await window.ConversationController.getOrCreateAndWait(ourID, 'private');
        addUnknownFields(accountRecord, conversation);
        conversation.set({
            isArchived: Boolean(noteToSelfArchived),
            storageID,
        });
        if (accountRecord.profileKey) {
            await conversation.setProfileKey(Crypto_1.arrayBufferToBase64(accountRecord.profileKey.toArrayBuffer()));
        }
        if (avatarUrl) {
            await conversation.setProfileAvatar(avatarUrl);
            window.storage.put('avatarUrl', avatarUrl);
        }
        const hasPendingChanges = doesRecordHavePendingChanges(await toAccountRecord(conversation), accountRecord, conversation);
        updateConversation(conversation.attributes);
        return hasPendingChanges;
    }
    exports.mergeAccountRecord = mergeAccountRecord;
});