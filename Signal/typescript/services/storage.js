require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    /* tslint:disable no-backbone-get-set-outside-model */
    const lodash_1 = __importDefault(require("lodash"));
    const p_map_1 = __importDefault(require("p-map"));
    const Crypto_1 = __importDefault(require("../textsecure/Crypto"));
    const Client_1 = __importDefault(require("../sql/Client"));
    const Crypto_2 = require("../Crypto");
    const storageRecordOps_1 = require("./storageRecordOps");
    const { eraseStorageServiceStateFromConversations, updateConversation, } = Client_1.default;
    let consecutiveConflicts = 0;
    function createWriteOperation(storageManifest, newItems, deleteKeys, clearAll = false) {
        const writeOperation = new window.textsecure.protobuf.WriteOperation();
        writeOperation.manifest = storageManifest;
        writeOperation.insertItem = newItems;
        writeOperation.deleteKey = deleteKeys;
        writeOperation.clearAll = clearAll;
        return writeOperation;
    }
    async function encryptRecord(storageID, storageRecord) {
        const storageItem = new window.textsecure.protobuf.StorageItem();
        const storageKeyBuffer = storageID
            ? Crypto_2.base64ToArrayBuffer(String(storageID))
            : generateStorageID();
        const storageKeyBase64 = window.storage.get('storageKey');
        const storageKey = Crypto_2.base64ToArrayBuffer(storageKeyBase64);
        const storageItemKey = await Crypto_2.deriveStorageItemKey(storageKey, Crypto_2.arrayBufferToBase64(storageKeyBuffer));
        const encryptedRecord = await Crypto_1.default.encryptProfile(storageRecord.toArrayBuffer(), storageItemKey);
        storageItem.key = storageKeyBuffer;
        storageItem.value = encryptedRecord;
        return storageItem;
    }
    function generateStorageID() {
        return Crypto_1.default.getRandomBytes(16);
    }
    /* tslint:disable-next-line max-func-body-length */
    async function generateManifest(version, isNewManifest = false) {
        window.log.info(`storageService.generateManifest: generating manifest for version ${version}. Is new? ${isNewManifest}`);
        const ITEM_TYPE = window.textsecure.protobuf.ManifestRecord.Identifier.Type;
        const conversationsToUpdate = [];
        const deleteKeys = [];
        const manifestRecordKeys = new Set();
        const newItems = new Set();
        const conversations = window.getConversations();
        for (let i = 0; i < conversations.length; i += 1) {
            const conversation = conversations.models[i];
            const identifier = new window.textsecure.protobuf.ManifestRecord.Identifier();
            let storageRecord;
            if (conversation.isMe()) {
                storageRecord = new window.textsecure.protobuf.StorageRecord();
                // eslint-disable-next-line no-await-in-loop
                storageRecord.account = await storageRecordOps_1.toAccountRecord(conversation);
                identifier.type = ITEM_TYPE.ACCOUNT;
            }
            else if (conversation.isPrivate()) {
                storageRecord = new window.textsecure.protobuf.StorageRecord();
                // eslint-disable-next-line no-await-in-loop
                storageRecord.contact = await storageRecordOps_1.toContactRecord(conversation);
                identifier.type = ITEM_TYPE.CONTACT;
            }
            else if ((conversation.get('groupVersion') || 0) > 1) {
                storageRecord = new window.textsecure.protobuf.StorageRecord();
                // eslint-disable-next-line no-await-in-loop
                storageRecord.groupV1 = await storageRecordOps_1.toGroupV2Record(conversation);
                identifier.type = ITEM_TYPE.GROUPV2;
            }
            else {
                storageRecord = new window.textsecure.protobuf.StorageRecord();
                // eslint-disable-next-line no-await-in-loop
                storageRecord.groupV1 = await storageRecordOps_1.toGroupV1Record(conversation);
                identifier.type = ITEM_TYPE.GROUPV1;
            }
            if (storageRecord) {
                const isNewItem = isNewManifest || Boolean(conversation.get('needsStorageServiceSync'));
                const storageID = isNewItem
                    ? Crypto_2.arrayBufferToBase64(generateStorageID())
                    : conversation.get('storageID');
                // eslint-disable-next-line no-await-in-loop
                const storageItem = await encryptRecord(storageID, storageRecord);
                identifier.raw = storageItem.key;
                // When a client needs to update a given record it should create it
                // under a new key and delete the existing key.
                if (isNewItem) {
                    newItems.add(storageItem);
                    const oldStorageID = conversation.get('storageID');
                    if (oldStorageID) {
                        deleteKeys.push(Crypto_2.base64ToArrayBuffer(oldStorageID));
                    }
                    conversationsToUpdate.push({
                        conversation,
                        storageID,
                    });
                }
                manifestRecordKeys.add(identifier);
            }
        }
        const unknownRecordsArray = window.storage.get('storage-service-unknown-records') || [];
        window.log.info(`storageService.generateManifest: adding ${unknownRecordsArray.length} unknown records`);
        // When updating the manifest, ensure all "unknown" keys are added to the
        // new manifest, so we don't inadvertently delete something we don't understand
        unknownRecordsArray.forEach((record) => {
            const identifier = new window.textsecure.protobuf.ManifestRecord.Identifier();
            identifier.type = record.itemType;
            identifier.raw = Crypto_2.base64ToArrayBuffer(record.storageID);
            manifestRecordKeys.add(identifier);
        });
        const manifestRecord = new window.textsecure.protobuf.ManifestRecord();
        manifestRecord.version = version;
        manifestRecord.keys = Array.from(manifestRecordKeys);
        const storageKeyBase64 = window.storage.get('storageKey');
        const storageKey = Crypto_2.base64ToArrayBuffer(storageKeyBase64);
        const storageManifestKey = await Crypto_2.deriveStorageManifestKey(storageKey, version);
        const encryptedManifest = await Crypto_1.default.encryptProfile(manifestRecord.toArrayBuffer(), storageManifestKey);
        const storageManifest = new window.textsecure.protobuf.StorageManifest();
        storageManifest.version = version;
        storageManifest.value = encryptedManifest;
        return {
            conversationsToUpdate,
            deleteKeys,
            newItems,
            storageManifest,
        };
    }
    async function uploadManifest(version, { conversationsToUpdate, deleteKeys, newItems, storageManifest, }) {
        if (!window.textsecure.messaging) {
            throw new Error('storageService.uploadManifest: We are offline!');
        }
        const credentials = window.storage.get('storageCredentials');
        try {
            window.log.info(`storageService.uploadManifest: inserting ${newItems.size} items, deleting ${deleteKeys.length} keys`);
            const writeOperation = createWriteOperation(storageManifest, Array.from(newItems), deleteKeys);
            window.log.info('storageService.uploadManifest: uploading...');
            await window.textsecure.messaging.modifyStorageRecords(writeOperation.toArrayBuffer(), {
                credentials,
            });
            window.log.info(`storageService.uploadManifest: upload done, updating ${conversationsToUpdate.length} conversation(s) with new storageIDs`);
            // update conversations with the new storageID
            conversationsToUpdate.forEach(({ conversation, storageID }) => {
                conversation.set({
                    needsStorageServiceSync: false,
                    storageID,
                });
                updateConversation(conversation.attributes);
            });
        }
        catch (err) {
            window.log.error(`storageService.uploadManifest: failed! ${err && err.stack ? err.stack : String(err)}`);
            if (err.code === 409) {
                window.log.info(`storageService.uploadManifest: Conflict found, running sync job times(${consecutiveConflicts})`);
                if (consecutiveConflicts > 3) {
                    window.log.error('storageService.uploadManifest: Exceeded maximum consecutive conflicts');
                    return;
                }
                consecutiveConflicts += 1;
                throw err;
            }
            throw err;
        }
        window.log.info('storageService.uploadManifest: setting new manifestVersion', version);
        window.storage.put('manifestVersion', version);
        consecutiveConflicts = 0;
        await window.textsecure.messaging.sendFetchManifestSyncMessage();
    }
    async function stopStorageServiceSync() {
        window.log.info('storageService.stopStorageServiceSync');
        await window.storage.remove('storageKey');
        if (!window.textsecure.messaging) {
            throw new Error('storageService.stopStorageServiceSync: We are offline!');
        }
        await window.textsecure.messaging.sendRequestKeySyncMessage();
    }
    async function createNewManifest() {
        window.log.info('storageService.createNewManifest: creating new manifest');
        const version = window.storage.get('manifestVersion') || 0;
        const { conversationsToUpdate, newItems, storageManifest, } = await generateManifest(version, true);
        await uploadManifest(version, {
            conversationsToUpdate,
            // we have created a new manifest, there should be no keys to delete
            deleteKeys: [],
            newItems,
            storageManifest,
        });
    }
    async function decryptManifest(encryptedManifest) {
        const { version, value } = encryptedManifest;
        const storageKeyBase64 = window.storage.get('storageKey');
        const storageKey = Crypto_2.base64ToArrayBuffer(storageKeyBase64);
        const storageManifestKey = await Crypto_2.deriveStorageManifestKey(storageKey, typeof version === 'number' ? version : version.toNumber());
        const decryptedManifest = await Crypto_1.default.decryptProfile(typeof value.toArrayBuffer === 'function' ? value.toArrayBuffer() : value, storageManifestKey);
        return window.textsecure.protobuf.ManifestRecord.decode(decryptedManifest);
    }
    async function fetchManifest(manifestVersion) {
        window.log.info('storageService.fetchManifest');
        if (!window.textsecure.messaging) {
            throw new Error('storageService.fetchManifest: We are offline!');
        }
        try {
            const credentials = await window.textsecure.messaging.getStorageCredentials();
            window.storage.put('storageCredentials', credentials);
            const manifestBinary = await window.textsecure.messaging.getStorageManifest({
                credentials,
                greaterThanVersion: manifestVersion,
            });
            const encryptedManifest = window.textsecure.protobuf.StorageManifest.decode(manifestBinary);
            // if we don't get a value we're assuming that there's no newer manifest
            if (!encryptedManifest.value || !encryptedManifest.version) {
                window.log.info('storageService.fetchManifest: nothing changed');
                return;
            }
            try {
                // eslint-disable-next-line consistent-return
                return decryptManifest(encryptedManifest);
            }
            catch (err) {
                await stopStorageServiceSync();
                return;
            }
        }
        catch (err) {
            window.log.error(`storageService.fetchManifest: failed! ${err && err.stack ? err.stack : String(err)}`);
            if (err.code === 404) {
                await createNewManifest();
                return;
            }
            if (err.code === 204) {
                // noNewerManifest we're ok
                return;
            }
            throw err;
        }
    }
    async function mergeRecord(itemToMerge) {
        const { itemType, storageID, storageRecord } = itemToMerge;
        const ITEM_TYPE = window.textsecure.protobuf.ManifestRecord.Identifier.Type;
        let hasConflict = false;
        let isUnsupported = false;
        try {
            if (itemType === ITEM_TYPE.UNKNOWN) {
                window.log.info('storageService.mergeRecord: Unknown item type', storageID);
            }
            else if (itemType === ITEM_TYPE.CONTACT && storageRecord.contact) {
                hasConflict = await storageRecordOps_1.mergeContactRecord(storageID, storageRecord.contact);
            }
            else if (itemType === ITEM_TYPE.GROUPV1 && storageRecord.groupV1) {
                hasConflict = await storageRecordOps_1.mergeGroupV1Record(storageID, storageRecord.groupV1);
            }
            else if (window.GV2 &&
                itemType === ITEM_TYPE.GROUPV2 &&
                storageRecord.groupV2) {
                hasConflict = await storageRecordOps_1.mergeGroupV2Record(storageID, storageRecord.groupV2);
            }
            else if (itemType === ITEM_TYPE.ACCOUNT && storageRecord.account) {
                hasConflict = await storageRecordOps_1.mergeAccountRecord(storageID, storageRecord.account);
            }
            else {
                isUnsupported = true;
                window.log.info(`storageService.mergeRecord: Unknown record: ${itemType}::${storageID}`);
            }
        }
        catch (err) {
            window.log.error(`storageService.mergeRecord: merging record failed ${storageID}`);
        }
        return {
            hasConflict,
            isUnsupported,
            itemType,
            storageID,
        };
    }
    /* tslint:disable-next-line max-func-body-length */
    async function processManifest(manifest) {
        const storageKeyBase64 = window.storage.get('storageKey');
        const storageKey = Crypto_2.base64ToArrayBuffer(storageKeyBase64);
        if (!window.textsecure.messaging) {
            throw new Error('storageService.processManifest: We are offline!');
        }
        const remoteKeysTypeMap = new Map();
        manifest.keys.forEach((identifier) => {
            remoteKeysTypeMap.set(Crypto_2.arrayBufferToBase64(identifier.raw.toArrayBuffer()), identifier.type);
        });
        const localKeys = window
            .getConversations()
            .map((conversation) => conversation.get('storageID'))
            .filter(Boolean);
        const unknownRecordsArray = window.storage.get('storage-service-unknown-records') || [];
        unknownRecordsArray.forEach((record) => {
            localKeys.push(record.storageID);
        });
        window.log.info(`storageService.processManifest: localKeys.length ${localKeys.length}`);
        const remoteKeys = Array.from(remoteKeysTypeMap.keys());
        const remoteOnly = remoteKeys.filter((key) => !localKeys.includes(key));
        window.log.info(`storageService.processManifest: remoteOnly.length ${remoteOnly.length}`);
        const readOperation = new window.textsecure.protobuf.ReadOperation();
        readOperation.readKey = remoteOnly.map(Crypto_2.base64ToArrayBuffer);
        const credentials = window.storage.get('storageCredentials');
        const storageItemsBuffer = await window.textsecure.messaging.getStorageRecords(readOperation.toArrayBuffer(), {
            credentials,
        });
        const storageItems = window.textsecure.protobuf.StorageItems.decode(storageItemsBuffer);
        if (!storageItems.items) {
            window.log.info('storageService.processManifest: No storage items retrieved');
            return false;
        }
        const decryptedStorageItems = await p_map_1.default(storageItems.items, async (storageRecordWrapper) => {
            const { key, value: storageItemCiphertext } = storageRecordWrapper;
            if (!key || !storageItemCiphertext) {
                await stopStorageServiceSync();
                throw new Error('storageService.processManifest: Missing key and/or Ciphertext');
            }
            const base64ItemID = Crypto_2.arrayBufferToBase64(key.toArrayBuffer());
            const storageItemKey = await Crypto_2.deriveStorageItemKey(storageKey, base64ItemID);
            let storageItemPlaintext;
            try {
                storageItemPlaintext = await Crypto_1.default.decryptProfile(storageItemCiphertext.toArrayBuffer(), storageItemKey);
            }
            catch (err) {
                await stopStorageServiceSync();
                throw err;
            }
            const storageRecord = window.textsecure.protobuf.StorageRecord.decode(storageItemPlaintext);
            return {
                itemType: remoteKeysTypeMap.get(base64ItemID),
                storageID: base64ItemID,
                storageRecord,
            };
        }, { concurrency: 50 });
        try {
            const mergedRecords = await p_map_1.default(decryptedStorageItems, mergeRecord, {
                concurrency: 5,
            });
            const unknownRecords = new Map();
            unknownRecordsArray.forEach((record) => {
                unknownRecords.set(record.storageID, record);
            });
            const hasConflict = mergedRecords.some((mergedRecord) => {
                if (mergedRecord.isUnsupported) {
                    unknownRecords.set(mergedRecord.storageID, {
                        itemType: mergedRecord.itemType,
                        storageID: mergedRecord.storageID,
                    });
                }
                return mergedRecord.hasConflict;
            });
            window.storage.put('storage-service-unknown-records', Array.from(unknownRecords.values()));
            if (hasConflict) {
                window.log.info('storageService.processManifest: Conflict found, uploading changes');
                return true;
            }
            consecutiveConflicts = 0;
        }
        catch (err) {
            window.log.error(`storageService.processManifest: failed! ${err && err.stack ? err.stack : String(err)}`);
        }
        return false;
    }
    // Exported functions
    async function runStorageServiceSyncJob() {
        if (!window.storage.get('storageKey')) {
            throw new Error('storageService.runStorageServiceSyncJob: Cannot start; no storage key!');
        }
        window.log.info('storageService.runStorageServiceSyncJob: starting...');
        try {
            const localManifestVersion = window.storage.get('manifestVersion') || 0;
            const manifest = await fetchManifest(localManifestVersion);
            // Guarding against no manifests being returned, everything should be ok
            if (!manifest) {
                window.log.info('storageService.runStorageServiceSyncJob: no manifest, returning early');
                return;
            }
            const version = manifest.version.toNumber();
            window.log.info(`storageService.runStorageServiceSyncJob: manifest versions - previous: ${localManifestVersion}, current: ${version}`);
            const hasConflicts = await processManifest(manifest);
            if (hasConflicts) {
                await exports.storageServiceUploadJob();
            }
            window.storage.put('manifestVersion', version);
        }
        catch (err) {
            window.log.error(`storageService.runStorageServiceSyncJob: error processing manifest ${err && err.stack ? err.stack : String(err)}`);
        }
        window.log.info('storageService.runStorageServiceSyncJob: complete');
    }
    exports.runStorageServiceSyncJob = runStorageServiceSyncJob;
    // Note: this function must be called at startup once we handle unknown records
    // of a certain type. This way once the runStorageServiceSyncJob function runs
    // it'll pick up the new storage IDs and process them accordingly.
    function handleUnknownRecords(itemType) {
        const unknownRecordsArray = window.storage.get('storage-service-unknown-records') || [];
        const newUnknownRecords = unknownRecordsArray.filter((record) => record.itemType !== itemType);
        window.storage.put('storage-service-unknown-records', newUnknownRecords);
    }
    exports.handleUnknownRecords = handleUnknownRecords;
    // Note: this function is meant to be called before ConversationController is hydrated.
    //   It goes directly to the database, so in-memory conversations will be out of date.
    async function eraseAllStorageServiceState() {
        window.log.info('storageService.eraseAllStorageServiceState: starting...');
        await Promise.all([
            window.storage.remove('manifestVersion'),
            window.storage.remove('storage-service-unknown-records'),
            window.storage.remove('storageCredentials'),
        ]);
        await eraseStorageServiceStateFromConversations();
        window.log.info('storageService.eraseAllStorageServiceState: complete');
    }
    exports.eraseAllStorageServiceState = eraseAllStorageServiceState;
    async function nondebouncedStorageServiceUploadJob() {
        if (!window.storage.get('storageKey')) {
            throw new Error('storageService.storageServiceUploadJob: Cannot start; no storage key!');
        }
        const localManifestVersion = window.storage.get('manifestVersion') || 0;
        const version = Number(localManifestVersion) + 1;
        window.log.info('storageService.storageServiceUploadJob: will update to manifest version', version);
        try {
            await uploadManifest(version, await generateManifest(version));
        }
        catch (err) {
            if (err.code === 409) {
                await runStorageServiceSyncJob();
            }
        }
    }
    exports.storageServiceUploadJob = lodash_1.default.debounce(nondebouncedStorageServiceUploadJob, 500);
});