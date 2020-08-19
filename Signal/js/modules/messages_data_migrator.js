(function () {
  'use strict';

  window.messages_data_migrator = {};

  // Module to upgrade the schema of messages, e.g. migrate attachments to disk.
  // `dangerouslyProcessAllWithoutIndex` purposely doesn’t rely on our Backbone
  // IndexedDB adapter to prevent automatic migrations. Rather, it uses direct
  // IndexedDB access. This includes avoiding usage of `storage` module which uses
  // Backbone under the hood.

  /* global IDBKeyRange */

  const {
    isFunction,
    isNumber,
    isObject,
    isString,
    last,
  } = window.lodash;

  const database = window.database;
  const Message = window.types.message;
  const settings = window.settings;
  const { deferredToPromise } = window.deferred_to_promise;


  const MESSAGES_STORE_NAME = 'messages';

  window.messages_data_migrator.processNext = async ({
    BackboneMessage,
    BackboneMessageCollection,
    numMessagesPerBatch,
    upgradeMessageSchema,
  } = {}) => {
    if (!isFunction(BackboneMessage)) {
      throw new TypeError("'BackboneMessage' (Whisper.Message) constructor is required");
    }

    if (!isFunction(BackboneMessageCollection)) {
      throw new TypeError("'BackboneMessageCollection' (Whisper.MessageCollection)" +
        ' constructor is required');
    }

    if (!isNumber(numMessagesPerBatch)) {
      throw new TypeError("'numMessagesPerBatch' is required");
    }

    if (!isFunction(upgradeMessageSchema)) {
      throw new TypeError("'upgradeMessageSchema' is required");
    }

    const startTime = Date.now();

    const fetchStartTime = Date.now();
    const messagesRequiringSchemaUpgrade =
      await _fetchMessagesRequiringSchemaUpgrade({
        BackboneMessageCollection,
        count: numMessagesPerBatch,
      });
    const fetchDuration = Date.now() - fetchStartTime;

    const upgradeStartTime = Date.now();
    const upgradedMessages =
      await Promise.all(messagesRequiringSchemaUpgrade.map(upgradeMessageSchema));
    const upgradeDuration = Date.now() - upgradeStartTime;

    const saveStartTime = Date.now();
    const saveMessage = _saveMessageBackbone({ BackboneMessage });
    await Promise.all(upgradedMessages.map(saveMessage));
    const saveDuration = Date.now() - saveStartTime;

    const totalDuration = Date.now() - startTime;
    const numProcessed = messagesRequiringSchemaUpgrade.length;
    const done = numProcessed < numMessagesPerBatch;
    return {
      done,
      numProcessed,
      fetchDuration,
      upgradeDuration,
      saveDuration,
      totalDuration,
    };
  };

  window.messages_data_migrator.dangerouslyProcessAllWithoutIndex = async ({
    databaseName,
    minDatabaseVersion,
    numMessagesPerBatch,
    upgradeMessageSchema,
  } = {}) => {
    if (!isString(databaseName)) {
      throw new TypeError("'databaseName' must be a string");
    }

    if (!isNumber(minDatabaseVersion)) {
      throw new TypeError("'minDatabaseVersion' must be a number");
    }

    if (!isNumber(numMessagesPerBatch)) {
      throw new TypeError("'numMessagesPerBatch' must be a number");
    }

    if (!isFunction(upgradeMessageSchema)) {
      throw new TypeError("'upgradeMessageSchema' is required");
    }

    const connection = await database.open(databaseName);
    const databaseVersion = connection.version;
    const isValidDatabaseVersion = databaseVersion >= minDatabaseVersion;
    console.log('Database status', {
      databaseVersion,
      isValidDatabaseVersion,
      minDatabaseVersion,
    });
    if (!isValidDatabaseVersion) {
      throw new Error(`Expected database version (${databaseVersion})` +
        ` to be at least ${minDatabaseVersion}`);
    }

    // NOTE: Even if we make this async using `then`, requesting `count` on an
    // IndexedDB store blocks all subsequent transactions, so we might as well
    // explicitly wait for it here:
    const numTotalMessages = await _getNumMessages({ connection });

    const migrationStartTime = Date.now();
    let numCumulativeMessagesProcessed = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const status = await _processBatch({
        connection,
        numMessagesPerBatch,
        upgradeMessageSchema,
      });
      if (status.done) {
        break;
      }
      numCumulativeMessagesProcessed += status.numMessagesProcessed;
      console.log('Upgrade message schema:', Object.assign({}, status, {
        numTotalMessages,
        numCumulativeMessagesProcessed,
      }));
    }

    console.log('Close database connection');
    connection.close();

    const totalDuration = Date.now() - migrationStartTime;
    console.log('Attachment migration complete:', {
      totalDuration,
      totalMessagesProcessed: numCumulativeMessagesProcessed,
    });
  };

  window.messages_data_migrator.processNextBatchWithoutIndex = async ({
    databaseName,
    minDatabaseVersion,
    numMessagesPerBatch,
    upgradeMessageSchema,
  } = {}) => {
    if (!isFunction(upgradeMessageSchema)) {
      throw new TypeError("'upgradeMessageSchema' is required");
    }

    const connection = await _getConnection({ databaseName, minDatabaseVersion });
    const batch = await _processBatch({
      connection,
      numMessagesPerBatch,
      upgradeMessageSchema,
    });
    return batch;
  };

  // Private API
  const _getConnection = async ({ databaseName, minDatabaseVersion }) => {
    if (!isString(databaseName)) {
      throw new TypeError("'databaseName' must be a string");
    }

    if (!isNumber(minDatabaseVersion)) {
      throw new TypeError("'minDatabaseVersion' must be a number");
    }

    const connection = await database.open(databaseName);
    const databaseVersion = connection.version;
    const isValidDatabaseVersion = databaseVersion >= minDatabaseVersion;
    if (!isValidDatabaseVersion) {
      throw new Error(`Expected database version (${databaseVersion})` +
        ` to be at least ${minDatabaseVersion}`);
    }

    return connection;
  };

  const _processBatch = async ({
    connection,
    numMessagesPerBatch,
    upgradeMessageSchema,
  } = {}) => {
    if (!isObject(connection)) {
      throw new TypeError("'connection' must be a string");
    }

    if (!isFunction(upgradeMessageSchema)) {
      throw new TypeError("'upgradeMessageSchema' is required");
    }

    if (!isNumber(numMessagesPerBatch)) {
      throw new TypeError("'numMessagesPerBatch' is required");
    }

    const isAttachmentMigrationComplete =
      await settings.isAttachmentMigrationComplete(connection);
    if (isAttachmentMigrationComplete) {
      return {
        done: true,
      };
    }

    const lastProcessedIndex =
      await settings.getAttachmentMigrationLastProcessedIndex(connection);

    const fetchUnprocessedMessagesStartTime = Date.now();
    const unprocessedMessages =
      await _dangerouslyFetchMessagesRequiringSchemaUpgradeWithoutIndex({
        connection,
        count: numMessagesPerBatch,
        lastIndex: lastProcessedIndex,
      });
    const fetchDuration = Date.now() - fetchUnprocessedMessagesStartTime;

    const upgradeStartTime = Date.now();
    const upgradedMessages =
      await Promise.all(unprocessedMessages.map(upgradeMessageSchema));
    const upgradeDuration = Date.now() - upgradeStartTime;

    const saveMessagesStartTime = Date.now();
    const transaction = connection.transaction(MESSAGES_STORE_NAME, 'readwrite');
    const transactionCompletion = database.completeTransaction(transaction);
    await Promise.all(upgradedMessages.map(_saveMessage({ transaction })));
    await transactionCompletion;
    const saveDuration = Date.now() - saveMessagesStartTime;

    const numMessagesProcessed = upgradedMessages.length;
    const done = numMessagesProcessed < numMessagesPerBatch;
    const lastMessage = last(upgradedMessages);
    const newLastProcessedIndex = lastMessage ? lastMessage.id : null;
    if (!done) {
      await settings.setAttachmentMigrationLastProcessedIndex(
        connection,
        newLastProcessedIndex
      );
    } else {
      await settings.markAttachmentMigrationComplete(connection);
      await settings.deleteAttachmentMigrationLastProcessedIndex(connection);
    }

    const batchTotalDuration = Date.now() - fetchUnprocessedMessagesStartTime;

    return {
      batchTotalDuration,
      done,
      fetchDuration,
      lastProcessedIndex,
      newLastProcessedIndex,
      numMessagesProcessed,
      saveDuration,
      targetSchemaVersion: Message.CURRENT_SCHEMA_VERSION,
      upgradeDuration,
    };
  };

  const _saveMessageBackbone = ({ BackboneMessage } = {}) => (message) => {
    const backboneMessage = new BackboneMessage(message);
    return deferredToPromise(backboneMessage.save());
  };

  const _saveMessage = ({ transaction } = {}) => (message) => {
    if (!isObject(transaction)) {
      throw new TypeError("'transaction' is required");
    }

    const messagesStore = transaction.objectStore(MESSAGES_STORE_NAME);
    const request = messagesStore.put(message, message.id);
    return new Promise((resolve, reject) => {
      request.onsuccess = () =>
        resolve();
      request.onerror = event =>
        reject(event.target.error);
    });
  };

  const _fetchMessagesRequiringSchemaUpgrade =
    async ({ BackboneMessageCollection, count } = {}) => {
      if (!isFunction(BackboneMessageCollection)) {
        throw new TypeError("'BackboneMessageCollection' (Whisper.MessageCollection)" +
          ' constructor is required');
      }

      if (!isNumber(count)) {
        throw new TypeError("'count' is required");
      }

      const collection = new BackboneMessageCollection();
      return new Promise(resolve => collection.fetch({
        limit: count,
        index: {
          name: 'schemaVersion',
          upper: Message.CURRENT_SCHEMA_VERSION,
          excludeUpper: true,
          order: 'desc',
        },
      }).always(() => {
        const models = collection.models || [];
        const messages = models.map(model => model.toJSON());
        resolve(messages);
      }));
    };

  // NOTE: Named ‘dangerous’ because it is not as efficient as using our
  // `messages` `schemaVersion` index:
  const _dangerouslyFetchMessagesRequiringSchemaUpgradeWithoutIndex =
    ({ connection, count, lastIndex } = {}) => {
      if (!isObject(connection)) {
        throw new TypeError("'connection' is required");
      }

      if (!isNumber(count)) {
        throw new TypeError("'count' is required");
      }

      if (lastIndex && !isString(lastIndex)) {
        throw new TypeError("'lastIndex' must be a string");
      }

      const hasLastIndex = Boolean(lastIndex);

      const transaction = connection.transaction(MESSAGES_STORE_NAME, 'readonly');
      const messagesStore = transaction.objectStore(MESSAGES_STORE_NAME);

      const excludeLowerBound = true;
      const range = hasLastIndex
        ? IDBKeyRange.lowerBound(lastIndex, excludeLowerBound)
        : undefined;
      return new Promise((resolve, reject) => {
        const items = [];
        const request = messagesStore.openCursor(range);
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          const hasMoreData = Boolean(cursor);
          if (!hasMoreData || items.length === count) {
            resolve(items);
            return;
          }
          const item = cursor.value;
          items.push(item);
          cursor.continue();
        };
        request.onerror = event =>
          reject(event.target.error);
      });
    };

  const _getNumMessages = async ({ connection } = {}) => {
    if (!isObject(connection)) {
      throw new TypeError("'connection' is required");
    }

    const transaction = connection.transaction(MESSAGES_STORE_NAME, 'readonly');
    const messagesStore = transaction.objectStore(MESSAGES_STORE_NAME);
    const numTotalMessages = await database.getCount({ store: messagesStore });
    await database.completeTransaction(transaction);

    return numTotalMessages;
  };
})();