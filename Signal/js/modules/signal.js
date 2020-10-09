// The idea with this file is to make it webpackable for the style guide

(function () {
  'use strict';

  const exports = window.signal = {};

  const Backbone = window.ts.backbone;
  const Crypto = window.crypto;
  const Database = window.database;
  const Emoji = window.ts.util.emoji;
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
    ConversationHeader,
  } = window.ts.components.conversation.ConversationHeader;
  const {
    EmbeddedContact,
  } = window.ts.components.conversation.EmbeddedContact;
  const { Emojify } = window.ts.components.conversation.Emojify;
  const {
    GroupNotification,
  } = window.ts.components.conversation.GroupNotification;
  const { Lightbox } = window.ts.components.Lightbox;
  const { LightboxGallery } = window.ts.components.LightboxGallery;
  const {
    MediaGallery,
  } = window.ts.components.conversation.media_gallery.MediaGallery;
  const { Message } = window.ts.components.conversation.Message;
  const { MessageBody } = window.ts.components.conversation.MessageBody;
  const {
    MessageDetail,
  } = window.ts.components.conversation.MessageDetail;
  const { Quote } = window.ts.components.conversation.Quote;
  const {
    ResetSessionNotification,
  } = window.ts.components.conversation.ResetSessionNotification;
  const {
    SafetyNumberNotification,
  } = window.ts.components.conversation.SafetyNumberNotification;
  const {
    TimerNotification,
  } = window.ts.components.conversation.TimerNotification;
  const {
    VerificationNotification,
  } = window.ts.components.conversation.VerificationNotification;

  // Migrations
  const {
    getPlaceholderMigrations,
  } = window.migrations.get_placeholder_migrations;

  const Migrations0DatabaseWithAttachmentData = window.migrations.migrations_0_database_with_attachment_data;
  const Migrations1DatabaseWithoutAttachmentData = window.migrations.migrations_1_database_without_attachment_data;

  // Types
  const AttachmentType = window.types.attachment;
  const VisualAttachment = window.types.visual_attachment;
  const Contact = window.ts.types.Contact;
  const Conversation = window.ts.types.Conversation;
  const Errors = window.types.errors;
  const MediaGalleryMessage = window.ts.components.conversation.media_gallery.types.Message;
  const MessageType = window.types.message;
  const MIME = window.ts.types.MIME;
  const PhoneNumber = window.ts.types.PhoneNumber;
  const SettingsType = window.ts.types.Settings;

  // Views
  const Initialization = window.views.initialization;

  // Workflow
  const { IdleDetector } = window.idle_detector;
  const MessageDataMigrator = window.messages_data_migrator;

  function initializeMigrations({
    userDataPath,
    getRegionCode,
    Attachments,
    Type,
    VisualType,
  }) {
    if (!Attachments) {
      return null;
    }
    const {
      getPath,
      createReader,
      createAbsolutePathGetter,
      createWriterForNew,
      createWriterForExisting,
    } = Attachments;
    const {
      makeObjectUrl,
      revokeObjectUrl,
      getImageDimensions,
      makeImageThumbnail,
      makeVideoScreenshot,
    } = VisualType;

    const attachmentsPath = getPath(userDataPath);
    const readAttachmentData = createReader(attachmentsPath);
    const loadAttachmentData = Type.loadData(readAttachmentData);
    const getAbsoluteAttachmentPath = createAbsolutePathGetter(attachmentsPath);

    return {
      attachmentsPath,
      deleteAttachmentData: Type.deleteData(
        Attachments.createDeleter(attachmentsPath)
      ),
      getAbsoluteAttachmentPath,
      getPlaceholderMigrations,
      loadAttachmentData,
      loadMessage: MessageType.createAttachmentLoader(loadAttachmentData),
      Migrations0DatabaseWithAttachmentData,
      Migrations1DatabaseWithoutAttachmentData,
      upgradeMessageSchema: message =>
        MessageType.upgradeSchema(message, {
          writeNewAttachmentData: createWriterForNew(attachmentsPath),
          getRegionCode,
          getAbsoluteAttachmentPath,
          makeObjectUrl,
          revokeObjectUrl,
          getImageDimensions,
          makeImageThumbnail,
          makeVideoScreenshot,
        }),
      writeMessageAttachments: MessageType.createAttachmentDataWriter(
        createWriterForExisting(attachmentsPath)
      ),
    };
  }

  exports.setup = (options = {}) => {
    const { Attachments, userDataPath, getRegionCode } = options;

    const Migrations = initializeMigrations({
      userDataPath,
      getRegionCode,
      Attachments,
      Type: AttachmentType,
      VisualType: VisualAttachment,
    });

    const Components = {
      ContactDetail,
      ContactListItem,
      ContactName,
      ConversationHeader,
      EmbeddedContact,
      Emojify,
      GroupNotification,
      Lightbox,
      LightboxGallery,
      MediaGallery,
      Message,
      MessageBody,
      MessageDetail,
      Quote,
      ResetSessionNotification,
      SafetyNumberNotification,
      TimerNotification,
      Types: {
        Message: MediaGalleryMessage,
      },
      VerificationNotification,
    };

    const Types = {
      Attachment: AttachmentType,
      Contact,
      Conversation,
      Errors,
      Message: MessageType,
      MIME,
      PhoneNumber,
      Settings: SettingsType,
      VisualAttachment,
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