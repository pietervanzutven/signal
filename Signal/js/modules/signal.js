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
  const {
    ConversationHeader,
  } = window.ts.components.conversation.ConversationHeader;
  const { Emojify } = window.ts.components.conversation.Emojify;
  const { Lightbox } = window.ts.components.Lightbox;
  const { LightboxGallery } = window.ts.components.LightboxGallery;
  const {
    MediaGallery,
  } = window.ts.components.conversation.media_gallery.MediaGallery;
  const {
    MessageDetail,
  } = window.ts.components.conversation.MessageDetail;
  const { Quote } = window.ts.components.conversation.Quote;
  const {
    StagedLinkPreview,
  } = window.ts.components.conversation.StagedLinkPreview;

  // State
  const { createTimeline } = window.ts.state.roots.createTimeline;
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
  const {
    createShortcutGuideModal,
  } = window.ts.state.roots.createShortcutGuideModal;

  const { createStore } = window.ts.state.createStore;
  const conversationsDuck = window.ts.state.ducks.conversations;
  const emojisDuck = window.ts.state.ducks.emojis;
  const expirationDuck = window.ts.state.ducks.expiration;
  const itemsDuck = window.ts.state.ducks.items;
  const networkDuck = window.ts.state.ducks.network;
  const searchDuck = window.ts.state.ducks.search;
  const stickersDuck = window.ts.state.ducks.stickers;
  const updatesDuck = window.ts.state.ducks.updates;
  const userDuck = window.ts.state.ducks.user;

  const conversationsSelectors = window.ts.state.selectors.conversations;
  const registrationSelectors = window.ts.state.selectors.registration;
  const searchSelectors = window.ts.state.selectors.search;

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

  // Processes / Services
  const {
    initializeNetworkObserver,
  } = window.ts.services.networkObserver;
  const {
    initializeUpdateListener,
  } = window.ts.services.updateListener;

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
      createAbsolutePathGetter,
      createReader,
      createWriterForExisting,
      createWriterForNew,
      createDoesExist,
      getDraftPath,
      getPath,
      getStickersPath,
      getTempPath,
      openFileInFolder,
      saveAttachmentToDisk,
    } = Attachments;
    const {
      getImageDimensions,
      makeImageThumbnail,
      makeObjectUrl,
      makeVideoScreenshot,
      revokeObjectUrl,
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
    const doesAttachmentExist = createDoesExist(attachmentsPath);

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
    const copyIntoTempDirectory = Attachments.copyIntoAttachmentsDirectory(
      tempPath
    );

    const draftPath = getDraftPath(userDataPath);
    const getAbsoluteDraftPath = createAbsolutePathGetter(draftPath);
    const writeNewDraftData = createWriterForNew(draftPath);
    const deleteDraftFile = Attachments.createDeleter(draftPath);
    const readDraftData = createReader(draftPath);

    return {
      attachmentsPath,
      copyIntoAttachmentsDirectory,
      copyIntoTempDirectory,
      deleteAttachmentData: deleteOnDisk,
      deleteDraftFile,
      deleteExternalMessageFiles: MessageType.deleteAllExternalFiles({
        deleteAttachmentData: Type.deleteData(deleteOnDisk),
        deleteOnDisk,
      }),
      deleteSticker,
      deleteTempFile,
      doesAttachmentExist,
      getAbsoluteAttachmentPath,
      getAbsoluteDraftPath,
      getAbsoluteStickerPath,
      getAbsoluteTempPath,
      getPlaceholderMigrations,
      getCurrentVersion,
      loadAttachmentData,
      loadMessage: MessageType.createAttachmentLoader(loadAttachmentData),
      loadPreviewData,
      loadQuoteData,
      loadStickerData,
      openFileInFolder,
      readAttachmentData,
      readDraftData,
      readStickerData,
      readTempData,
      run,
      saveAttachmentToDisk,
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
      writeNewDraftData,
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
      ConversationHeader,
      Emojify,
      Lightbox,
      LightboxGallery,
      MediaGallery,
      MessageDetail,
      Quote,
      StagedLinkPreview,
      Types: {
        Message: MediaGalleryMessage,
      },
    };

    const Roots = {
      createCompositionArea,
      createLeftPane,
      createShortcutGuideModal,
      createStickerManager,
      createStickerPreviewModal,
      createTimeline,
    };

    const Ducks = {
      conversations: conversationsDuck,
      emojis: emojisDuck,
      expiration: expirationDuck,
      items: itemsDuck,
      network: networkDuck,
      updates: updatesDuck,
      user: userDuck,
      search: searchDuck,
      stickers: stickersDuck,
    };

    const Selectors = {
      conversations: conversationsSelectors,
      registration: registrationSelectors,
      search: searchSelectors,
    };

    const Services = {
      initializeNetworkObserver,
      initializeUpdateListener,
    };

    const State = {
      bindActionCreators,
      createStore,
      Roots,
      Ducks,
      Selectors,
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
      Services,
      State,
      Stickers,
      Types,
      Util,
      Views,
      Workflow,
    };
  };
})();