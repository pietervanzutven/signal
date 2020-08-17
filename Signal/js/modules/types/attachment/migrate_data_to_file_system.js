(function () {
  'use strict';

  window.types = window.types || {};
  window.types.attachment = window.types.attachment || {};
  window.types.attachment.migrate_data_to_file_system = {};

  const {
    isArrayBuffer,
    isFunction,
    isUndefined,
    omit,
  } = window.lodash;


  // type Context :: {
  //   writeNewAttachmentData :: ArrayBuffer -> Promise (IO Path)
  // }
  //
  //      migrateDataToFileSystem :: Attachment ->
  //                                 Context ->
  //                                 Promise Attachment
  window.types.attachment.migrate_data_to_file_system.migrateDataToFileSystem = async (attachment, { writeNewAttachmentData } = {}) => {
    if (!isFunction(writeNewAttachmentData)) {
      throw new TypeError("'writeNewAttachmentData' must be a function");
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

    const path = await writeNewAttachmentData(data);

    const attachmentWithoutData = omit(
      Object.assign({}, attachment, { path }),
      ['data']
    );
    return attachmentWithoutData;
  };
})();