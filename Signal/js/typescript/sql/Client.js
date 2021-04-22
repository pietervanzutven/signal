(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.sql = window.ts.sql || {};
    const exports = window.ts.sql.Client = {};

    // tslint:disable no-default-export no-unnecessary-local-variable
    Object.defineProperty(exports, "__esModule", { value: true });
    const electron_1 = window.electron;
    const lodash_1 = window.lodash;
    const Crypto_1 = window.ts.Crypto;
    const message_1 = window.types.message;
    const batcher_1 = require("../util/batcher");
    // We listen to a lot of events on ipcRenderer, often on the same channel. This prevents
    //   any warnings that might be sent to the console in that case.
    electron_1.ipcRenderer.setMaxListeners(0);
    const DATABASE_UPDATE_TIMEOUT = 2 * 60 * 1000; // two minutes
    const SQL_CHANNEL_KEY = 'sql-channel';
    const ERASE_SQL_KEY = 'erase-sql-key';
    const ERASE_ATTACHMENTS_KEY = 'erase-attachments';
    const ERASE_STICKERS_KEY = 'erase-stickers';
    const ERASE_TEMP_KEY = 'erase-temp';
    const ERASE_DRAFTS_KEY = 'erase-drafts';
    const CLEANUP_ORPHANED_ATTACHMENTS_KEY = 'cleanup-orphaned-attachments';
    const ENSURE_FILE_PERMISSIONS = 'ensure-file-permissions';
    const _jobs = Object.create(null);
    const _DEBUG = false;
    let _jobCounter = 0;
    let _shuttingDown = false;
    let _shutdownCallback = null;
    let _shutdownPromise = null;
    // Because we can't force this module to conform to an interface, we narrow our exports
    //   to this one default export, which does conform to the interface.
    // Note: In Javascript, you need to access the .default property when requiring it
    // https://github.com/microsoft/TypeScript/issues/420
    const dataInterface = {
        close,
        removeDB,
        removeIndexedDBFiles,
        createOrUpdateIdentityKey,
        getIdentityKeyById,
        bulkAddIdentityKeys,
        removeIdentityKeyById,
        removeAllIdentityKeys,
        getAllIdentityKeys,
        createOrUpdatePreKey,
        getPreKeyById,
        bulkAddPreKeys,
        removePreKeyById,
        removeAllPreKeys,
        getAllPreKeys,
        createOrUpdateSignedPreKey,
        getSignedPreKeyById,
        getAllSignedPreKeys,
        bulkAddSignedPreKeys,
        removeSignedPreKeyById,
        removeAllSignedPreKeys,
        createOrUpdateItem,
        getItemById,
        getAllItems,
        bulkAddItems,
        removeItemById,
        removeAllItems,
        createOrUpdateSession,
        createOrUpdateSessions,
        getSessionById,
        getSessionsById,
        bulkAddSessions,
        removeSessionById,
        removeSessionsByConversation,
        removeAllSessions,
        getAllSessions,
        getConversationCount,
        saveConversation,
        saveConversations,
        getConversationById,
        updateConversation,
        updateConversations,
        removeConversation,
        getAllConversations,
        getAllConversationIds,
        getAllPrivateConversations,
        getAllGroupsInvolvingId,
        searchConversations,
        searchMessages,
        searchMessagesInConversation,
        getMessageCount,
        saveMessage,
        saveMessages,
        removeMessage,
        getUnreadByConversation,
        getMessageBySender,
        getMessageById,
        getAllMessageIds,
        getMessagesBySentAt,
        getExpiredMessages,
        getOutgoingWithoutExpiresAt,
        getNextExpiringMessage,
        getNextTapToViewMessageToAgeOut,
        getTapToViewMessagesNeedingErase,
        getOlderMessagesByConversation,
        getNewerMessagesByConversation,
        getMessageMetricsForConversation,
        getUnprocessedCount,
        getAllUnprocessed,
        getUnprocessedById,
        saveUnprocessed,
        saveUnprocesseds,
        updateUnprocessedAttempts,
        updateUnprocessedWithData,
        updateUnprocessedsWithData,
        removeUnprocessed,
        removeAllUnprocessed,
        getNextAttachmentDownloadJobs,
        saveAttachmentDownloadJob,
        resetAttachmentDownloadPending,
        setAttachmentDownloadJobPending,
        removeAttachmentDownloadJob,
        removeAllAttachmentDownloadJobs,
        getStickerCount,
        createOrUpdateStickerPack,
        updateStickerPackStatus,
        createOrUpdateSticker,
        updateStickerLastUsed,
        addStickerPackReference,
        deleteStickerPackReference,
        deleteStickerPack,
        getAllStickerPacks,
        getAllStickers,
        getRecentStickers,
        updateEmojiUsage,
        getRecentEmojis,
        removeAll,
        removeAllConfiguration,
        getMessagesNeedingUpgrade,
        getMessagesWithVisualMediaAttachments,
        getMessagesWithFileAttachments,
        // Test-only
        _getAllMessages,
        // Client-side only
        shutdown,
        removeAllMessagesInConversation,
        removeOtherData,
        cleanupOrphanedAttachments,
        ensureFilePermissions,
        // Client-side only, and test-only
        _removeConversations,
        _removeMessages,
        _cleanData,
        _jobs,
    };
    exports.default = dataInterface;
    const channelsAsUnknown = lodash_1.fromPairs(lodash_1.compact(lodash_1.map(dataInterface, (value) => {
        if (lodash_1.isFunction(value)) {
            return [value.name, makeChannel(value.name)];
        }
        return null;
    })));
    const channels = channelsAsUnknown;
    // When IPC arguments are prepared for the cross-process send, they are JSON.stringified.
    //   We can't send ArrayBuffers or BigNumbers (what we get from proto library for dates),
    //   We also cannot send objects with function-value keys, like what protobufjs gives us.
    function _cleanData(data, path = 'root') {
        if (data === null || data === undefined) {
            window.log.warn(`_cleanData: null or undefined value at path ${path}`);
            return data;
        }
        if (typeof data === 'string' ||
            typeof data === 'number' ||
            typeof data === 'boolean') {
            return data;
        }
        const keys = Object.keys(data);
        const max = keys.length;
        for (let index = 0; index < max; index += 1) {
            const key = keys[index];
            const value = data[key];
            if (value === null || value === undefined) {
                continue;
            }
            if (lodash_1.isFunction(value)) {
                // To prepare for Electron v9 IPC, we need to take functions off of any object
                // tslint:disable-next-line no-dynamic-delete
                delete data[key];
            }
            else if (lodash_1.isFunction(value.toNumber)) {
                // tslint:disable-next-line no-dynamic-delete
                data[key] = value.toNumber();
            }
            else if (Array.isArray(value)) {
                data[key] = value.map((item, mapIndex) => _cleanData(item, `${path}.${key}.${mapIndex}`));
            }
            else if (lodash_1.isObject(value)) {
                data[key] = _cleanData(value, `${path}.${key}`);
            }
            else if (typeof value !== 'string' &&
                typeof value !== 'number' &&
                typeof value !== 'boolean') {
                window.log.info(`_cleanData: key ${key} had type ${typeof value}`);
            }
        }
        return data;
    }
    async function _shutdown() {
        const jobKeys = Object.keys(_jobs);
        window.log.info(`data.shutdown: shutdown requested. ${jobKeys.length} jobs outstanding`);
        if (_shutdownPromise) {
            await _shutdownPromise;
            return;
        }
        _shuttingDown = true;
        // No outstanding jobs, return immediately
        if (jobKeys.length === 0 || _DEBUG) {
            return;
        }
        // Outstanding jobs; we need to wait until the last one is done
        _shutdownPromise = new Promise((resolve, reject) => {
            _shutdownCallback = (error) => {
                window.log.info('data.shutdown: process complete');
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
                return;
            };
        });
        await _shutdownPromise;
    }
    function _makeJob(fnName) {
        if (_shuttingDown && fnName !== 'close') {
            throw new Error(`Rejecting SQL channel job (${fnName}); application is shutting down`);
        }
        _jobCounter += 1;
        const id = _jobCounter;
        if (_DEBUG) {
            window.log.info(`SQL channel job ${id} (${fnName}) started`);
        }
        _jobs[id] = {
            fnName,
            start: Date.now(),
        };
        return id;
    }
    function _updateJob(id, data) {
        const { resolve, reject } = data;
        const { fnName, start } = _jobs[id];
        _jobs[id] = Object.assign(Object.assign(Object.assign({}, _jobs[id]), data), {
            resolve: (value) => {
                _removeJob(id);
                const end = Date.now();
                const delta = end - start;
                if (delta > 10 || _DEBUG) {
                    window.log.info(`SQL channel job ${id} (${fnName}) succeeded in ${end - start}ms`);
                }
                return resolve(value);
            }, reject: (error) => {
                _removeJob(id);
                const end = Date.now();
                window.log.info(`SQL channel job ${id} (${fnName}) failed in ${end - start}ms`);
                if (error && error.message && error.message.includes('SQLITE_CORRUPT')) {
                    window.log.error('Detected SQLITE_CORRUPT error; restarting the application immediately');
                    window.restart();
                }
                return reject(error);
            }
        });
    }
    function _removeJob(id) {
        if (_DEBUG) {
            _jobs[id].complete = true;
            return;
        }
        // tslint:disable-next-line no-dynamic-delete
        delete _jobs[id];
        if (_shutdownCallback) {
            const keys = Object.keys(_jobs);
            if (keys.length === 0) {
                _shutdownCallback();
            }
        }
    }
    function _getJob(id) {
        return _jobs[id];
    }
    electron_1.ipcRenderer.on(`${SQL_CHANNEL_KEY}-done`, (_, jobId, errorForDisplay, result) => {
        const job = _getJob(jobId);
        if (!job) {
            throw new Error(`Received SQL channel reply to job ${jobId}, but did not have it in our registry!`);
        }
        const { resolve, reject, fnName } = job;
        if (!resolve || !reject) {
            throw new Error(`SQL channel job ${jobId} (${fnName}): didn't have a resolve or reject`);
        }
        if (errorForDisplay) {
            return reject(new Error(`Error received from SQL channel job ${jobId} (${fnName}): ${errorForDisplay}`));
        }
        return resolve(result);
    });
    function makeChannel(fnName) {
        return async (...args) => {
            const jobId = _makeJob(fnName);
            return new Promise((resolve, reject) => {
                try {
                    electron_1.ipcRenderer.send(SQL_CHANNEL_KEY, jobId, fnName, ...args);
                    _updateJob(jobId, {
                        resolve,
                        reject,
                        args: _DEBUG ? args : undefined,
                    });
                    setTimeout(() => {
                        reject(new Error(`SQL channel job ${jobId} (${fnName}) timed out`));
                    }, DATABASE_UPDATE_TIMEOUT);
                }
                catch (error) {
                    _removeJob(jobId);
                    reject(error);
                }
            });
        };
    }
    function keysToArrayBuffer(keys, data) {
        const updated = lodash_1.cloneDeep(data);
        const max = keys.length;
        for (let i = 0; i < max; i += 1) {
            const key = keys[i];
            const value = lodash_1.get(data, key);
            if (value) {
                lodash_1.set(updated, key, Crypto_1.base64ToArrayBuffer(value));
            }
        }
        return updated;
    }
    function keysFromArrayBuffer(keys, data) {
        const updated = lodash_1.cloneDeep(data);
        const max = keys.length;
        for (let i = 0; i < max; i += 1) {
            const key = keys[i];
            const value = lodash_1.get(data, key);
            if (value) {
                lodash_1.set(updated, key, Crypto_1.arrayBufferToBase64(value));
            }
        }
        return updated;
    }
    // Top-level calls
    async function shutdown() {
        // Stop accepting new SQL jobs, flush outstanding queue
        await _shutdown();
        // Close database
        await close();
    }
    // Note: will need to restart the app after calling this, to set up afresh
    async function close() {
        await channels.close();
    }
    // Note: will need to restart the app after calling this, to set up afresh
    async function removeDB() {
        await channels.removeDB();
    }
    async function removeIndexedDBFiles() {
        await channels.removeIndexedDBFiles();
    }
    // Identity Keys
    const IDENTITY_KEY_KEYS = ['publicKey'];
    async function createOrUpdateIdentityKey(data) {
        const updated = keysFromArrayBuffer(IDENTITY_KEY_KEYS, Object.assign(Object.assign({}, data), { id: window.ConversationController.getConversationId(data.id) }));
        await channels.createOrUpdateIdentityKey(updated);
    }
    async function getIdentityKeyById(identifier) {
        const id = window.ConversationController.getConversationId(identifier);
        if (!id) {
            throw new Error('getIdentityKeyById: unable to find conversationId');
        }
        const data = await channels.getIdentityKeyById(id);
        return keysToArrayBuffer(IDENTITY_KEY_KEYS, data);
    }
    async function bulkAddIdentityKeys(array) {
        const updated = lodash_1.map(array, data => keysFromArrayBuffer(IDENTITY_KEY_KEYS, data));
        await channels.bulkAddIdentityKeys(updated);
    }
    async function removeIdentityKeyById(identifier) {
        const id = window.ConversationController.getConversationId(identifier);
        if (!id) {
            throw new Error('removeIdentityKeyById: unable to find conversationId');
        }
        await channels.removeIdentityKeyById(id);
    }
    async function removeAllIdentityKeys() {
        await channels.removeAllIdentityKeys();
    }
    async function getAllIdentityKeys() {
        const keys = await channels.getAllIdentityKeys();
        return keys.map(key => keysToArrayBuffer(IDENTITY_KEY_KEYS, key));
    }
    // Pre Keys
    async function createOrUpdatePreKey(data) {
        const updated = keysFromArrayBuffer(PRE_KEY_KEYS, data);
        await channels.createOrUpdatePreKey(updated);
    }
    async function getPreKeyById(id) {
        const data = await channels.getPreKeyById(id);
        return keysToArrayBuffer(PRE_KEY_KEYS, data);
    }
    async function bulkAddPreKeys(array) {
        const updated = lodash_1.map(array, data => keysFromArrayBuffer(PRE_KEY_KEYS, data));
        await channels.bulkAddPreKeys(updated);
    }
    async function removePreKeyById(id) {
        await channels.removePreKeyById(id);
    }
    async function removeAllPreKeys() {
        await channels.removeAllPreKeys();
    }
    async function getAllPreKeys() {
        const keys = await channels.getAllPreKeys();
        return keys.map(key => keysToArrayBuffer(PRE_KEY_KEYS, key));
    }
    // Signed Pre Keys
    const PRE_KEY_KEYS = ['privateKey', 'publicKey'];
    async function createOrUpdateSignedPreKey(data) {
        const updated = keysFromArrayBuffer(PRE_KEY_KEYS, data);
        await channels.createOrUpdateSignedPreKey(updated);
    }
    async function getSignedPreKeyById(id) {
        const data = await channels.getSignedPreKeyById(id);
        return keysToArrayBuffer(PRE_KEY_KEYS, data);
    }
    async function getAllSignedPreKeys() {
        const keys = await channels.getAllSignedPreKeys();
        return keys.map((key) => keysToArrayBuffer(PRE_KEY_KEYS, key));
    }
    async function bulkAddSignedPreKeys(array) {
        const updated = lodash_1.map(array, data => keysFromArrayBuffer(PRE_KEY_KEYS, data));
        await channels.bulkAddSignedPreKeys(updated);
    }
    async function removeSignedPreKeyById(id) {
        await channels.removeSignedPreKeyById(id);
    }
    async function removeAllSignedPreKeys() {
        await channels.removeAllSignedPreKeys();
    }
    // Items
    const ITEM_KEYS = {
        identityKey: ['value.pubKey', 'value.privKey'],
        senderCertificate: ['value.serialized'],
        signaling_key: ['value'],
        profileKey: ['value'],
    };
    async function createOrUpdateItem(data) {
        const { id } = data;
        if (!id) {
            throw new Error('createOrUpdateItem: Provided data did not have a truthy id');
        }
        const keys = ITEM_KEYS[id];
        const updated = Array.isArray(keys) ? keysFromArrayBuffer(keys, data) : data;
        await channels.createOrUpdateItem(updated);
    }
    async function getItemById(id) {
        const keys = ITEM_KEYS[id];
        const data = await channels.getItemById(id);
        return Array.isArray(keys) ? keysToArrayBuffer(keys, data) : data;
    }
    async function getAllItems() {
        const items = await channels.getAllItems();
        return lodash_1.map(items, item => {
            const { id } = item;
            const keys = ITEM_KEYS[id];
            return Array.isArray(keys) ? keysToArrayBuffer(keys, item) : item;
        });
    }
    async function bulkAddItems(array) {
        const updated = lodash_1.map(array, data => {
            const { id } = data;
            const keys = ITEM_KEYS[id];
            return keys && Array.isArray(keys) ? keysFromArrayBuffer(keys, data) : data;
        });
        await channels.bulkAddItems(updated);
    }
    async function removeItemById(id) {
        await channels.removeItemById(id);
    }
    async function removeAllItems() {
        await channels.removeAllItems();
    }
    // Sessions
    async function createOrUpdateSession(data) {
        await channels.createOrUpdateSession(data);
    }
    async function createOrUpdateSessions(array) {
        await channels.createOrUpdateSessions(array);
    }
    async function getSessionById(id) {
        const session = await channels.getSessionById(id);
        return session;
    }
    async function getSessionsById(id) {
        const sessions = await channels.getSessionsById(id);
        return sessions;
    }
    async function bulkAddSessions(array) {
        await channels.bulkAddSessions(array);
    }
    async function removeSessionById(id) {
        await channels.removeSessionById(id);
    }
    async function removeSessionsByConversation(conversationId) {
        await channels.removeSessionsByConversation(conversationId);
    }
    async function removeAllSessions() {
        await channels.removeAllSessions();
    }
    async function getAllSessions() {
        const sessions = await channels.getAllSessions();
        return sessions;
    }
    // Conversation
    async function getConversationCount() {
        return channels.getConversationCount();
    }
    async function saveConversation(data) {
        await channels.saveConversation(data);
    }
    async function saveConversations(array) {
        await channels.saveConversations(array);
    }
    async function getConversationById(id, { Conversation }) {
        const data = await channels.getConversationById(id);
        return new Conversation(data);
    }
    const updateConversationBatcher = batcher_1.createBatcher({
        wait: 500,
        maxSize: 20,
        processBatch: async (items) => {
            // We only care about the most recent update for each conversation
            const byId = lodash_1.groupBy(items, item => item.id);
            const ids = Object.keys(byId);
            const mostRecent = ids.map(id => lodash_1.last(byId[id]));
            await updateConversations(mostRecent);
        },
    });
    function updateConversation(data) {
        updateConversationBatcher.add(data);
    }
    async function updateConversations(array) {
        await channels.updateConversations(array);
    }
    async function removeConversation(id, { Conversation }) {
        const existing = await getConversationById(id, { Conversation });
        // Note: It's important to have a fully database-hydrated model to delete here because
        //   it needs to delete all associated on-disk files along with the database delete.
        if (existing) {
            await channels.removeConversation(id);
            await existing.cleanup();
        }
    }
    // Note: this method will not clean up external files, just delete from SQL
    async function _removeConversations(ids) {
        await channels.removeConversation(ids);
    }
    async function getAllConversations({ ConversationCollection, }) {
        const conversations = await channels.getAllConversations();
        const collection = new ConversationCollection();
        collection.add(conversations);
        return collection;
    }
    async function getAllConversationIds() {
        const ids = await channels.getAllConversationIds();
        return ids;
    }
    async function getAllPrivateConversations({ ConversationCollection, }) {
        const conversations = await channels.getAllPrivateConversations();
        const collection = new ConversationCollection();
        collection.add(conversations);
        return collection;
    }
    async function getAllGroupsInvolvingId(id, { ConversationCollection, }) {
        const conversations = await channels.getAllGroupsInvolvingId(id);
        const collection = new ConversationCollection();
        collection.add(conversations);
        return collection;
    }
    async function searchConversations(query) {
        const conversations = await channels.searchConversations(query);
        return conversations;
    }
    function handleSearchMessageJSON(messages) {
        return messages.map(message => (Object.assign(Object.assign({}, JSON.parse(message.json)), { snippet: message.snippet })));
    }
    async function searchMessages(query, { limit } = {}) {
        const messages = await channels.searchMessages(query, { limit });
        return handleSearchMessageJSON(messages);
    }
    async function searchMessagesInConversation(query, conversationId, { limit } = {}) {
        const messages = await channels.searchMessagesInConversation(query, conversationId, { limit });
        return handleSearchMessageJSON(messages);
    }
    // Message
    async function getMessageCount() {
        return channels.getMessageCount();
    }
    async function saveMessage(data, { forceSave, Message, }) {
        const id = await channels.saveMessage(_cleanData(data), { forceSave });
        Message.updateTimers();
        return id;
    }
    async function saveMessages(arrayOfMessages, { forceSave } = {}) {
        await channels.saveMessages(_cleanData(arrayOfMessages), { forceSave });
    }
    async function removeMessage(id, { Message }) {
        const message = await getMessageById(id, { Message });
        // Note: It's important to have a fully database-hydrated model to delete here because
        //   it needs to delete all associated on-disk files along with the database delete.
        if (message) {
            await channels.removeMessage(id);
            await message.cleanup();
        }
    }
    // Note: this method will not clean up external files, just delete from SQL
    async function _removeMessages(ids) {
        await channels.removeMessage(ids);
    }
    async function getMessageById(id, { Message }) {
        const message = await channels.getMessageById(id);
        if (!message) {
            return null;
        }
        return new Message(message);
    }
    // For testing only
    async function _getAllMessages({ MessageCollection, }) {
        const messages = await channels._getAllMessages();
        return new MessageCollection(messages);
    }
    async function getAllMessageIds() {
        const ids = await channels.getAllMessageIds();
        return ids;
    }
    async function getMessageBySender({ source, sourceUuid, sourceDevice, sent_at, }, { Message }) {
        const messages = await channels.getMessageBySender({
            source,
            sourceUuid,
            sourceDevice,
            sent_at,
        });
        if (!messages || !messages.length) {
            return null;
        }
        return new Message(messages[0]);
    }
    async function getUnreadByConversation(conversationId, { MessageCollection }) {
        const messages = await channels.getUnreadByConversation(conversationId);
        return new MessageCollection(messages);
    }
    function handleMessageJSON(messages) {
        return messages.map(message => JSON.parse(message.json));
    }
    async function getOlderMessagesByConversation(conversationId, { limit = 100, receivedAt = Number.MAX_VALUE, messageId, MessageCollection, }) {
        const messages = await channels.getOlderMessagesByConversation(conversationId, {
            limit,
            receivedAt,
            messageId,
        });
        return new MessageCollection(handleMessageJSON(messages));
    }
    async function getNewerMessagesByConversation(conversationId, { limit = 100, receivedAt = 0, MessageCollection, }) {
        const messages = await channels.getNewerMessagesByConversation(conversationId, {
            limit,
            receivedAt,
        });
        return new MessageCollection(handleMessageJSON(messages));
    }
    async function getMessageMetricsForConversation(conversationId) {
        const result = await channels.getMessageMetricsForConversation(conversationId);
        return result;
    }
    async function removeAllMessagesInConversation(conversationId, { MessageCollection }) {
        let messages;
        do {
            // Yes, we really want the await in the loop. We're deleting 100 at a
            //   time so we don't use too much memory.
            messages = await getOlderMessagesByConversation(conversationId, {
                limit: 100,
                MessageCollection,
            });
            if (!messages.length) {
                return;
            }
            const ids = messages.map((message) => message.id);
            // Note: It's very important that these models are fully hydrated because
            //   we need to delete all associated on-disk files along with the database delete.
            await Promise.all(messages.map((message) => message.cleanup()));
            await channels.removeMessage(ids);
        } while (messages.length > 0);
    }
    async function getMessagesBySentAt(sentAt, { MessageCollection }) {
        const messages = await channels.getMessagesBySentAt(sentAt);
        return new MessageCollection(messages);
    }
    async function getExpiredMessages({ MessageCollection, }) {
        const messages = await channels.getExpiredMessages();
        return new MessageCollection(messages);
    }
    async function getOutgoingWithoutExpiresAt({ MessageCollection, }) {
        const messages = await channels.getOutgoingWithoutExpiresAt();
        return new MessageCollection(messages);
    }
    async function getNextExpiringMessage({ Message, }) {
        const message = await channels.getNextExpiringMessage();
        if (message) {
            return new Message(message);
        }
        return null;
    }
    async function getNextTapToViewMessageToAgeOut({ Message, }) {
        const message = await channels.getNextTapToViewMessageToAgeOut();
        if (!message) {
            return null;
        }
        return new Message(message);
    }
    async function getTapToViewMessagesNeedingErase({ MessageCollection, }) {
        const messages = await channels.getTapToViewMessagesNeedingErase();
        return new MessageCollection(messages);
    }
    // Unprocessed
    async function getUnprocessedCount() {
        return channels.getUnprocessedCount();
    }
    async function getAllUnprocessed() {
        return channels.getAllUnprocessed();
    }
    async function getUnprocessedById(id) {
        return channels.getUnprocessedById(id);
    }
    async function saveUnprocessed(data, { forceSave } = {}) {
        const id = await channels.saveUnprocessed(_cleanData(data), { forceSave });
        return id;
    }
    async function saveUnprocesseds(arrayOfUnprocessed, { forceSave } = {}) {
        await channels.saveUnprocesseds(_cleanData(arrayOfUnprocessed), {
            forceSave,
        });
    }
    async function updateUnprocessedAttempts(id, attempts) {
        await channels.updateUnprocessedAttempts(id, attempts);
    }
    async function updateUnprocessedWithData(id, data) {
        await channels.updateUnprocessedWithData(id, data);
    }
    async function updateUnprocessedsWithData(array) {
        await channels.updateUnprocessedsWithData(array);
    }
    async function removeUnprocessed(id) {
        await channels.removeUnprocessed(id);
    }
    async function removeAllUnprocessed() {
        await channels.removeAllUnprocessed();
    }
    // Attachment downloads
    async function getNextAttachmentDownloadJobs(limit, options) {
        return channels.getNextAttachmentDownloadJobs(limit, options);
    }
    async function saveAttachmentDownloadJob(job) {
        await channels.saveAttachmentDownloadJob(_cleanData(job));
    }
    async function setAttachmentDownloadJobPending(id, pending) {
        await channels.setAttachmentDownloadJobPending(id, pending);
    }
    async function resetAttachmentDownloadPending() {
        await channels.resetAttachmentDownloadPending();
    }
    async function removeAttachmentDownloadJob(id) {
        await channels.removeAttachmentDownloadJob(id);
    }
    async function removeAllAttachmentDownloadJobs() {
        await channels.removeAllAttachmentDownloadJobs();
    }
    // Stickers
    async function getStickerCount() {
        return channels.getStickerCount();
    }
    async function createOrUpdateStickerPack(pack) {
        await channels.createOrUpdateStickerPack(pack);
    }
    async function updateStickerPackStatus(packId, status, options) {
        await channels.updateStickerPackStatus(packId, status, options);
    }
    async function createOrUpdateSticker(sticker) {
        await channels.createOrUpdateSticker(sticker);
    }
    async function updateStickerLastUsed(packId, stickerId, timestamp) {
        await channels.updateStickerLastUsed(packId, stickerId, timestamp);
    }
    async function addStickerPackReference(messageId, packId) {
        await channels.addStickerPackReference(messageId, packId);
    }
    async function deleteStickerPackReference(messageId, packId) {
        const paths = await channels.deleteStickerPackReference(messageId, packId);
        return paths;
    }
    async function deleteStickerPack(packId) {
        const paths = await channels.deleteStickerPack(packId);
        return paths;
    }
    async function getAllStickerPacks() {
        const packs = await channels.getAllStickerPacks();
        return packs;
    }
    async function getAllStickers() {
        const stickers = await channels.getAllStickers();
        return stickers;
    }
    async function getRecentStickers() {
        const recentStickers = await channels.getRecentStickers();
        return recentStickers;
    }
    // Emojis
    async function updateEmojiUsage(shortName) {
        await channels.updateEmojiUsage(shortName);
    }
    async function getRecentEmojis(limit = 32) {
        return channels.getRecentEmojis(limit);
    }
    // Other
    async function removeAll() {
        await channels.removeAll();
    }
    async function removeAllConfiguration() {
        await channels.removeAllConfiguration();
    }
    async function cleanupOrphanedAttachments() {
        await callChannel(CLEANUP_ORPHANED_ATTACHMENTS_KEY);
    }
    async function ensureFilePermissions() {
        await callChannel(ENSURE_FILE_PERMISSIONS);
    }
    // Note: will need to restart the app after calling this, to set up afresh
    async function removeOtherData() {
        await Promise.all([
            callChannel(ERASE_SQL_KEY),
            callChannel(ERASE_ATTACHMENTS_KEY),
            callChannel(ERASE_STICKERS_KEY),
            callChannel(ERASE_TEMP_KEY),
            callChannel(ERASE_DRAFTS_KEY),
        ]);
    }
    async function callChannel(name) {
        return new Promise((resolve, reject) => {
            electron_1.ipcRenderer.send(name);
            electron_1.ipcRenderer.once(`${name}-done`, (_, error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
                return;
            });
            setTimeout(() => {
                reject(new Error(`callChannel call to ${name} timed out`));
            }, DATABASE_UPDATE_TIMEOUT);
        });
    }
    async function getMessagesNeedingUpgrade(limit, { maxVersion = message_1.CURRENT_SCHEMA_VERSION }) {
        const messages = await channels.getMessagesNeedingUpgrade(limit, {
            maxVersion,
        });
        return messages;
    }
    async function getMessagesWithVisualMediaAttachments(conversationId, { limit }) {
        return channels.getMessagesWithVisualMediaAttachments(conversationId, {
            limit,
        });
    }
    async function getMessagesWithFileAttachments(conversationId, { limit }) {
        return channels.getMessagesWithFileAttachments(conversationId, {
            limit,
        });
    }
})();