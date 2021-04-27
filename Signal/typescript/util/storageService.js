require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const p_queue_1 = __importDefault(require("p-queue"));
    const Crypto_1 = __importDefault(require("../textsecure/Crypto"));
    const Crypto_2 = require("../Crypto");
    function fromRecordVerified(verified) {
        const VERIFIED_ENUM = window.textsecure.storage.protocol.VerifiedStatus;
        const STATE_ENUM = window.textsecure.protobuf.ContactRecord.IdentityState;
        switch (verified) {
            case STATE_ENUM.VERIFIED:
                return VERIFIED_ENUM.VERIFIED;
            case STATE_ENUM.UNVERIFIED:
                return VERIFIED_ENUM.UNVERIFIED;
            default:
                return VERIFIED_ENUM.DEFAULT;
        }
    }
    async function fetchManifest(manifestVersion) {
        window.log.info('storageService.fetchManifest');
        if (!window.textsecure.messaging) {
            throw new Error('fetchManifest: We are offline!');
        }
        try {
            const credentials = await window.textsecure.messaging.getStorageCredentials();
            window.storage.put('storageCredentials', credentials);
            const manifestBinary = await window.textsecure.messaging.getStorageManifest({
                credentials,
                greaterThanVersion: manifestVersion,
            });
            const encryptedManifest = window.textsecure.protobuf.StorageManifest.decode(manifestBinary);
            // If we don't get a value we're assuming we're receiving a 204
            // it would be nice to get an actual e.code 204 and check against that.
            if (!encryptedManifest.value || !encryptedManifest.version) {
                window.log.info('storageService.fetchManifest: nothing changed');
                return;
            }
            const storageKeyBase64 = window.storage.get('storageKey');
            const storageKey = Crypto_2.base64ToArrayBuffer(storageKeyBase64);
            const storageManifestKey = await Crypto_2.deriveStorageManifestKey(storageKey, encryptedManifest.version.toNumber());
            const decryptedManifest = await Crypto_1.default.decryptProfile(encryptedManifest.value.toArrayBuffer(), storageManifestKey);
            return window.textsecure.protobuf.ManifestRecord.decode(decryptedManifest);
        }
        catch (err) {
            window.log.error(`storageService.fetchManifest: ${err}`);
            if (err.code === 404) {
                // No manifest exists, we create one
                return { version: 0, keys: [] };
            }
            else if (err.code === 204) {
                // noNewerManifest we're ok
                return;
            }
            throw err;
        }
    }
    function applyMessageRequestState(record, conversation) {
        if (record.blocked) {
            conversation.applyMessageRequestResponse(conversation.messageRequestEnum.BLOCK, { fromSync: true });
        }
        else if (record.whitelisted) {
            // unblocking is also handled by this function which is why the next
            // condition is part of the else-if and not separate
            conversation.applyMessageRequestResponse(conversation.messageRequestEnum.ACCEPT, { fromSync: true });
        }
        else if (!record.blocked) {
            // if the condition above failed the state could still be blocked=false
            // in which case we should unblock the conversation
            conversation.unblock();
        }
        if (!record.whitelisted) {
            conversation.disableProfileSharing();
        }
    }
    async function mergeGroupV1Record(storageID, groupV1Record) {
        window.log.info(`storageService.mergeGroupV1Record: merging ${storageID}`);
        if (!groupV1Record.id) {
            window.log.info(`storageService.mergeGroupV1Record: no ID for ${storageID}`);
            return;
        }
        const conversation = await window.ConversationController.getOrCreateAndWait(groupV1Record.id.toBinary(), 'group');
        conversation.set({
            isArchived: Boolean(groupV1Record.archived),
            storageID,
        });
        applyMessageRequestState(groupV1Record, conversation);
        window.Signal.Data.updateConversation(conversation.attributes);
        window.log.info(`storageService.mergeGroupV1Record: merged ${storageID}`);
    }
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
            return;
        }
        const conversation = await window.ConversationController.getOrCreateAndWait(id, 'private');
        const verified = contactRecord.identityState
            ? fromRecordVerified(contactRecord.identityState)
            : window.textsecure.storage.protocol.VerifiedStatus.DEFAULT;
        conversation.set({
            isArchived: Boolean(contactRecord.archived),
            profileFamilyName: contactRecord.familyName,
            profileKey: contactRecord.profileKey
                ? Crypto_2.arrayBufferToBase64(contactRecord.profileKey.toArrayBuffer())
                : null,
            profileName: contactRecord.givenName,
            storageID,
            verified,
        });
        applyMessageRequestState(contactRecord, conversation);
        const identityKey = await window.textsecure.storage.protocol.loadIdentityKey(conversation.id);
        const identityKeyChanged = identityKey && contactRecord.identityKey
            ? !Crypto_2.constantTimeEqual(identityKey, contactRecord.identityKey.toArrayBuffer())
            : false;
        if (identityKeyChanged && contactRecord.identityKey) {
            await window.textsecure.storage.protocol.processVerifiedMessage(conversation.id, verified, contactRecord.identityKey.toArrayBuffer());
        }
        else if (conversation.get('verified')) {
            await window.textsecure.storage.protocol.setVerified(conversation.id, verified);
        }
        window.Signal.Data.updateConversation(conversation.attributes);
        window.log.info(`storageService.mergeContactRecord: merged ${storageID}`);
    }
    async function mergeAccountRecord(storageID, accountRecord) {
        window.log.info(`storageService.mergeAccountRecord: merging ${storageID}`);
        const { profileKey, linkPreviews, readReceipts, sealedSenderIndicators, typingIndicators, } = accountRecord;
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
            return;
        }
        const conversation = await window.ConversationController.getOrCreateAndWait(ourID, 'private');
        conversation.set({
            profileFamilyName: accountRecord.familyName,
            profileKey: accountRecord.profileKey
                ? Crypto_2.arrayBufferToBase64(accountRecord.profileKey.toArrayBuffer())
                : null,
            profileName: accountRecord.givenName,
            storageID,
        });
        window.Signal.Data.updateConversation(conversation.attributes);
        window.log.info(`storageService.mergeAccountRecord: merged profile ${storageID}`);
    }
    // tslint:disable-next-line max-func-body-length
    async function processManifest(manifest) {
        const credentials = window.storage.get('storageCredentials');
        const storageKeyBase64 = window.storage.get('storageKey');
        const storageKey = Crypto_2.base64ToArrayBuffer(storageKeyBase64);
        if (!window.textsecure.messaging) {
            throw new Error('processManifest: We are offline!');
        }
        const remoteKeysTypeMap = new Map();
        manifest.keys.forEach(key => {
            remoteKeysTypeMap.set(Crypto_2.arrayBufferToBase64(key.raw.toArrayBuffer()), key.type);
        });
        const localKeys = window
            .getConversations()
            .map((conversation) => conversation.get('storageID'))
            .filter(Boolean);
        window.log.info(`storageService.processManifest localKeys.length ${localKeys.length}`);
        const remoteKeys = Array.from(remoteKeysTypeMap.keys());
        const remoteOnly = remoteKeys.filter((key) => !localKeys.includes(key));
        window.log.info(`storageService.processManifest remoteOnly.length ${remoteOnly.length}`);
        const readOperation = new window.textsecure.protobuf.ReadOperation();
        readOperation.readKey = remoteOnly.map(Crypto_2.base64ToArrayBuffer);
        const storageItemsBuffer = await window.textsecure.messaging.getStorageRecords(readOperation.toArrayBuffer(), {
            credentials,
        });
        const storageItems = window.textsecure.protobuf.StorageItems.decode(storageItemsBuffer);
        if (!storageItems.items) {
            return false;
        }
        const queue = new p_queue_1.default({ concurrency: 4 });
        const mergedItems = storageItems.items.map((storageRecordWrapper) => async () => {
            const { key, value: storageItemCiphertext } = storageRecordWrapper;
            if (!key || !storageItemCiphertext) {
                return;
            }
            const base64ItemID = Crypto_2.arrayBufferToBase64(key.toArrayBuffer());
            const storageItemKey = await Crypto_2.deriveStorageItemKey(storageKey, base64ItemID);
            const storageItemPlaintext = await Crypto_1.default.decryptProfile(storageItemCiphertext.toArrayBuffer(), storageItemKey);
            const storageRecord = window.textsecure.protobuf.StorageRecord.decode(storageItemPlaintext);
            const itemType = remoteKeysTypeMap.get(base64ItemID);
            const ITEM_TYPE = window.textsecure.protobuf.ManifestRecord.Identifier.Type;
            try {
                if (itemType === ITEM_TYPE.UNKNOWN) {
                    window.log.info('storageService.processManifest: Unknown item type');
                }
                else if (itemType === ITEM_TYPE.CONTACT && storageRecord.contact) {
                    await mergeContactRecord(base64ItemID, storageRecord.contact);
                }
                else if (itemType === ITEM_TYPE.GROUPV1 && storageRecord.groupV1) {
                    await mergeGroupV1Record(base64ItemID, storageRecord.groupV1);
                }
                else if (itemType === ITEM_TYPE.GROUPV2 && storageRecord.groupV2) {
                    window.log.info('storageService.processManifest: Skipping GroupV2 item');
                }
                else if (itemType === ITEM_TYPE.ACCOUNT && storageRecord.account) {
                    await mergeAccountRecord(base64ItemID, storageRecord.account);
                }
            }
            catch (err) {
                window.log.error(`storageService.processManifest: merging record failed ${base64ItemID}`);
            }
        });
        try {
            await queue.addAll(mergedItems);
            await queue.onEmpty();
            return true;
        }
        catch (err) {
            window.log.error('storageService.processManifest: merging failed');
            return false;
        }
    }
    async function runStorageServiceSyncJob() {
        const localManifestVersion = window.storage.get('manifestVersion') || 0;
        let manifest;
        try {
            manifest = await fetchManifest(localManifestVersion);
            // Guarding against no manifests being returned, everything should be ok
            if (!manifest) {
                return;
            }
        }
        catch (err) {
            // We are supposed to retry here if it's a retryable error
            window.log.error(`storageService.runStorageServiceSyncJob: failed! ${err && err.stack ? err.stack : String(err)}`);
            return;
        }
        const version = manifest.version.toNumber();
        window.log.info(`runStorageServiceSyncJob: manifest versions - previous: ${localManifestVersion}, current: ${version}`);
        const shouldUpdateVersion = await processManifest(manifest);
        if (shouldUpdateVersion) {
            window.storage.put('manifestVersion', version);
        }
    }
    exports.runStorageServiceSyncJob = runStorageServiceSyncJob;
});