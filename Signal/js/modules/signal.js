// The idea with this file is to make it webpackable for the style guide

(function () {
  'use strict';

  const exports = window.signal = {};

  const { bindActionCreators } = window.redux;
  const Backbone = window.ts.backbone;
  const Crypto = window.crypto;
  const Data = window.data;
  const Database = window.database;
  const Emojis = window.emojis;
  const EmojiLib = window.ts.components.emoji.lib;
  const IndexedDB = window.indexeddb;
  const Notifications = window.ts.notifications;
  const OS = window.ts.OS;
  const Stickers = window.stickers;
  const Settings = window.settings;
  const Util = window.ts.util;
  const { migrateToSQL } = window.migrate_to_sql;
  const Metadata = window.metadata.SecretSessionCipher;
  const RefreshSenderCertificate = window.refresh_sender_certificate;
  const LinkPreviews = window.link_previews;
  const AttachmentDownloads = window.attachment_downloads;

  // Components
  const {
    AttachmentList,
  } = window.ts.components.conversation.AttachmentList;
  const { CaptionEditor } = window.ts.components.CaptionEditor;
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
    StagedLinkPreview,
  } = window.ts.components.conversation.StagedLinkPreview;
  const {
    TimerNotification,
  } = window.ts.components.conversation.TimerNotification;
  const {
    TypingBubble,
  } = window.ts.components.conversation.TypingBubble;
  const {
    UnsupportedMessage,
  } = window.ts.components.conversation.UnsupportedMessage;
  const {
    VerificationNotification,
  } = window.ts.components.conversation.VerificationNotification;

  // State
  const {
    createCompositionArea,
  } = window.ts.state.roots.createCompositionArea;
  const { createLeftPane } = window.ts.state.roots.createLeftPane;
  const {
    createStickerManager,
  } = window.ts.state.roots.createStickerManager;
  const {
    createStickerPreviewModal,
  } = window.ts.state.roots.createStickerPreviewModal;

  const { createStore } = window.ts.state.createStore;
  const conversationsDuck = window.ts.state.ducks.conversations;
  const emojisDuck = window.ts.state.ducks.emojis;
  const itemsDuck = window.ts.state.ducks.items;
  const stickersDuck = window.ts.state.ducks.stickers;
  const userDuck = window.ts.state.ducks.user;

  // Migrations
  const {
    getPlaceholderMigrations,
    getCurrentVersion,
  } = window.migrations.get_placeholder_migrations;
  const { run } = window.migrations.migrations;

  // Types
  const AttachmentType = window.types.attachment;
  const VisualAttachment = window.types.visual_attachment;
  const Contact = window.ts.types.Contact;
  const Conversation = window.types.conversation;
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
    logger,
  }) {
    if (!Attachments) {
      return null;
    }
    const {
      getPath,
      getStickersPath,
      getTempPath,
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
    const loadPreviewData = MessageType.loadPreviewData(loadAttachmentData);
    const loadQuoteData = MessageType.loadQuoteData(loadAttachmentData);
    const loadStickerData = MessageType.loadStickerData(loadAttachmentData);
    const getAbsoluteAttachmentPath = createAbsolutePathGetter(attachmentsPath);
    const deleteOnDisk = Attachments.createDeleter(attachmentsPath);
    const writeNewAttachmentData = createWriterForNew(attachmentsPath);
    const copyIntoAttachmentsDirectory = Attachments.copyIntoAttachmentsDirectory(
      attachmentsPath
    );

    const stickersPath = getStickersPath(userDataPath);
    const writeNewStickerData = createWriterForNew(stickersPath);
    const getAbsoluteStickerPath = createAbsolutePathGetter(stickersPath);
    const deleteSticker = Attachments.createDeleter(stickersPath);
    const readStickerData = createReader(stickersPath);

    const tempPath = getTempPath(userDataPath);
    const getAbsoluteTempPath = createAbsolutePathGetter(tempPath);
    const writeNewTempData = createWriterForNew(tempPath);
    const deleteTempFile = Attachments.createDeleter(tempPath);
    const readTempData = createReader(tempPath);

    return {
      attachmentsPath,
      copyIntoAttachmentsDirectory,
      deleteAttachmentData: deleteOnDisk,
      deleteExternalMessageFiles: MessageType.deleteAllExternalFiles({
        deleteAttachmentData: Type.deleteData(deleteOnDisk),
        deleteOnDisk,
      }),
      deleteSticker,
      deleteTempFile,
      getAbsoluteAttachmentPath,
      getAbsoluteStickerPath,
      getPlaceholderMigrations,
      getCurrentVersion,
      loadAttachmentData,
      loadMessage: MessageType.createAttachmentLoader(loadAttachmentData),
      loadPreviewData,
      loadQuoteData,
      loadStickerData,
      readAttachmentData,
      readStickerData,
      readTempData,
      run,
      processNewAttachment: attachment =>
        MessageType.processNewAttachment(attachment, {
          writeNewAttachmentData,
          getAbsoluteAttachmentPath,
          makeObjectUrl,
          revokeObjectUrl,
          getImageDimensions,
          makeImageThumbnail,
          makeVideoScreenshot,
          logger,
        }),
      processNewSticker: stickerData =>
        MessageType.processNewSticker(stickerData, {
          writeNewStickerData,
          getAbsoluteStickerPath,
          getImageDimensions,
          logger,
        }),
      processNewEphemeralSticker: stickerData =>
        MessageType.processNewSticker(stickerData, {
          writeNewStickerData: writeNewTempData,
          getAbsoluteStickerPath: getAbsoluteTempPath,
          getImageDimensions,
          logger,
        }),
      upgradeMessageSchema: (message, options = {}) => {
        const { maxVersion } = options;

        return MessageType.upgradeSchema(message, {
          writeNewAttachmentData,
          getRegionCode,
          getAbsoluteAttachmentPath,
          makeObjectUrl,
          revokeObjectUrl,
          getImageDimensions,
          makeImageThumbnail,
          makeVideoScreenshot,
          logger,
          maxVersion,
        });
      },
      writeMessageAttachments: MessageType.createAttachmentDataWriter({
        writeExistingAttachmentData: createWriterForExisting(attachmentsPath),
        logger,
      }),
      writeNewAttachmentData: createWriterForNew(attachmentsPath),
    };
  }

  exports.setup = (options = {}) => {
    const { Attachments, userDataPath, getRegionCode, logger } = options;

    const Migrations = initializeMigrations({
      userDataPath,
      getRegionCode,
      Attachments,
      Type: AttachmentType,
      VisualType: VisualAttachment,
      logger,
    });

    const Components = {
      AttachmentList,
      CaptionEditor,
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
      StagedLinkPreview,
      TimerNotification,
      Types: {
        Message: MediaGalleryMessage,
      },
      TypingBubble,
      UnsupportedMessage,
      VerificationNotification,
    };

    const Roots = {
      createCompositionArea,
      createLeftPane,
      createStickerManager,
      createStickerPreviewModal,
    };
    const Ducks = {
      conversations: conversationsDuck,
      emojis: emojisDuck,
      items: itemsDuck,
      user: userDuck,
      stickers: stickersDuck,
    };
    const State = {
      bindActionCreators,
      createStore,
      Roots,
      Ducks,
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
      AttachmentDownloads,
      Backbone,
      Components,
      Crypto,
      Data,
      Database,
      Emojis,
      EmojiLib,
      IndexedDB,
      LinkPreviews,
      Metadata,
      migrateToSQL,
      Migrations,
      Notifications,
      OS,
      RefreshSenderCertificate,
      Settings,
      State,
      Stickers,
      Types,
      Util,
      Views,
      Workflow,
    };
  };
})();