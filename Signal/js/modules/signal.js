// The idea with this file is to make it webpackable for the style guide

(function () {
  'use strict';

  const exports = window.signal = {};

  const Backbone = window.ts.backbone;
  const Crypto = window.crypto;
  const Database = window.database;
  const Emoji = window.ts.util.emoji;
  const Message = window.types.message;
  const Notifications = window.ts.notifications;
  const OS = window.ts.OS;
  const Settings = window.settings;
  const Startup = window.startup;
  const Util = window.ts.util;
  const Metadata = window.metadata.SecretSessionCipher;

  // Components
  const {
    ContactDetail,
  } = window.ts.components.conversation.ContactDetail;
  const { ContactListItem } = window.ts.components.ContactListItem;
  const { ContactName } = window.ts.components.conversation.ContactName;
  const {
    ConversationTitle,
  } = window.ts.components.conversation.ConversationTitle;
  const {
    EmbeddedContact,
  } = window.ts.components.conversation.EmbeddedContact;
  const { Emojify } = window.ts.components.conversation.Emojify;
  const { Lightbox } = window.ts.components.Lightbox;
  const { LightboxGallery } = window.ts.components.LightboxGallery;
  const {
    MediaGallery,
  } = window.ts.components.conversation.media_gallery.MediaGallery;
  const { MessageBody } = window.ts.components.conversation.MessageBody;
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

  function initializeMigrations({
    Attachments,
    userDataPath,
    Type,
    getRegionCode,
  }) {
    if (!Attachments) {
      return null;
    }

    const attachmentsPath = Attachments.getPath(userDataPath);
    const readAttachmentData = Attachments.createReader(attachmentsPath);
    const loadAttachmentData = Type.loadData(readAttachmentData);

    return {
      attachmentsPath,
      deleteAttachmentData: Type.deleteData(
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
          getRegionCode,
        }),
      writeMessageAttachments: Message.createAttachmentDataWriter(
        Attachments.createWriterForExisting(attachmentsPath)
      ),
    };
  }

  exports.setup = (options = {}) => {
    const { Attachments, userDataPath, getRegionCode } = options;

    const Migrations = initializeMigrations({
      Attachments,
      userDataPath,
      Type: AttachmentType,
      getRegionCode,
    });

    const Components = {
      ContactDetail,
      ContactListItem,
      ContactName,
      ConversationTitle,
      EmbeddedContact,
      Emojify,
      Lightbox,
      LightboxGallery,
      MediaGallery,
      MessageBody,
      Types: {
        Message: MediaGalleryMessage,
      },
      Quote,
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
      Metadata,
      Backbone,
      Components,
      Crypto,
      Database,
      Emoji,
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