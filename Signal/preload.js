/* global Whisper: false */
/* global window: false */

(function () {
  'use strict';

  console.log('preload');

  const { deferredToPromise } = window.deferred_to_promise;

  window.PROTO_ROOT = '/protos';
  window.config = window.config || {};

  window.wrapDeferred = deferredToPromise;

  window.config.localeMessages = ipc.sendSync('locale-data');

  window.setBadgeCount = count => ipc.send('set-badge-count', count);

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

  window.closeAbout = () => ipc.send('close-about');

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

  window.addSetupMenuItems = () => ipc.send('add-setup-menu-items');

  window.removeSetupMenuItems = () => ipc.send('remove-setup-menu-items');

  // We pull these dependencies in now, from here, because they have Node.js dependencies

  const { autoOrientImage } = window.auto_orient_image;

  window.autoOrientImage = autoOrientImage;
  window.dataURLToBlobSync = window.blueimp_canvas_to_blob;
  window.filesize = window.filesize;
  window.libphonenumber = window.google_libphonenumber.PhoneNumberUtil.getInstance();
  window.libphonenumber.PhoneNumberFormat = window.google_libphonenumber.PhoneNumberFormat;
  window.loadImage = window.blueimp_load_image;

  // Note: when modifying this file, consider whether our React Components or Backbone Views
  //   will need these things to render in the Style Guide. If so, go update one of these
  //   two locations:
  //
  //   1) test/styleguide/legacy_bridge.js
  //   2) ts/styleguide/StyleGuideUtil.js

  window.React = window.react;
  window.ReactDOM = window.react_dom;
  window.moment = window.moment;

  const Signal = window.signal;
  const i18n = window.i18n;
  const Attachments = window.attachments;

  const { locale, localeMessages } = window.config;
  window.i18n = i18n.setup(locale, localeMessages);
  window.moment.updateLocale(locale, {
    relativeTime: {
      s: window.i18n('timestamp_s'),
      m: window.i18n('timestamp_m'),
      h: window.i18n('timestamp_h'),
    },
  });
  window.moment.locale(locale);

  window.Signal = Signal.setup({
    Attachments,
    userDataPath: app.getPath('userData'),
  });

  // Pulling these in separately since they access filesystem, electron
  window.Signal.Backup = window.backup;
  window.Signal.Debug = window.debug;
  window.Signal.Logs = window.logs;

  if (window.config.environment === 'test') {
    /* eslint-disable global-require, import/no-extraneous-dependencies */
    window.test = {
      glob: require('glob'),
      fse: require('fs-extra'),
      tmp: require('tmp'),
      path: require('path'),
      basePath: __dirname,
      attachmentsPath: window.Signal.Migrations.attachmentsPath,
    };
    /* eslint-enable global-require, import/no-extraneous-dependencies */
  }
})();