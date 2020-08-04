(function () {
    window.types = window.types || {};
    window.types.message = {};

    const isFunction = window.lodash.isFunction;

    const Attachment = window.types.attachment;
    const Errors = window.types.errors;
    const SchemaVersion = window.types.schema_version;


    const GROUP = 'group';
    const PRIVATE = 'private';

    // Schema version history
    //
    // Version 0
    //   - Schema initialized
    // Version 1
    //   - Attachments: Auto-orient JPEG attachments using EXIF `Orientation` data.
    // Version 2
    //   - Attachments: Sanitize Unicode order override characters.
    // Version 3
    //   - Attachments: Write attachment data to disk and store relative path to it.

    const INITIAL_SCHEMA_VERSION = 0;

    // Increment this version number every time we add a message schema upgrade
    // step. This will allow us to retroactively upgrade existing messages. As we
    // add more upgrade steps, we could design a pipeline that does this
    // incrementally, e.g. from version 0 / unknown -> 1, 1 --> 2, etc., similar to
    // how we do database migrations:
    window.types.message.CURRENT_SCHEMA_VERSION = 3;


    // Public API
    window.types.message.GROUP = GROUP;
    window.types.message.PRIVATE = PRIVATE;

    // Placeholder until we have stronger preconditions:
    window.types.message.isValid = () =>
        true;

    // Schema
    window.types.message.initializeSchemaVersion = (message) => {
        const isInitialized = SchemaVersion.isValid(message.schemaVersion) &&
            message.schemaVersion >= 1;
        if (isInitialized) {
            return message;
        }

        const numAttachments = Array.isArray(message.attachments)
            ? message.attachments.length
            : 0;
        const hasAttachments = numAttachments > 0;
        if (!hasAttachments) {
            return Object.assign(
                {},
                message,
                { schemaVersion: INITIAL_SCHEMA_VERSION }
            );
        }

        // All attachments should have the same schema version, so we just pick
        // the first one:
        const firstAttachment = message.attachments[0];
        const inheritedSchemaVersion = SchemaVersion.isValid(firstAttachment.schemaVersion)
            ? firstAttachment.schemaVersion
            : INITIAL_SCHEMA_VERSION;
        const messageWithInitialSchema = Object.assign(
            {},
            message,
            {
                schemaVersion: inheritedSchemaVersion,
                attachments: message.attachments.map(Attachment.removeSchemaVersion),
            }
        );

        return messageWithInitialSchema;
    };

    // Middleware
    // type UpgradeStep = (Message, Context) -> Promise Message

    // SchemaVersion -> UpgradeStep -> UpgradeStep
    window.types.message._withSchemaVersion = (schemaVersion, upgrade) => {
        if (!SchemaVersion.isValid(schemaVersion)) {
            throw new TypeError('"schemaVersion" is invalid');
        }
        if (!isFunction(upgrade)) {
            throw new TypeError('"upgrade" must be a function');
        }

        return async (message, context) => {
            if (!window.types.message.isValid(message)) {
                console.log('Message._withSchemaVersion: Invalid input message:', message);
                return message;
            }

            const isAlreadyUpgraded = message.schemaVersion >= schemaVersion;
            if (isAlreadyUpgraded) {
                return message;
            }

            const expectedVersion = schemaVersion - 1;
            const hasExpectedVersion = message.schemaVersion === expectedVersion;
            if (!hasExpectedVersion) {
                console.log(
                    'WARNING: Message._withSchemaVersion: Unexpected version:',
                    `Expected message to have version ${expectedVersion},`,
                    `but got ${message.schemaVersion}.`,
                    message
                );
                return message;
            }

            let upgradedMessage;
            try {
                upgradedMessage = await upgrade(message, context);
            } catch (error) {
                console.log(
                    'Message._withSchemaVersion: error:',
                    Errors.toLogFormat(error)
                );
                return message;
            }

            if (!window.types.message.isValid(upgradedMessage)) {
                console.log(
                    'Message._withSchemaVersion: Invalid upgraded message:',
                    upgradedMessage
                );
                return message;
            }

            return Object.assign(
                {},
                upgradedMessage,
                { schemaVersion }
            );
        };
    };


    // Public API
    //      _mapAttachments :: (Attachment -> Promise Attachment) ->
    //                         (Message, Context) ->
    //                         Promise Message
    window.types.message._mapAttachments = upgradeAttachment => async (message, context) => {
        const upgradeWithContext = attachment =>
            upgradeAttachment(attachment, context);
        const attachments = await Promise.all(message.attachments.map(upgradeWithContext));
        return Object.assign({}, message, { attachments });
    };

    const toVersion0 = async message =>
        window.types.message.initializeSchemaVersion(message);

    const toVersion1 = window.types.message._withSchemaVersion(
        1,
        window.types.message._mapAttachments(Attachment.autoOrientJPEG)
    );
    const toVersion2 = window.types.message._withSchemaVersion(
        2,
        window.types.message._mapAttachments(Attachment.replaceUnicodeOrderOverrides)
    );
    const toVersion3 = window.types.message._withSchemaVersion(
        3,
        window.types.message._mapAttachments(Attachment.migrateDataToFileSystem)
    );

    // UpgradeStep
    window.types.message.upgradeSchema = async (message, { writeAttachmentData } = {}) =>
        toVersion3(
            await toVersion2(await toVersion1(await toVersion0(message))),
            { writeAttachmentData }
        );

})();