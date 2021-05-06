require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    /* tslint:disable no-backbone-get-set-outside-model */
    const lodash_1 = __importDefault(require("lodash"));
    const Crypto_1 = require("../Crypto");
    const Client_1 = __importDefault(require("../sql/Client"));
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
            conversation.set({
                storageUnknownFields: Crypto_1.arrayBufferToBase64(record.__unknownFields),
            });
        }
    }
    function applyUnknownFields(record, conversation) {
        if (conversation.get('storageUnknownFields')) {
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
    function doesRecordHavePendingChanges(mergedRecord, serviceRecord, conversation) {
        const shouldSync = Boolean(conversation.get('needsStorageServiceSync'));
        const hasConflict = !lodash_1.default.isEqual(mergedRecord, serviceRecord);
        if (shouldSync && !hasConflict) {
            conversation.set({ needsStorageServiceSync: false });
        }
        return shouldSync && hasConflict;
    }
    async function mergeGroupV1Record(storageID, groupV1Record) {
        window.log.info(`storageService.mergeGroupV1Record: merging ${storageID}`);
        if (!groupV1Record.id) {
            window.log.info(`storageService.mergeGroupV1Record: no ID for ${storageID}`);
            return false;
        }
        const groupId = groupV1Record.id.toBinary();
        // We do a get here because we don't get enough information from just this source to
        //   be able to do the right thing with this group. So we'll update the local group
        //   record if we have one; otherwise we'll just drop this update.
        const conversation = window.ConversationController.get(groupId);
        if (!conversation) {
            window.log.warn(`storageService.mergeGroupV1Record: No conversation for group(${groupId})`);
            return false;
        }
        conversation.set({
            isArchived: Boolean(groupV1Record.archived),
            storageID,
        });
        applyMessageRequestState(groupV1Record, conversation);
        addUnknownFields(groupV1Record, conversation);
        const hasPendingChanges = doesRecordHavePendingChanges(await toGroupV1Record(conversation), groupV1Record, conversation);
        updateConversation(conversation.attributes);
        window.log.info(`storageService.mergeGroupV1Record: merged ${storageID}`);
        return hasPendingChanges;
    }
    exports.mergeGroupV1Record = mergeGroupV1Record;
    async function mergeContactRecord(storageID, contactRecord) {
        window.log.info(`storageService.mergeContactRecord: merging ${storageID}`);
        window.normalizeUuids(contactRecord, ['serviceUuid'], 'storageService.mergeContactRecord');
        const e164 = contactRecord.serviceE164 || undefined;
        const uuid = contactRecord.serviceUuid || undefined;
        const id = window.ConversationController.ensureContactIds({
            e164,
            uuid,
            highTrust: true,
        });
        if (!id) {
            window.log.info(`storageService.mergeContactRecord: no ID for ${storageID}`);
            return false;
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
        window.log.info(`storageService.mergeContactRecord: merged ${storageID}`);
        return hasPendingChanges;
    }
    exports.mergeContactRecord = mergeContactRecord;
    async function mergeAccountRecord(storageID, accountRecord) {
        window.log.info(`storageService.mergeAccountRecord: merging ${storageID}`);
        const { avatarUrl, linkPreviews, noteToSelfArchived, profileKey, readReceipts, sealedSenderIndicators, typingIndicators, } = accountRecord;
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
        window.log.info(`storageService.mergeAccountRecord: merged settings ${storageID}`);
        const ourID = window.ConversationController.getOurConversationId();
        if (!ourID) {
            return false;
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
        window.log.info(`storageService.mergeAccountRecord: merged profile ${storageID}`);
        return hasPendingChanges;
    }
    exports.mergeAccountRecord = mergeAccountRecord;
});