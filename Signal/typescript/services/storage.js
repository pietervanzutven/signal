require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = __importDefault(require("lodash"));
    const p_map_1 = __importDefault(require("p-map"));
    const Crypto_1 = __importDefault(require("../textsecure/Crypto"));
    const Client_1 = __importDefault(require("../sql/Client"));
    const Crypto_2 = require("../Crypto");
    const RemoteConfig_1 = require("../RemoteConfig");
    const storageRecordOps_1 = require("./storageRecordOps");
    const JobQueue_1 = require("../util/JobQueue");
    const { eraseStorageServiceStateFromConversations, updateConversation, } = Client_1.default;
    let consecutiveStops = 0;
    let consecutiveConflicts = 0;
    const forcedPushBucket = [];
    const validRecordTypes = new Set([
        0,
        1,
        2,
        3,
        4,
    ]);
    const SECOND = 1000;
    const MINUTE = 60 * SECOND;
    const BACKOFF = {
        0: SECOND,
        1: 5 * SECOND,
        2: 30 * SECOND,
        3: 2 * MINUTE,
        max: 5 * MINUTE,
    };
    function backOff(count) {
        const ms = BACKOFF[count] || BACKOFF.max;
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
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
                storageRecord.groupV2 = await storageRecordOps_1.toGroupV2Record(conversation);
                identifier.type = ITEM_TYPE.GROUPV2;
            }
            else if (conversation.isGroupV1()) {
                storageRecord = new window.textsecure.protobuf.StorageRecord();
                // eslint-disable-next-line no-await-in-loop
                storageRecord.groupV1 = await storageRecordOps_1.toGroupV1Record(conversation);
                identifier.type = ITEM_TYPE.GROUPV1;
            }
            else {
                window.log.info('storageService.generateManifest: unknown conversation', conversation.debugID());
            }
            if (storageRecord) {
                const currentStorageID = conversation.get('storageID');
                const isNewItem = isNewManifest ||
                    Boolean(conversation.get('needsStorageServiceSync')) ||
                    !currentStorageID;
                const storageID = isNewItem
                    ? Crypto_2.arrayBufferToBase64(generateStorageID())
                    : currentStorageID;
                let storageItem;
                try {
                    // eslint-disable-next-line no-await-in-loop
                    storageItem = await encryptRecord(storageID, storageRecord);
                }
                catch (err) {
                    window.log.error(`storageService.generateManifest: encrypt record failed: ${err && err.stack ? err.stack : String(err)}`);
                    throw err;
                }
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
            if (validRecordTypes.has(record.itemType)) {
                return;
            }
            const identifier = new window.textsecure.protobuf.ManifestRecord.Identifier();
            identifier.type = record.itemType;
            identifier.raw = Crypto_2.base64ToArrayBuffer(record.storageID);
            manifestRecordKeys.add(identifier);
        });
        const recordsWithErrors = window.storage.get('storage-service-error-records') || [];
        window.log.info(`storageService.generateManifest: adding ${recordsWithErrors.length} records that had errors in the previous merge`);
        // These records failed to merge in the previous fetchManifest, but we still
        // need to include them so that the manifest is complete
        recordsWithErrors.forEach((record) => {
            const identifier = new window.textsecure.protobuf.ManifestRecord.Identifier();
            identifier.type = record.itemType;
            identifier.raw = Crypto_2.base64ToArrayBuffer(record.storageID);
            manifestRecordKeys.add(identifier);
        });
        // Validate before writing
        const rawDuplicates = new Set();
        const typeRawDuplicates = new Set();
        let hasAccountType = false;
        manifestRecordKeys.forEach(identifier => {
            // Ensure there are no duplicate StorageIdentifiers in your manifest
            //   This can be broken down into two parts:
            //     There are no duplicate type+raw pairs
            //     There are no duplicate raw bytes
            const storageID = Crypto_2.arrayBufferToBase64(identifier.raw);
            const typeAndRaw = `${identifier.type}+${storageID}`;
            if (rawDuplicates.has(identifier.raw) ||
                typeRawDuplicates.has(typeAndRaw)) {
                window.log.info('storageService.generateManifest: removing duplicate identifier from manifest', storageID);
                manifestRecordKeys.delete(identifier);
            }
            rawDuplicates.add(identifier.raw);
            typeRawDuplicates.add(typeAndRaw);
            // Ensure all deletes are not present in the manifest
            const hasDeleteKey = deleteKeys.find(key => Crypto_2.arrayBufferToBase64(key) === storageID);
            if (hasDeleteKey) {
                window.log.info('storageService.generateManifest: removing key which has been deleted', storageID);
                manifestRecordKeys.delete(identifier);
            }
            // Ensure that there is *exactly* one Account type in the manifest
            if (identifier.type === ITEM_TYPE.ACCOUNT) {
                if (hasAccountType) {
                    window.log.info('storageService.generateManifest: removing duplicate account', storageID);
                    manifestRecordKeys.delete(identifier);
                }
                hasAccountType = true;
            }
        });
        rawDuplicates.clear();
        typeRawDuplicates.clear();
        const storageKeyDuplicates = new Set();
        newItems.forEach(storageItem => {
            // Ensure there are no duplicate StorageIdentifiers in your list of inserts
            const storageID = storageItem.key;
            if (storageKeyDuplicates.has(storageID)) {
                window.log.info('storageService.generateManifest: removing duplicate identifier from inserts', storageID);
                newItems.delete(storageItem);
            }
            storageKeyDuplicates.add(storageID);
        });
        storageKeyDuplicates.clear();
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
        if (newItems.size === 0 && deleteKeys.length === 0) {
            window.log.info('storageService.uploadManifest: nothing to upload');
            return;
        }
        const credentials = window.storage.get('storageCredentials');
        try {
            window.log.info(`storageService.uploadManifest: inserting ${newItems.size} items, deleting ${deleteKeys.length} keys`);
            const writeOperation = new window.textsecure.protobuf.WriteOperation();
            writeOperation.manifest = storageManifest;
            writeOperation.insertItem = Array.from(newItems);
            writeOperation.deleteKey = deleteKeys;
            window.log.info('storageService.uploadManifest: uploading...', version);
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
                if (consecutiveConflicts > 3) {
                    window.log.error('storageService.uploadManifest: Exceeded maximum consecutive conflicts');
                    return;
                }
                consecutiveConflicts += 1;
                window.log.info(`storageService.uploadManifest: Conflict found with v${version}, running sync job times(${consecutiveConflicts})`);
                throw err;
            }
            throw err;
        }
        window.log.info('storageService.uploadManifest: setting new manifestVersion', version);
        window.storage.put('manifestVersion', version);
        consecutiveConflicts = 0;
        consecutiveStops = 0;
        await window.textsecure.messaging.sendFetchManifestSyncMessage();
    }
    async function stopStorageServiceSync() {
        window.log.info('storageService.stopStorageServiceSync');
        await window.storage.remove('storageKey');
        if (consecutiveStops < 5) {
            await backOff(consecutiveStops);
            window.log.info('storageService.stopStorageServiceSync: requesting new keys');
            consecutiveStops += 1;
            setTimeout(() => {
                if (!window.textsecure.messaging) {
                    throw new Error('storageService.stopStorageServiceSync: We are offline!');
                }
                window.textsecure.messaging.sendRequestKeySyncMessage();
            });
        }
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
        let hasError = false;
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
            hasError = true;
            window.log.error('storageService.mergeRecord: merging record failed', storageID, err && err.stack ? err.stack : String(err));
        }
        return {
            hasConflict,
            hasError,
            isUnsupported,
            itemType,
            storageID,
        };
    }
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
            // Do not include any unknown records that we already support
            if (!validRecordTypes.has(record.itemType)) {
                localKeys.push(record.storageID);
            }
        });
        window.log.info(`storageService.processManifest: localKeys.length ${localKeys.length}`);
        const remoteKeys = Array.from(remoteKeysTypeMap.keys());
        const remoteOnlySet = new Set();
        remoteKeys.forEach((key) => {
            if (!localKeys.includes(key)) {
                remoteOnlySet.add(key);
            }
        });
        const remoteOnly = Array.from(remoteOnlySet);
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
                window.log.error('storageService.processManifest: No key or Ciphertext available');
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
                window.log.error('storageService.processManifest: Error decrypting storage item');
                await stopStorageServiceSync();
                throw err;
            }
            const storageRecord = window.textsecure.protobuf.StorageRecord.decode(storageItemPlaintext);
            return {
                itemType: remoteKeysTypeMap.get(base64ItemID),
                storageID: base64ItemID,
                storageRecord,
            };
        }, { concurrency: 5 });
        // Merge Account records last
        const sortedStorageItems = [].concat(...lodash_1.default.partition(decryptedStorageItems, storageRecord => storageRecord.storageRecord.account === undefined));
        try {
            window.log.info(`storageService.processManifest: Attempting to merge ${sortedStorageItems.length} records`);
            const mergedRecords = await p_map_1.default(sortedStorageItems, mergeRecord, {
                concurrency: 5,
            });
            window.log.info(`storageService.processManifest: Processed ${mergedRecords.length} records`);
            const unknownRecords = new Map();
            unknownRecordsArray.forEach((record) => {
                unknownRecords.set(record.storageID, record);
            });
            const recordsWithErrors = [];
            let hasConflict = false;
            mergedRecords.forEach((mergedRecord) => {
                if (mergedRecord.isUnsupported) {
                    unknownRecords.set(mergedRecord.storageID, {
                        itemType: mergedRecord.itemType,
                        storageID: mergedRecord.storageID,
                    });
                }
                else if (mergedRecord.hasError) {
                    recordsWithErrors.push({
                        itemType: mergedRecord.itemType,
                        storageID: mergedRecord.storageID,
                    });
                }
                hasConflict = hasConflict || mergedRecord.hasConflict;
            });
            // Filter out all the unknown records we're already supporting
            const newUnknownRecords = Array.from(unknownRecords.values()).filter((record) => !validRecordTypes.has(record.itemType));
            window.log.info(`storageService.processManifest: Found ${newUnknownRecords.length} unknown records`);
            window.storage.put('storage-service-unknown-records', newUnknownRecords);
            window.log.info(`storageService.processManifest: Found ${recordsWithErrors.length} records with errors`);
            window.storage.put('storage-service-error-records', recordsWithErrors);
            const now = Date.now();
            // if the remote only keys are larger or equal to our local keys then it
            // was likely a forced push of storage service. We keep track of these
            // merges so that we can detect possible infinite loops
            if (remoteOnly.length >= localKeys.length) {
                window.log.info('storageService.processManifest: remote manifest was likely force pushed', now);
                forcedPushBucket.push(now);
                // we need to check our conversations because maybe all of them were not
                // updated properly, for those that weren't we'll clear their storage
                // key so that they can be included in the next update
                window.getConversations().forEach((conversation) => {
                    const storageID = conversation.get('storageID');
                    if (storageID && !remoteOnlySet.has(storageID)) {
                        window.log.info('storageService.processManifest: conversation was not included in remote force push, clearing storageID', conversation.debugID(), storageID);
                        conversation.unset('storageID');
                    }
                });
                if (forcedPushBucket.length >= 3) {
                    const [firstMostRecentForcedPush] = forcedPushBucket;
                    if (now - firstMostRecentForcedPush < 5 * MINUTE) {
                        window.log.info('storageService.processManifest: thrasing? Backing off');
                        const error = new Error();
                        error.code = 'E_BACKOFF';
                        throw error;
                    }
                    window.log.info('storageService.processManifest: thrash timestamp of first -> now', firstMostRecentForcedPush, now);
                    forcedPushBucket.shift();
                }
            }
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
    async function sync() {
        if (!RemoteConfig_1.isEnabled('desktop.storage')) {
            window.log.info('storageService.sync: Not starting desktop.storage is falsey');
            return;
        }
        if (!window.storage.get('storageKey')) {
            throw new Error('storageService.sync: Cannot start; no storage key!');
        }
        window.log.info('storageService.sync: starting...');
        try {
            const localManifestVersion = window.storage.get('manifestVersion') || 0;
            const manifest = await fetchManifest(localManifestVersion);
            // Guarding against no manifests being returned, everything should be ok
            if (!manifest) {
                window.log.info('storageService.sync: no new manifest');
                return;
            }
            const version = manifest.version.toNumber();
            window.log.info(`storageService.sync: manifest versions - previous: ${localManifestVersion}, current: ${version}`);
            window.storage.put('manifestVersion', version);
            const hasConflicts = await processManifest(manifest);
            if (hasConflicts) {
                await upload();
            }
        }
        catch (err) {
            window.log.error(`storageService.sync: error processing manifest ${err && err.stack ? err.stack : String(err)}`);
            // When we're told to backoff, backoff to the max which should be
            // ~5 minutes. If this job was running inside a queue it'll probably time
            // out.
            if (err.code === 'E_BACKOFF') {
                await backOff(9001);
            }
        }
        window.log.info('storageService.sync: complete');
    }
    async function upload() {
        if (!RemoteConfig_1.isEnabled('desktop.storage')) {
            window.log.info('storageService.upload: Not starting desktop.storage is falsey');
            return;
        }
        if (!RemoteConfig_1.isEnabled('desktop.storageWrite')) {
            window.log.info('storageService.upload: Not starting desktop.storageWrite is falsey');
            return;
        }
        if (!window.textsecure.messaging) {
            throw new Error('storageService.upload: We are offline!');
        }
        if (!window.storage.get('storageKey')) {
            // requesting new keys runs the sync job which will detect the conflict
            // and re-run the upload job once we're merged and up-to-date.
            window.log.info('storageService.upload: no storageKey, requesting new keys');
            consecutiveStops = 0;
            await window.textsecure.messaging.sendRequestKeySyncMessage();
            return;
        }
        const localManifestVersion = window.storage.get('manifestVersion') || 0;
        const version = Number(localManifestVersion) + 1;
        window.log.info('storageService.upload: will update to manifest version', version);
        try {
            const generatedManifest = await generateManifest(version);
            await uploadManifest(version, generatedManifest);
        }
        catch (err) {
            if (err.code === 409) {
                await backOff(consecutiveConflicts);
                window.log.info('storageService.upload: pushing sync on the queue');
                // The sync job will check for conflicts and as part of that conflict
                // check if an item needs sync and doesn't match with the remote record
                // it'll kick off another upload.
                setTimeout(exports.runStorageServiceSyncJob);
                return;
            }
            window.log.error('storageService.upload', err && err.stack ? err.stack : String(err));
        }
    }
    let storageServiceEnabled = false;
    function enableStorageService() {
        storageServiceEnabled = true;
    }
    exports.enableStorageService = enableStorageService;
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
    exports.storageServiceUploadJob = lodash_1.default.debounce(() => {
        if (!storageServiceEnabled) {
            window.log.info('storageService.storageServiceUploadJob: called before enabled');
            return;
        }
        JobQueue_1.storageJobQueue(upload, `upload v${window.storage.get('manifestVersion')}`);
    }, 500);
    exports.runStorageServiceSyncJob = lodash_1.default.debounce(() => {
        if (!storageServiceEnabled) {
            window.log.info('storageService.runStorageServiceSyncJob: called before enabled');
            return;
        }
        JobQueue_1.storageJobQueue(sync, `sync v${window.storage.get('manifestVersion')}`);
    }, 500);
});