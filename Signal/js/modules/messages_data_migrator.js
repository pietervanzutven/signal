// Ensures that messages in database are at the right schema.

/* global window */

(function () {
  'use strict';

  const exports = window.messages_data_migrator = {};

  const { isFunction, isNumber } = window.lodash;

  const Message = window.types.message;

  exports.processNext = async ({
    BackboneMessage,
    BackboneMessageCollection,
    numMessagesPerBatch,
    upgradeMessageSchema,
    getMessagesNeedingUpgrade,
    saveMessage,
    maxVersion = Message.CURRENT_SCHEMA_VERSION,
  } = {}) => {
    if (!isFunction(BackboneMessage)) {
      throw new TypeError(
        "'BackboneMessage' (Whisper.Message) constructor is required"
      );
    }

    if (!isFunction(BackboneMessageCollection)) {
      throw new TypeError(
        "'BackboneMessageCollection' (Whisper.MessageCollection)" +
        ' constructor is required'
      );
    }

    if (!isNumber(numMessagesPerBatch)) {
      throw new TypeError("'numMessagesPerBatch' is required");
    }

    if (!isFunction(upgradeMessageSchema)) {
      throw new TypeError("'upgradeMessageSchema' is required");
    }

    const startTime = Date.now();

    const fetchStartTime = Date.now();
    let messagesRequiringSchemaUpgrade;
    try {
      messagesRequiringSchemaUpgrade = await getMessagesNeedingUpgrade(
        numMessagesPerBatch,
        {
          maxVersion,
          MessageCollection: BackboneMessageCollection,
        }
      );
    } catch (error) {
      window.log.error(
        'processNext error:',
        error && error.stack ? error.stack : error
      );
      return {
        done: true,
        numProcessed: 0,
      };
    }
    const fetchDuration = Date.now() - fetchStartTime;

    const upgradeStartTime = Date.now();
    const upgradedMessages = await Promise.all(
      messagesRequiringSchemaUpgrade.map(message =>
        upgradeMessageSchema(message, { maxVersion })
      )
    );
    const upgradeDuration = Date.now() - upgradeStartTime;

    const saveStartTime = Date.now();
    await Promise.all(
      upgradedMessages.map(message =>
        saveMessage(message, { Message: BackboneMessage })
      )
    );
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
})();