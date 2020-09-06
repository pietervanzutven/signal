// The idea with this file is to make it webpackable for the style guide

(function () {
  'use strict';

  const exports = window.signal = {};

  const Backbone = window.ts.backbone;
  const Crypto = window.crypto;
  const Database = window.database;
  const HTML = window.ts.html;
  const Message = window.types.message;
  const Notifications = window.ts.notifications;
  const OS = window.ts.OS;
  const Settings = window.settings;
  const Startup = window.startup;
  const Util = window.ts.util;

  // Components
  const {
    ContactDetail,
  } = window.ts.components.conversation.ContactDetail;
  const {
    EmbeddedContact,
  } = window.ts.components.conversation.EmbeddedContact;
  const { Lightbox } = window.ts.components.Lightbox;
  const { LightboxGallery } = window.ts.components.LightboxGallery;
  const {
    MediaGallery,
  } = window.ts.components.conversation.media_gallery.MediaGallery;
  const { Quote } = window.ts.components.conversation.Quote;

  // Migrations
  const {
    getPlaceholderMigrations,
  } = window.migrations.get_placeholder_migrations;

  const Migrations0DatabaseWithAttachmentData = window.migrations.migrations_0_database_with_attachment_data;
  const Migrations1DatabaseWithoutAttachmentData = window.migrations.migrations_1_database_without_attachment_data;

  // Types
  const AttachmentType = window.types.attachment;
  const Contact = window.ts.types.Contact;
  const Conversation = window.ts.types.Conversation;
  const Errors = window.types.errors;
  const MediaGalleryMessage = window.ts.components.conversation.media_gallery.types.Message;
  const MIME = window.ts.types.MIME;
  const SettingsType = window.ts.types.Settings;

  // Views
  const Initialization = window.views.initialization;

  // Workflow
  const { IdleDetector } = window.idle_detector;
  const MessageDataMigrator = window.messages_data_migrator;

  exports.setup = (options = {}) => {
    const { Attachments, userDataPath } = options;

    const Components = {
      ContactDetail,
      EmbeddedContact,
      Lightbox,
      LightboxGallery,
      MediaGallery,
      Types: {
        Message: MediaGalleryMessage,
      },
      Quote,
    };

    const attachmentsPath = Attachments.getPath(userDataPath);
    const readAttachmentData = Attachments.createReader(attachmentsPath);
    const loadAttachmentData = AttachmentType.loadData(readAttachmentData);

    const Migrations = {
      attachmentsPath,
      deleteAttachmentData: AttachmentType.deleteData(
        Attachments.createDeleter(attachmentsPath)
      ),
      getAbsoluteAttachmentPath: Attachments.createAbsolutePathGetter(
        attachmentsPath
      ),
      getPlaceholderMigrations,
      loadAttachmentData,
      loadMessage: Message.createAttachmentLoader(loadAttachmentData),
      Migrations0DatabaseWithAttachmentData,
      Migrations1DatabaseWithoutAttachmentData,
      upgradeMessageSchema: message =>
        Message.upgradeSchema(message, {
          writeNewAttachmentData: Attachments.createWriterForNew(attachmentsPath),
        }),
      writeMessageAttachments: Message.createAttachmentDataWriter(
        Attachments.createWriterForExisting(attachmentsPath)
      ),
    };

    const Types = {
      Attachment: AttachmentType,
      Contact,
      Conversation,
      Errors,
      Message,
      MIME,
      Settings: SettingsType,
    };

    const Views = {
      Initialization,
    };

    const Workflow = {
      IdleDetector,
      MessageDataMigrator,
    };

    return {
      Backbone,
      Components,
      Crypto,
      Database,
      HTML,
      Migrations,
      Notifications,
      OS,
      Settings,
      Startup,
      Types,
      Util,
      Views,
      Workflow,
    };
  };
})();