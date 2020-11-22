/* global window, setTimeout */

(function () {
  'use strict';

  const { forEach, isFunction, isObject, merge } = window.lodash;

  const { deferredToPromise } = window.deferred_to_promise;
  const MessageType = window.types.message;

  const { ipcRenderer } = window.ipc;

  // We listen to a lot of events on ipcRenderer, often on the same channel. This prevents
  //   any warnings that might be sent to the console in that case.
  ipcRenderer.setMaxListeners(0);

  // calls to search for when finding functions to convert:
  //   .fetch(
  //   .save(
  //   .destroy(

  const DATABASE_UPDATE_TIMEOUT = 2 * 60 * 1000; // two minutes

  const SQL_CHANNEL_KEY = 'sql-channel';
  const ERASE_SQL_KEY = 'erase-sql-key';
  const ERASE_ATTACHMENTS_KEY = 'erase-attachments';
  const CLEANUP_ORPHANED_ATTACHMENTS_KEY = 'cleanup-orphaned-attachments';

  const _jobs = Object.create(null);
  const _DEBUG = false;
  let _jobCounter = 0;

  const channels = {};

  window.data = {
    _jobs,
    _cleanData,

    close,
    removeDB,

    getConversationCount,
    saveConversation,
    saveConversations,
    getConversationById,
    updateConversation,
    removeConversation,
    _removeConversations,

    getAllConversations,
    getAllConversationIds,
    getAllPrivateConversations,
    getAllGroupsInvolvingId,
    searchConversations,

    getMessageCount,
    saveMessage,
    saveLegacyMessage,
    saveMessages,
    removeMessage,
    _removeMessages,
    getUnreadByConversation,

    removeAllMessagesInConversation,

    getMessageBySender,
    getMessageById,
    getAllMessages,
    getAllMessageIds,
    getMessagesBySentAt,
    getExpiredMessages,
    getOutgoingWithoutExpiresAt,
    getNextExpiringMessage,
    getMessagesByConversation,

    getUnprocessedCount,
    getAllUnprocessed,
    getUnprocessedById,
    saveUnprocessed,
    saveUnprocesseds,
    removeUnprocessed,
    removeAllUnprocessed,

    removeAll,
    removeOtherData,
    cleanupOrphanedAttachments,

    // Returning plain JSON
    getMessagesNeedingUpgrade,
    getLegacyMessagesNeedingUpgrade,
    getMessagesWithVisualMediaAttachments,
    getMessagesWithFileAttachments,
  };

  // When IPC arguments are prepared for the cross-process send, they are JSON.stringified.
  // We can't send ArrayBuffers or BigNumbers (what we get from proto library for dates).
  function _cleanData(data) {
    const keys = Object.keys(data);
    for (let index = 0, max = keys.length; index < max; index += 1) {
      const key = keys[index];
      const value = data[key];

      if (value === null || value === undefined) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (isFunction(value.toNumber)) {
        // eslint-disable-next-line no-param-reassign
        data[key] = value.toNumber();
      } else if (Array.isArray(value)) {
        // eslint-disable-next-line no-param-reassign
        data[key] = value.map(item => _cleanData(item));
      } else if (isObject(value)) {
        // eslint-disable-next-line no-param-reassign
        data[key] = _cleanData(value);
      } else if (
        typeof value !== 'string' &&
        typeof value !== 'number' &&
        typeof value !== 'boolean'
      ) {
        window.log.info(`_cleanData: key ${key} had type ${typeof value}`);
      }
    }
    return data;
  }

  function _makeJob(fnName) {
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

    _jobs[id] = Object.assign({},
      _jobs[id],
      data,
      {
        resolve: value => {
          _removeJob(id);
          const end = Date.now();
          window.log.info(
            `SQL channel job ${id} (${fnName}) succeeded in ${end - start}ms`
          );
          return resolve(value);
        },
        reject: error => {
          _removeJob(id);
          const end = Date.now();
          window.log.info(
            `SQL channel job ${id} (${fnName}) failed in ${end - start}ms`
          );
          return reject(error);
        },
      }
    );
  }

  function _removeJob(id) {
    if (_DEBUG) {
      _jobs[id].complete = true;
    } else {
      delete _jobs[id];
    }
  }

  function _getJob(id) {
    return _jobs[id];
  }

  ipcRenderer.on(
    `${SQL_CHANNEL_KEY}-done`,
    (event, jobId, errorForDisplay, result) => {
      const job = _getJob(jobId);
      if (!job) {
        throw new Error(
          `Received SQL channel reply to job ${jobId}, but did not have it in our registry!`
        );
      }

      const { resolve, reject, fnName } = job;

      if (errorForDisplay) {
        return reject(
          new Error(
            `Error received from SQL channel job ${jobId} (${fnName}): ${errorForDisplay}`
          )
        );
      }

      return resolve(result);
    }
  );

  function makeChannel(fnName) {
    channels[fnName] = (...args) => {
      const jobId = _makeJob(fnName);

      return new Promise((resolve, reject) => {
        ipcRenderer.send(SQL_CHANNEL_KEY, jobId, fnName, ...args);

        _updateJob(jobId, {
          resolve,
          reject,
          args: _DEBUG ? args : null,
        });

        setTimeout(
          () =>
            reject(new Error(`SQL channel job ${jobId} (${fnName}) timed out`)),
          DATABASE_UPDATE_TIMEOUT
        );
      });
    };
  }

  forEach(window.data, fn => {
    if (isFunction(fn)) {
      makeChannel(fn.name);
    }
  });

  // Note: will need to restart the app after calling this, to set up afresh
  async function close() {
    await channels.close();
  }

  // Note: will need to restart the app after calling this, to set up afresh
  async function removeDB() {
    await channels.removeDB();
  }

  async function getConversationCount() {
    return channels.getConversationCount();
  }

  async function saveConversation(data) {
    await channels.saveConversation(data);
  }

  async function saveConversations(data) {
    await channels.saveConversations(data);
  }

  async function getConversationById(id, { Conversation }) {
    const data = await channels.getConversationById(id);
    return new Conversation(data);
  }

  async function updateConversation(id, data, { Conversation }) {
    const existing = await getConversationById(id, { Conversation });
    if (!existing) {
      throw new Error(`Conversation ${id} does not exist!`);
    }

    const merged = merge({}, existing.attributes, data);
    await channels.updateConversation(merged);
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

  async function getAllConversations({ ConversationCollection }) {
    const conversations = await channels.getAllConversations();

    const collection = new ConversationCollection();
    collection.add(conversations);
    return collection;
  }

  async function getAllConversationIds() {
    const ids = await channels.getAllConversationIds();
    return ids;
  }

  async function getAllPrivateConversations({ ConversationCollection }) {
    const conversations = await channels.getAllPrivateConversations();

    const collection = new ConversationCollection();
    collection.add(conversations);
    return collection;
  }

  async function getAllGroupsInvolvingId(id, { ConversationCollection }) {
    const conversations = await channels.getAllGroupsInvolvingId(id);

    const collection = new ConversationCollection();
    collection.add(conversations);
    return collection;
  }

  async function searchConversations(query, { ConversationCollection }) {
    const conversations = await channels.searchConversations(query);

    const collection = new ConversationCollection();
    collection.add(conversations);
    return collection;
  }

  async function getMessageCount() {
    return channels.getMessageCount();
  }

  async function saveMessage(data, { forceSave, Message } = {}) {
    const id = await channels.saveMessage(_cleanData(data), { forceSave });
    Message.refreshExpirationTimer();
    return id;
  }

  async function saveLegacyMessage(data, { Message }) {
    const message = new Message(data);
    await deferredToPromise(message.save());
    return message.id;
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
  async function getAllMessages({ MessageCollection }) {
    const messages = await channels.getAllMessages();
    return new MessageCollection(messages);
  }

  async function getAllMessageIds() {
    const ids = await channels.getAllMessageIds();
    return ids;
  }

  async function getMessageBySender(
    // eslint-disable-next-line camelcase
    { source, sourceDevice, sent_at },
    { Message }
  ) {
    const messages = await channels.getMessageBySender({
      source,
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

  async function getMessagesByConversation(
    conversationId,
    { limit = 100, receivedAt = Number.MAX_VALUE, MessageCollection }
  ) {
    const messages = await channels.getMessagesByConversation(conversationId, {
      limit,
      receivedAt,
    });

    return new MessageCollection(messages);
  }

  async function removeAllMessagesInConversation(
    conversationId,
    { MessageCollection }
  ) {
    let messages;
    do {
      // Yes, we really want the await in the loop. We're deleting 100 at a
      //   time so we don't use too much memory.
      // eslint-disable-next-line no-await-in-loop
      messages = await getMessagesByConversation(conversationId, {
        limit: 100,
        MessageCollection,
      });

      if (!messages.length) {
        return;
      }

      const ids = messages.map(message => message.id);

      // Note: It's very important that these models are fully hydrated because
      //   we need to delete all associated on-disk files along with the database delete.
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(messages.map(message => message.cleanup()));

      // eslint-disable-next-line no-await-in-loop
      await channels.removeMessage(ids);
    } while (messages.length > 0);
  }

  async function getMessagesBySentAt(sentAt, { MessageCollection }) {
    const messages = await channels.getMessagesBySentAt(sentAt);
    return new MessageCollection(messages);
  }

  async function getExpiredMessages({ MessageCollection }) {
    const messages = await channels.getExpiredMessages();
    return new MessageCollection(messages);
  }

  async function getOutgoingWithoutExpiresAt({ MessageCollection }) {
    const messages = await channels.getOutgoingWithoutExpiresAt();
    return new MessageCollection(messages);
  }

  async function getNextExpiringMessage({ MessageCollection }) {
    const messages = await channels.getNextExpiringMessage();
    return new MessageCollection(messages);
  }

  async function getUnprocessedCount() {
    return channels.getUnprocessedCount();
  }

  async function getAllUnprocessed() {
    return channels.getAllUnprocessed();
  }

  async function getUnprocessedById(id, { Unprocessed }) {
    const unprocessed = await channels.getUnprocessedById(id);
    if (!unprocessed) {
      return null;
    }

    return new Unprocessed(unprocessed);
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

  async function removeUnprocessed(id) {
    await channels.removeUnprocessed(id);
  }

  async function removeAllUnprocessed() {
    await channels.removeAllUnprocessed();
  }

  async function removeAll() {
    await channels.removeAll();
  }

  async function cleanupOrphanedAttachments() {
    await callChannel(CLEANUP_ORPHANED_ATTACHMENTS_KEY);
  }

  // Note: will need to restart the app after calling this, to set up afresh
  async function removeOtherData() {
    await Promise.all([
      callChannel(ERASE_SQL_KEY),
      callChannel(ERASE_ATTACHMENTS_KEY),
    ]);
  }

  async function callChannel(name) {
    return new Promise((resolve, reject) => {
      ipcRenderer.send(name);
      ipcRenderer.once(`${name}-done`, (event, error) => {
        if (error) {
          return reject(error);
        }

        return resolve();
      });

      setTimeout(
        () => reject(new Error(`callChannel call to ${name} timed out`)),
        DATABASE_UPDATE_TIMEOUT
      );
    });
  }

  // Functions below here return JSON

  async function getLegacyMessagesNeedingUpgrade(
    limit,
    { MessageCollection, maxVersion = MessageType.CURRENT_SCHEMA_VERSION }
  ) {
    const messages = new MessageCollection();

    await deferredToPromise(
      messages.fetch({
        limit,
        index: {
          name: 'schemaVersion',
          upper: maxVersion,
          excludeUpper: true,
          order: 'desc',
        },
      })
    );

    const models = messages.models || [];
    return models.map(model => model.toJSON());
  }

  async function getMessagesNeedingUpgrade(
    limit,
    { maxVersion = MessageType.CURRENT_SCHEMA_VERSION }
  ) {
    const messages = await channels.getMessagesNeedingUpgrade(limit, {
      maxVersion,
    });

    return messages;
  }

  async function getMessagesWithVisualMediaAttachments(
    conversationId,
    { limit }
  ) {
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