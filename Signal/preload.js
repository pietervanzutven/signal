(function () {
  'use strict';

  console.log('preload');

  const Attachment = window.types.attachment;
  const Attachments = window.attachments;
  const Message = window.types.message;


  window.PROTO_ROOT = '/protos';
  window.wrapDeferred = function(deferred) {
    return new Promise(function(resolve, reject) {
      deferred.then(resolve, reject);
    });
  };

  window.config.localeMessages = ipc.sendSync('locale-data');

  window.setBadgeCount = function(count) {
    ipc.send('set-badge-count', count);
  };
  window.drawAttention = function() {
    console.log('draw attention');
    ipc.send('draw-attention');
  };
  window.showWindow = function() {
    console.log('show window');
    ipc.send('show-window');
  };
  window.setAutoHideMenuBar = function(autoHide) {
    ipc.send('set-auto-hide-menu-bar', autoHide);
  };
  window.setMenuBarVisibility = function(visibility) {
    ipc.send('set-menu-bar-visibility', visibility);
  };
  window.restart = function() {
    console.log('restart');
    ipc.send('restart');
  };
  window.closeAbout = function() {
    ipc.send('close-about');
  };
  window.updateTrayIcon = function(unreadCount) {
    ipc.send('update-tray-icon', unreadCount);
  };

  ipc.on('debug-log', function() {
    Whisper.events.trigger('showDebugLog');
  });

  ipc.on('backup', function() {
      Whisper.events.trigger('showBackupScreen');
  });
  
  ipc.on('set-up-with-import', function() {
    Whisper.events.trigger('setupWithImport');
  });

  ipc.on('set-up-as-new-device', function() {
    Whisper.events.trigger('setupAsNewDevice');
  });

  ipc.on('set-up-as-standalone', function() {
    Whisper.events.trigger('setupAsStandalone');
  });

  ipc.on('show-settings', function() {
    Whisper.events.trigger('showSettings');
  });

  window.addSetupMenuItems = function() {
    ipc.send('add-setup-menu-items');
  }

  window.removeSetupMenuItems = function() {
    ipc.send('remove-setup-menu-items');
  }
  
  ipc.on('about', function() {
      Whisper.events.trigger('showAbout');
  });
  

  // We pull these dependencies in now, from here, because they have Node.js dependencies

  window.dataURLToBlobSync = window.blueimp_canvas_to_blob;
  window.loadImage = window.blueimp_load_image;

  const { autoOrientImage } = window.auto_orient_image;
  window.autoOrientImage = autoOrientImage;

  // ES2015+ modules
  const attachmentsPath = Attachments.getPath(app.getPath('userData'));
  const deleteAttachmentData = Attachments.deleteData(attachmentsPath);
  const readAttachmentData = Attachments.readData(attachmentsPath);
  const writeAttachmentData = Attachments.writeData(attachmentsPath);

  // Injected context functions to keep `Message` agnostic from Electron:
  const upgradeSchemaContext = {
    writeAttachmentData,
  };
  const upgradeMessageSchema = message =>
    Message.upgradeSchema(message, upgradeSchemaContext);
  
  window.Signal = window.Signal || {};
  window.Signal.Logs = window.logs;
  window.Signal.OS = window.os;
  window.Signal.Backup = window.backup;
  window.Signal.Crypto = window.crypto;
  window.Signal.Migrations = {};
  window.Signal.Migrations.loadAttachmentData = Attachment.loadData(readAttachmentData);
  window.Signal.Migrations.deleteAttachmentData = Attachment.deleteData(deleteAttachmentData);
  window.Signal.Migrations.upgradeMessageSchema = upgradeMessageSchema;
  window.Signal.Migrations.V17 = window.migrations.V17;
  window.Signal.Types = window.Signal.Types || {};
  window.Signal.Types.Attachment = Attachment;
  window.Signal.Types.Errors = window.types.errors;
  window.Signal.Types.Message = Message;
  window.Signal.Types.MIME = window.types.mime;
  window.Signal.Types.Settings = window.types.settings;
})();
