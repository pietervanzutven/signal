/* global Whisper: false */
/* global window: false */

(function () {
  'use strict';

  console.log('preload');

  const { deferredToPromise } = window.deferred_to_promise;

  window.PROTO_ROOT = '/protos';
  const config = window.config || {};

  let title = config.name;
  if (config.environment !== 'production') {
    title += ` - ${config.environment}`;
  }
  if (config.appInstance) {
    title += ` - ${config.appInstance}`;
  }

  window.getTitle = () => title;
  window.getEnvironment = () => config.environment;
  window.getAppInstance = () => config.appInstance;
  window.getVersion = () => config.version;
  window.isImportMode = () => config.importMode;
  window.getExpiration = () => config.buildExpiration;
  window.getUWPVersion = () => config.uwp_version;
  window.getHostName = () => config.hostname;

  window.wrapDeferred = deferredToPromise;

  const localeMessages = ipc.sendSync('locale-data');

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

  window.setMediaPermissions = enabled =>
    ipc.send('set-media-permissions', enabled);
  window.getMediaPermissions = () => ipc.sendSync('get-media-permissions');

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

  // Settings-related events

  window.showSettings = () => ipc.send('show-settings');
  window.showPermissionsPopup = () => ipc.send('show-permissions-popup');

  ipc.on('add-dark-overlay', () => {
    const { addDarkOverlay } = window.Events;
    if (addDarkOverlay) {
      addDarkOverlay();
    }
  });
  ipc.on('remove-dark-overlay', () => {
    const { removeDarkOverlay } = window.Events;
    if (removeDarkOverlay) {
      removeDarkOverlay();
    }
  });

  installGetter('device-name', 'getDeviceName');

  installGetter('theme-setting', 'getThemeSetting');
  installSetter('theme-setting', 'setThemeSetting');
  installGetter('hide-menu-bar', 'getHideMenuBar');
  installSetter('hide-menu-bar', 'setHideMenuBar');

  installGetter('notification-setting', 'getNotificationSetting');
  installSetter('notification-setting', 'setNotificationSetting');
  installGetter('audio-notification', 'getAudioNotification');
  installSetter('audio-notification', 'setAudioNotification');

  window.getMediaPermissions = () =>
    new Promise((resolve, reject) => {
      ipc.once('get-success-media-permissions', (_event, error, value) => {
        if (error) {
          return reject(error);
        }

        return resolve(value);
      });
      ipc.send('get-media-permissions');
    });

  installGetter('is-primary', 'isPrimary');
  installGetter('sync-request', 'getSyncRequest');
  installGetter('sync-time', 'getLastSyncTime');
  installSetter('sync-time', 'setLastSyncTime');

  ipc.on('delete-all-data', () => {
    const { deleteAllData } = window.Events;
    if (deleteAllData) {
      deleteAllData();
    }
  });

  function installGetter(name, functionName) {
    ipc.on(`get-${name}`, async () => {
      const getFn = window.Events[functionName];
      if (getFn) {
        // eslint-disable-next-line no-param-reassign
        try {
          ipc.send(`get-success-${name}`, null, await getFn());
        } catch (error) {
          ipc.send(`get-success-${name}`, error);
        }
      }
    });
  }

  function installSetter(name, functionName) {
    ipc.on(`set-${name}`, async (_event, value) => {
      const setFn = window.Events[functionName];
      if (setFn) {
        try {
          await setFn(value);
          ipc.send(`set-success-${name}`);
        } catch (error) {
          ipc.send(`set-success-${name}`, error);
        }
      }
    });
  }

  window.addSetupMenuItems = () => ipc.send('add-setup-menu-items');
  window.removeSetupMenuItems = () => ipc.send('remove-setup-menu-items');

  // We pull these dependencies in now, from here, because they have Node.js dependencies

  if (config.proxyUrl) {
    console.log('using proxy url', config.proxyUrl);
  }

  const { initialize: initializeWebAPI } = window.web_api;

  window.WebAPI = initializeWebAPI({
    url: config.serverUrl,
    cdnUrl: config.cdnUrl,
    certificateAuthority: config.certificateAuthority,
    proxyUrl: config.proxyUrl,
  });

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
  const i18n = window.modules.i18n;
  const Attachments = window.attachments;

  const { locale } = config;
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
    getRegionCode: () => window.storage.get('regionCode'),
  });

  // Pulling these in separately since they access filesystem, electron
  window.Signal.Backup = window.backup;
  window.Signal.Debug = window.debug;
  window.Signal.Logs = window.logs;

})();