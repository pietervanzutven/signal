/* global Whisper, window */

(function () {
  'use strict';

  const electron = window.electron;
  const semver = window.semver;
  const curve = window.curve25519_n;

  const { deferredToPromise } = window.deferred_to_promise;

  const { remote } = electron;
  const { app } = remote;
  const { systemPreferences } = remote.require('electron');

  const browserWindow = remote.getCurrentWindow();
  window.isFocused = () => browserWindow.isFocused();

  // Waiting for clients to implement changes on receive side
  window.ENABLE_STICKER_SEND = true;
  window.TIMESTAMP_VALIDATION = false;
  window.PAD_ALL_ATTACHMENTS = false;
  window.SEND_RECIPIENT_UPDATES = false;

  window.PROTO_ROOT = '/protos';
  const config = window.app.config || {};

  let title = config.name;
  if (config.environment !== 'production') {
    title += ` - ${config.environment}`;
  }
  if (config.appInstance) {
    title += ` - ${config.appInstance}`;
  }

  window.platform = process.platform;
  window.getTitle = () => title;
  window.getEnvironment = () => config.environment;
  window.getAppInstance = () => config.appInstance;
  window.getVersion = () => config.version;
  window.isImportMode = () => config.importMode;
  window.getExpiration = () => config.buildExpiration;
  window.getUWPVersion = () => config.uwp_version;
  window.getHostName = () => config.hostname;
  window.getServerTrustRoot = () => config.serverTrustRoot;
  window.isBehindProxy = () => Boolean(config.proxyUrl);

  function setSystemTheme() {
    window.systemTheme = systemPreferences.isDarkMode() ? 'dark' : 'light';
  }

  setSystemTheme();

  window.subscribeToSystemThemeChange = fn => {
    if (!systemPreferences.subscribeNotification) {
      return;
    }
    systemPreferences.subscribeNotification(
      'AppleInterfaceThemeChangedNotification',
      () => {
        setSystemTheme();
        fn();
      }
    );
  };

  window.isBeforeVersion = (toCheck, baseVersion) => {
    try {
      return semver.lt(toCheck, baseVersion);
    } catch (error) {
      window.log.error(
        `isBeforeVersion error: toCheck: ${toCheck}, baseVersion: ${baseVersion}`,
        error && error.stack ? error.stack : error
      );
      return true;
    }
  };

  window.wrapDeferred = deferredToPromise;

  const ipc = electron.ipcRenderer;
  const localeMessages = ipc.sendSync('locale-data');

  window.setBadgeCount = count => ipc.send('set-badge-count', count);

  window.drawAttention = () => {
    window.log.info('draw attention');
    ipc.send('draw-attention');
  };
  window.showWindow = () => {
    window.log.info('show window');
    ipc.send('show-window');
  };

  window.setAutoHideMenuBar = autoHide =>
    ipc.send('set-auto-hide-menu-bar', autoHide);

  window.setMenuBarVisibility = visibility =>
    ipc.send('set-menu-bar-visibility', visibility);

  window.restart = () => {
    window.log.info('restart');
    ipc.send('restart');
  };

  window.closeAbout = () => ipc.send('close-about');
  window.readyForUpdates = () => ipc.send('ready-for-updates');

  window.updateTrayIcon = unreadCount =>
    ipc.send('update-tray-icon', unreadCount);

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

  ipc.on('show-keyboard-shortcuts', () => {
    window.Events.showKeyboardShortcuts();
  });
  ipc.on('add-dark-overlay', () => {
    window.Events.addDarkOverlay();
  });
  ipc.on('remove-dark-overlay', () => {
    window.Events.removeDarkOverlay();
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

  installGetter('spell-check', 'getSpellCheck');
  installSetter('spell-check', 'setSpellCheck');

  window.getMediaPermissions = () =>
    new Promise((resolve, reject) => {
      ipc.once('get-success-media-permissions', (_event, error, value) => {
        if (error) {
          return reject(new Error(error));
        }

        return resolve(value);
      });
      ipc.send('get-media-permissions');
    });

  window.getBuiltInImages = () =>
    new Promise((resolve, reject) => {
      ipc.once('get-success-built-in-images', (_event, error, value) => {
        if (error) {
          return reject(new Error(error));
        }

        return resolve(value);
      });
      ipc.send('get-built-in-images');
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

  ipc.on('show-sticker-pack', (_event, info) => {
    const { packId, packKey } = info;
    const { showStickerPack } = window.Events;
    if (showStickerPack) {
      showStickerPack(packId, packKey);
    }
  });

  ipc.on('get-ready-for-shutdown', async () => {
    const { shutdown } = window.Events || {};
    if (!shutdown) {
      window.log.error('preload shutdown handler: shutdown method not found');
      ipc.send('now-ready-for-shutdown');
      return;
    }

    try {
      await shutdown();
      ipc.send('now-ready-for-shutdown');
    } catch (error) {
      ipc.send(
        'now-ready-for-shutdown',
        error && error.stack ? error.stack : error
      );
    }
  });

  function installGetter(name, functionName) {
    ipc.on(`get-${name}`, async () => {
      const getFn = window.Events[functionName];
      if (!getFn) {
        ipc.send(
          `get-success-${name}`,
          `installGetter: ${functionName} not found for event ${name}`
        );
        return;
      }
      try {
        ipc.send(`get-success-${name}`, null, await getFn());
      } catch (error) {
        ipc.send(
          `get-success-${name}`,
          error && error.stack ? error.stack : error
        );
      }
    });
  }

  function installSetter(name, functionName) {
    ipc.on(`set-${name}`, async (_event, value) => {
      const setFn = window.Events[functionName];
      if (!setFn) {
        ipc.send(
          `set-success-${name}`,
          `installSetter: ${functionName} not found for event ${name}`
        );
        return;
      }
      try {
        await setFn(value);
        ipc.send(`set-success-${name}`);
      } catch (error) {
        ipc.send(
          `set-success-${name}`,
          error && error.stack ? error.stack : error
        );
      }
    });
  }

  window.addSetupMenuItems = () => ipc.send('add-setup-menu-items');
  window.removeSetupMenuItems = () => ipc.send('remove-setup-menu-items');

  // We pull these dependencies in now, from here, because they have Node.js dependencies

  require_logging();

  if (config.proxyUrl) {
    window.log.info('Using provided proxy url');
  }

  const { initialize: initializeWebAPI } = window.web_api;

  window.WebAPI = initializeWebAPI({
    url: config.serverUrl,
    cdnUrl: config.cdnUrl,
    certificateAuthority: config.certificateAuthority,
    contentProxyUrl: config.contentProxyUrl,
    proxyUrl: config.proxyUrl,
  });

  const { autoOrientImage } = window.auto_orient_image;

  window.autoOrientImage = autoOrientImage;
  window.dataURLToBlobSync = window.blueimp_canvas_to_blob;
  window.emojiData = window.emoji_datasource;
  window.filesize = window.filesize;
  window.libphonenumber = window.google_libphonenumber.PhoneNumberUtil.getInstance();
  window.libphonenumber.PhoneNumberFormat = window.google_libphonenumber.PhoneNumberFormat;
  window.loadImage = window.blueimp_load_image;
  window.getGuid = window.uuid.v4;

  window.React = window.react;
  window.ReactDOM = window.react_dom;
  window.moment = window.moment;
  window.PQueue = window.p_queue;

  const Signal = window.signal;
  const i18n = window.modules.i18n;
  const Attachments = window.app.attachments;

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

  const userDataPath = app.getPath('userData');
  window.baseAttachmentsPath = Attachments.getPath(userDataPath);
  window.baseStickersPath = Attachments.getStickersPath(userDataPath);
  window.baseTempPath = Attachments.getTempPath(userDataPath);
  window.baseDraftPath = Attachments.getDraftPath(userDataPath);
  window.Signal = Signal.setup({
    Attachments,
    userDataPath,
    getRegionCode: () => window.storage.get('regionCode'),
    logger: window.log,
  });

  function wrapWithPromise(fn) {
    return (...args) => Promise.resolve(fn(...args));
  }
  function typedArrayToArrayBuffer(typedArray) {
    const { buffer, byteOffset, byteLength } = typedArray;
    return buffer.slice(byteOffset, byteLength + byteOffset);
  }
  const externalCurve = {
    generateKeyPair: () => {
      const { privKey, pubKey } = curve.generateKeyPair();

      return {
        privKey: typedArrayToArrayBuffer(privKey),
        pubKey: typedArrayToArrayBuffer(pubKey),
      };
    },
    createKeyPair: incomingKey => {
      const incomingKeyBuffer = Buffer.from(incomingKey);
      const { privKey, pubKey } = curve.createKeyPair(incomingKeyBuffer);

      return {
        privKey: typedArrayToArrayBuffer(privKey),
        pubKey: typedArrayToArrayBuffer(pubKey),
      };
    },
    calculateAgreement: (pubKey, privKey) => {
      const pubKeyBuffer = Buffer.from(pubKey);
      const privKeyBuffer = Buffer.from(privKey);

      const buffer = curve.calculateAgreement(pubKeyBuffer, privKeyBuffer);

      return typedArrayToArrayBuffer(buffer);
    },
    verifySignature: (pubKey, message, signature) => {
      const pubKeyBuffer = Buffer.from(pubKey);
      const messageBuffer = Buffer.from(message);
      const signatureBuffer = Buffer.from(signature);

      const result = curve.verifySignature(
        pubKeyBuffer,
        messageBuffer,
        signatureBuffer
      );

      return result;
    },
    calculateSignature: (privKey, message) => {
      const privKeyBuffer = Buffer.from(privKey);
      const messageBuffer = Buffer.from(message);

      const buffer = curve.calculateSignature(privKeyBuffer, messageBuffer);

      return typedArrayToArrayBuffer(buffer);
    },
    validatePubKeyFormat: pubKey => {
      const pubKeyBuffer = Buffer.from(pubKey);

      return curve.validatePubKeyFormat(pubKeyBuffer);
    },
  };
  externalCurve.ECDHE = externalCurve.calculateAgreement;
  externalCurve.Ed25519Sign = externalCurve.calculateSignature;
  externalCurve.Ed25519Verify = externalCurve.verifySignature;
  const externalCurveAsync = {
    generateKeyPair: wrapWithPromise(externalCurve.generateKeyPair),
    createKeyPair: wrapWithPromise(externalCurve.createKeyPair),
    calculateAgreement: wrapWithPromise(externalCurve.calculateAgreement),
    verifySignature: async (...args) => {
      // The async verifySignature function has a different signature than the sync function
      const verifyFailed = externalCurve.verifySignature(...args);
      if (verifyFailed) {
        throw new Error('Invalid signature');
      }
    },
    calculateSignature: wrapWithPromise(externalCurve.calculateSignature),
    validatePubKeyFormat: wrapWithPromise(externalCurve.validatePubKeyFormat),
    ECDHE: wrapWithPromise(externalCurve.ECDHE),
    Ed25519Sign: wrapWithPromise(externalCurve.Ed25519Sign),
    Ed25519Verify: wrapWithPromise(externalCurve.Ed25519Verify),
  };
  window.libsignal = window.libsignal || {};
  window.libsignal.externalCurve = curve ? externalCurve : null;
  window.libsignal.externalCurveAsync = curve ? externalCurveAsync : null;

  // Pulling these in separately since they access filesystem, electron
  window.Signal.Backup = window.backup;
  window.Signal.Debug = window.debug;
  window.Signal.Logs = window.logs;

  if (config.environment === 'test') {
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