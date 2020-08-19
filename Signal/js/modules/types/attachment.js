(function () {
  'use strict';

  window.types = window.types || {};
  window.types.attachment = window.types.attachment || {};

  const { isFunction, isString } = window.lodash;

  const MIME = window.types.mime;
  const { arrayBufferToBlob, blobToArrayBuffer, dataURLToBlob } = window.blob_util;
  const { autoOrientImage } = window.auto_orient_image;
  const { migrateDataToFileSystem } = window.types.attachment.migrate_data_to_file_system;

  // // Incoming message attachment fields
  // {
  //   id: string
  //   contentType: MIMEType
  //   data: ArrayBuffer
  //   digest: ArrayBuffer
  //   fileName: string | null
  //   flags: null
  //   key: ArrayBuffer
  //   size: integer
  //   thumbnail: ArrayBuffer
  // }

  // // Outgoing message attachment fields
  // {
  //   contentType: MIMEType
  //   data: ArrayBuffer
  //   fileName: string
  //   size: integer
  // }

  // Returns true if `rawAttachment` is a valid attachment based on our current schema.
  // Over time, we can expand this definition to become more narrow, e.g. require certain
  // fields, etc.
  window.types.attachment.isValid = (rawAttachment) => {
    // NOTE: We cannot use `_.isPlainObject` because `rawAttachment` is
    // deserialized by protobuf:
    if (!rawAttachment) {
      return false;
    }

    return true;
  };

  // Upgrade steps
  window.types.attachment.autoOrientJPEG = async (attachment) => {
    if (!MIME.isJPEG(attachment.contentType)) {
      return attachment;
    }

    const dataBlob = await arrayBufferToBlob(attachment.data, attachment.contentType);
    const newDataBlob = await dataURLToBlob(await autoOrientImage(dataBlob));
    const newDataArrayBuffer = await blobToArrayBuffer(newDataBlob);

    // IMPORTANT: We overwrite the existing `data` `ArrayBuffer` losing the original
    // image data. Ideally, we’d preserve the original image data for users who want to
    // retain it but due to reports of data loss, we don’t want to overburden IndexedDB
    // by potentially doubling stored image data.
    // See: https://github.com/signalapp/Signal-Desktop/issues/1589
    const newAttachment = Object.assign({}, attachment, {
      data: newDataArrayBuffer,
      size: newDataArrayBuffer.byteLength,
    });

    // `digest` is no longer valid for auto-oriented image data, so we discard it:
    delete newAttachment.digest;

    return newAttachment;
  };

  const UNICODE_LEFT_TO_RIGHT_OVERRIDE = '\u202D';
  const UNICODE_RIGHT_TO_LEFT_OVERRIDE = '\u202E';
  const UNICODE_REPLACEMENT_CHARACTER = '\uFFFD';
  const INVALID_CHARACTERS_PATTERN = new RegExp(
    `[${UNICODE_LEFT_TO_RIGHT_OVERRIDE}${UNICODE_RIGHT_TO_LEFT_OVERRIDE}]`,
    'g'
  );
  // NOTE: Expose synchronous version to do property-based testing using `testcheck`,
  // which currently doesn’t support async testing:
  // https://github.com/leebyron/testcheck-js/issues/45
  window.types.attachment._replaceUnicodeOrderOverridesSync = (attachment) => {
    if (!isString(attachment.fileName)) {
      return attachment;
    }

    const normalizedFilename = attachment.fileName.replace(
      INVALID_CHARACTERS_PATTERN,
      UNICODE_REPLACEMENT_CHARACTER
    );
    const newAttachment = Object.assign({}, attachment, {
      fileName: normalizedFilename,
    });

    return newAttachment;
  };

  window.types.attachment.replaceUnicodeOrderOverrides = async attachment =>
    window.types.attachment._replaceUnicodeOrderOverridesSync(attachment);

  window.types.attachment.removeSchemaVersion = (attachment) => {
    if (!window.types.attachment.isValid(attachment)) {
      console.log('Attachment.removeSchemaVersion: Invalid input attachment:', attachment);
      return attachment;
    }

    const attachmentWithoutSchemaVersion = Object.assign({}, attachment);
    delete attachmentWithoutSchemaVersion.schemaVersion;
    return attachmentWithoutSchemaVersion;
  };

  window.types.attachment.migrateDataToFileSystem = migrateDataToFileSystem;

  //      hasData :: Attachment -> Boolean
  window.types.attachment.hasData = attachment =>
    attachment.data instanceof ArrayBuffer || ArrayBuffer.isView(attachment.data);

  //      loadData :: (RelativePath -> IO (Promise ArrayBuffer))
  //                  Attachment ->
  //                  IO (Promise Attachment)
  window.types.attachment.loadData = (readAttachmentData) => {
    if (!isFunction(readAttachmentData)) {
      throw new TypeError("'readAttachmentData' must be a function");
    }

    return async (attachment) => {
      if (!window.types.attachment.isValid(attachment)) {
        throw new TypeError("'attachment' is not valid");
      }

      const isAlreadyLoaded = window.types.attachment.hasData(attachment);
      if (isAlreadyLoaded) {
        return attachment;
      }

      if (!isString(attachment.path)) {
        throw new TypeError("'attachment.path' is required");
      }

      const data = await readAttachmentData(attachment.path);
      return Object.assign({}, attachment, { data });
    };
  };

  //      deleteData :: (RelativePath -> IO Unit)
  //                    Attachment ->
  //                    IO Unit
  window.types.attachment.deleteData = (deleteAttachmentData) => {
    if (!isFunction(deleteAttachmentData)) {
      throw new TypeError("'deleteAttachmentData' must be a function");
    }

    return async (attachment) => {
      if (!window.types.attachment.isValid(attachment)) {
        throw new TypeError("'attachment' is not valid");
      }

      const hasDataInMemory = window.types.attachment.hasData(attachment);
      if (hasDataInMemory) {
        return;
      }

      if (!isString(attachment.path)) {
        throw new TypeError("'attachment.path' is required");
      }

      await deleteAttachmentData(attachment.path);
    };
  };
})();