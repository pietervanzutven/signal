/* global Whisper: false */
/* global window: false */

(function () {
    'use strict';

    console.log('preload');

    const Attachment = window.types.attachment;
    const Attachments = window.attachments;
    const Message = window.types.message;
    const { deferredToPromise } = window.deferred_to_promise;



    window.PROTO_ROOT = '/protos';
    window.config = window.config || {};

    window.wrapDeferred = deferredToPromise;

    window.config.localeMessages = ipc.sendSync('locale-data');

    window.setBadgeCount = count =>
        ipc.send('set-badge-count', count);

    window.drawAttention = () => {
        console.log('draw attention');
        ipc.send('draw-attention');
    };
    window.showWindow = () => {
        console.log('show window');
        ipc.send('show-window');
    };

    window.setAutoHideMenuBar = autoHide =>
        ipc.send('set-auto-hide-menu-bar', autoHide);

    window.setMenuBarVisibility = visibility =>
        ipc.send('set-menu-bar-visibility', visibility);

    window.restart = () => {
        console.log('restart');
        ipc.send('restart');
    };

    window.closeAbout = () =>
        ipc.send('close-about');

    window.updateTrayIcon = unreadCount =>
        ipc.send('update-tray-icon', unreadCount);

    ipc.on('debug-log', () => {
        Whisper.events.trigger('showDebugLog');
    });

    ipc.on('backup', () => {
        Whisper.events.trigger('showBackupScreen');
    });

    ipc.on('set-up-with-import', () => {
        Whisper.events.trigger('setupWithImport');
    });

    ipc.on('set-up-as-new-device', () => {
        Whisper.events.trigger('setupAsNewDevice');
    });

    ipc.on('set-up-as-standalone', () => {
        Whisper.events.trigger('setupAsStandalone');
    });

    ipc.on('show-settings', () => {
        Whisper.events.trigger('showSettings');
    });

    ipc.on('about', () => {
        Whisper.events.trigger('showAbout');
    });

    window.addSetupMenuItems = () =>
        ipc.send('add-setup-menu-items');

    window.removeSetupMenuItems = () =>
        ipc.send('remove-setup-menu-items');

    // We pull these dependencies in now, from here, because they have Node.js dependencies

    const { autoOrientImage } = window.auto_orient_image;

    window.autoOrientImage = autoOrientImage;
    window.dataURLToBlobSync = window.blueimp_canvas_to_blob;
    window.loadImage = window.blueimp_load_image;

    // ES2015+ modules
    const attachmentsPath = Attachments.getPath(app.getPath('userData'));
    const deleteAttachmentData = Attachments.createDeleter(attachmentsPath);
    const readAttachmentData = Attachments.createReader(attachmentsPath);
    const writeAttachmentData = Attachments.createWriter(attachmentsPath);

    // Injected context functions to keep `Message` agnostic from Electron:
    const upgradeSchemaContext = {
        writeAttachmentData,
    };
    const upgradeMessageSchema = message =>
        Message.upgradeSchema(message, upgradeSchemaContext);

    const { getPlaceholderMigrations } =
        window.migrations.get_placeholder_migrations;
    const { IdleDetector } = window.idle_detector;

    window.Signal = {};
    window.Signal.Backup = window.backup;
    window.Signal.Crypto = window.crypto;
    window.Signal.Database = window.database;
    window.Signal.Debug = window.debug;
    window.Signal.Logs = window.logs;

    window.Signal.Migrations = {};
    window.Signal.Migrations.deleteAttachmentData =
        Attachment.deleteData(deleteAttachmentData);
    window.Signal.Migrations.getPlaceholderMigrations = getPlaceholderMigrations;
    window.Signal.Migrations.loadAttachmentData = Attachment.loadData(readAttachmentData);
    window.Signal.Migrations.Migrations0DatabaseWithAttachmentData =
        window.migrations.migrations_0_database_with_attachment_data;
    window.Signal.Migrations.Migrations1DatabaseWithoutAttachmentData =
        window.migrations.migrations_1_database_without_attachment_data;

    window.Signal.Migrations.upgradeMessageSchema = upgradeMessageSchema;
    window.Signal.OS = window.os;
    window.Signal.Settings = window.settings;
    window.Signal.Startup = window.startup;

    window.Signal.Types = {};
    window.Signal.Types.Attachment = Attachment;
    window.Signal.Types.Errors = window.types.errors;

    window.Signal.Types.Message = Message;
    window.Signal.Types.MIME = window.types.mime;
    window.Signal.Types.Settings = window.types.settings;

    window.Signal.Views = {};
    window.Signal.Views.Initialization = window.views.initialization;

    window.Signal.Workflow = {};
    window.Signal.Workflow.IdleDetector = IdleDetector;
    window.Signal.Workflow.MessageDataMigrator =
        window.messages_data_migrator;

})();
