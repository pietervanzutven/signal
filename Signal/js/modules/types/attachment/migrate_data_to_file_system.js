(function () {
    window.types = window.types || {};
    window.types.attachment = window.types.attachment || {};

    const isArrayBuffer = window.lodash.isArrayBuffer;
    const isFunction = window.lodash.isFunction;
    const isUndefined = window.lodash.isUndefined;
    const omit = window.lodash.omit;


    // type Context :: {
    //   writeAttachmentData :: ArrayBuffer -> Promise (IO Path)
    // }
    //
    //      migrateDataToFileSystem :: Attachment ->
    //                                 Context ->
    //                                 Promise Attachment
    window.types.attachment.migrate_data_to_file_system = {
        migrateDataToFileSystem: async (attachment, { writeAttachmentData } = {}) => {
            if (!isFunction(writeAttachmentData)) {
                throw new TypeError('"writeAttachmentData" must be a function');
            }

            const { data } = attachment;
            const hasData = !isUndefined(data);
            const shouldSkipSchemaUpgrade = !hasData;
            if (shouldSkipSchemaUpgrade) {
                console.log('WARNING: `attachment.data` is `undefined`');
                return attachment;
            }

            const isValidData = isArrayBuffer(data);
            if (!isValidData) {
                throw new TypeError('Expected `attachment.data` to be an array buffer;' +
                    ` got: ${typeof attachment.data}`);
            }

            const path = await writeAttachmentData(data);

            const attachmentWithoutData = omit(
                Object.assign({}, attachment, { path }),
                ['data']
            );
            return attachmentWithoutData;
        }
    }
})();
