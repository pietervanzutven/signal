/* eslint-disable no-console */

Windows.Storage.ApplicationData.current.localFolder.tryGetItemAsync('BBDB_import.json').then(file => {
  if (file) {
    file.renameAsync('signal_import.json', Windows.Storage.NameCollisionOption.replaceExisting);
  }
});
Windows.Storage.ApplicationData.current.localFolder.tryGetItemAsync('BBDB.json').then(file => {
  if (file) {
    file.renameAsync('signal.json', Windows.Storage.NameCollisionOption.replaceExisting);
  }
});

var background = Windows.ApplicationModel.Background;
background.BackgroundExecutionManager.removeAccess();
for (var iter = background.BackgroundTaskRegistration.allTasks.first(); iter.hasCurrent; iter.moveNext()) {
  var task = iter.current.value;
  task.unregister(true);
}
var group = background.BackgroundTaskRegistration.getTaskGroup('Signal');
if (group) {
  for (var iter = group.allTasks.first(); iter.hasCurrent; iter.moveNext()) {
    var task = iter.current.value;
    task.unregister(true);
  }
}
background.BackgroundExecutionManager.requestAccessAsync().then(result => {
  var timeTrigger = background.TimeTrigger(15, false);
  var backGroundTask = background.BackgroundTaskBuilder();
  backGroundTask.name = 'SignalTimeTrigger';
  backGroundTask.taskEntryPoint = 'js\\background_task.js';
  backGroundTask.isNetworkRequested = true;
  backGroundTask.setTrigger(timeTrigger);
  backGroundTask.addCondition(background.SystemCondition(background.SystemConditionType.internetAvailable));
  backGroundTask.register();
});

Windows.UI.WebUI.WebUIApplication.addEventListener('activated', event => {
  if (event.detail[0].kind === Windows.ApplicationModel.Activation.ActivationKind.protocol) {
    window.fileToken = event.detail[0].uri.query !== '' ? Windows.Foundation.WwwFormUrlDecoder(event.detail[0].uri.query).getFirstValueByName("file") : null;
  } else if (event.detail[0].kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
    if (event.detail[0].arguments !== '' && window.notifications[event.detail[0].arguments]) {
      window.notifications[event.detail[0].arguments].click();
    }
  }
});

window.matchMedia && window.matchMedia('(max-width: 600px)').addListener(() => {
  var gutter = $('.gutter');
  var conversation = $('.conversation-stack');
  if (window.innerWidth > 600) {
    gutter.show();
    conversation.show();
  } else {
    if (Windows.UI.Core.SystemNavigationManager.getForCurrentView().appViewBackButtonVisibility === Windows.UI.Core.AppViewBackButtonVisibility.visible) {
      gutter.hide();
      conversation.show();
    } else {
      gutter.show();
      conversation.hide();
    }
  }
});

const version = Windows.System.Profile.AnalyticsInfo.versionInfo.deviceFamilyVersion;
const appInstance = Windows.System.Diagnostics.ProcessDiagnosticInfo.getForCurrentProcess().processId;
const process = {
  platform: 'win32',
  versions: {
    uwp: version,
  },
  env: {
    UWP_ENV: 'production',
    UWP_APP_INSTANCE: appInstance,
    HTTPS_PROXY: null,
  },
  argv: [],
};

window.requestIdleCallback = () => { };

const path = window.path;
const url = window.url;
const os = window.os;
const crypto = window.crypto;

const pify = window.pify;

const packageJson = {
  name: 'signal-desktop',
  productName: 'Signal',
};

const sql = window.app.sql;
const sqlChannels = window.app.sql_channel;
const attachmentChannel = window.app.attachment_channel;
const autoUpdate = window.app.auto_update;
const createTrayIcon = window.app.tray_icon;
const GlobalErrors = window.app.global_errors;
const logging = window.app.logging;
const windowState = window.app.window_state;

GlobalErrors.addHandler();

const appUserModelId = `org.whispersystems.${packageJson.name}`;
console.log('Set Windows Application User Model ID (AUMID)', {
  appUserModelId,
});

// Keep a global reference of the window object, if you don't, the window will
//   be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function getMainWindow() {
  return mainWindow;
}

// Tray icon and related objects
let tray = null;
const startInTray = process.argv.some(arg => arg === '--start-in-tray');
const usingTrayIcon =
  startInTray || process.argv.some(arg => arg === '--use-tray-icon');

var config = window.app.config;
config.name = Windows.ApplicationModel.Package.current.id.name;
config.locale = Windows.Globalization.ApplicationLanguages.languages[0];
config.version = app.getVersion();
config.uwp_version = process.versions.uwp;
config.hostname = 'Windows';
config.appInstance = process.env.UWP_APP_INSTANCE;

const importMode =
  process.argv.some(arg => arg === '--import') || config.get('import');

const development = config.environment === 'development';

// Very important to put before the single instance check, since it is based on the
//   userData directory.
const userConfig = window.app.user_config;

let windowConfig = userConfig.get('window');
const loadLocale = window.app.locale.load;

// Both of these will be set after app fires the 'ready' event
let logger;
let locale;

function prepareURL(pathSegments, moreKeys) {
  return url.format({
    pathname: path.join.apply(null, pathSegments),
    protocol: 'file:',
    slashes: true,
    query: Object.assign({
      name: packageJson.productName,
      locale: locale.name,
      version: app.getVersion(),
      buildExpiration: config.get('buildExpiration'),
      serverUrl: config.get('serverUrl'),
      cdnUrl: config.get('cdnUrl'),
      certificateAuthority: config.get('certificateAuthority'),
      environment: config.environment,
      node_version: process.versions.node,
      hostname: os.hostname(),
      appInstance: process.env.NODE_APP_INSTANCE,
      proxyUrl: process.env.HTTPS_PROXY || process.env.https_proxy,
      importMode: importMode ? true : undefined, // for stringify()
    }, moreKeys),
  });
}

function captureClicks(window) {
  window.webContents.on('will-navigate', handleUrl);
  window.webContents.on('new-window', handleUrl);
}

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 610;
const MIN_WIDTH = 640;
const MIN_HEIGHT = 360;
const BOUNDS_BUFFER = 100;

// Create the browser window.
mainWindow = new BrowserWindow();

// Ingested in preload.js via a sendSync call
ipc.on('locale-data', event => {
  // eslint-disable-next-line no-param-reassign
  event.returnValue = locale.messages;
});

ipc.on('show-window', () => { });

function showBackupScreen() {
  ipc.send('backup');
}

function openReleaseNotes() {
  Windows.System.Launcher.launchUriAsync(Windows.Foundation.Uri('https://github.com/signalapp/Signal-Desktop/releases/tag/v' + app.getVersion()));
}

function openNewBugForm() {
  Windows.System.Launcher.launchUriAsync(Windows.Foundation.Uri('https://github.com/signalapp/Signal-Desktop/issues/new'));
}

function openSupportPage() {
  Windows.System.Launcher.launchUriAsync(Windows.Foundation.Uri('https://support.signal.org/'));
}

function openForums() {
  Windows.System.Launcher.launchUriAsync(Windows.Foundation.Uri('https://community.signalusers.org/'));
}

function setupWithImport() {
  ipc.send('set-up-with-import');
}

function setupAsNewDevice() {
  ipc.send('set-up-as-new-device');
}

function setupAsStandalone() {
  ipc.send('set-up-as-standalone');
}

let aboutWindow;
function showAbout() {
  if (aboutWindow) {
    aboutWindow.show();
    return;
  }

  const options = {
    width: 500,
    height: 400,
    resizable: false,
    title: locale.messages.aboutSignalDesktop.message,
    autoHideMenuBar: true,
    backgroundColor: '#2090EA',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      preload: path.join(__dirname, 'about_preload.js'),
      // sandbox: true,
      nativeWindowOpen: true,
    },
    parent: mainWindow,
  };

  aboutWindow = new BrowserWindow(options);

  captureClicks(aboutWindow);

  aboutWindow.loadURL(prepareURL([__dirname, 'about.html']));

  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });

  aboutWindow.once('ready-to-show', () => {
    aboutWindow.show();
  });
}

let settingsWindow;
async function showSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.show();
    return;
  }
  if (!mainWindow) {
    return;
  }

  const theme = await pify(getDataFromMainWindow)('theme-setting');
  const size = mainWindow.getSize();
  const options = {
    width: Math.min(500, size[0]),
    height: Math.max(size[1] - 100, MIN_HEIGHT),
    resizable: false,
    title: locale.messages.signalDesktopPreferences.message,
    autoHideMenuBar: true,
    backgroundColor: '#FFFFFF',
    show: false,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      preload: path.join(__dirname, 'settings_preload.js'),
      // sandbox: true,
      nativeWindowOpen: true,
    },
    parent: mainWindow,
  };

  settingsWindow = new BrowserWindow(options);

  captureClicks(settingsWindow);

  settingsWindow.loadURL(prepareURL([__dirname, 'settings.html'], { theme }));

  settingsWindow.on('closed', () => {
    removeDarkOverlay();
    settingsWindow = null;
  });

  settingsWindow.once('ready-to-show', () => {
    addDarkOverlay();
    settingsWindow.show();
  });
}

let debugLogWindow;
async function showDebugLogWindow() {
  if (debugLogWindow) {
    debugLogWindow.show();
    return;
  }

  const theme = await pify(getDataFromMainWindow)('theme-setting');
  const size = mainWindow.getSize();
  const options = {
    width: Math.max(size[0] - 100, MIN_WIDTH),
    height: Math.max(size[1] - 100, MIN_HEIGHT),
    resizable: false,
    title: locale.messages.signalDesktopPreferences.message,
    autoHideMenuBar: true,
    backgroundColor: '#FFFFFF',
    show: false,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      preload: path.join(__dirname, 'debug_log_preload.js'),
      // sandbox: true,
      nativeWindowOpen: true,
    },
    parent: mainWindow,
  };

  debugLogWindow = new BrowserWindow(options);

  captureClicks(debugLogWindow);

  debugLogWindow.loadURL(prepareURL([__dirname, 'debug_log.html'], { theme }));

  debugLogWindow.on('closed', () => {
    removeDarkOverlay();
    debugLogWindow = null;
  });

  debugLogWindow.once('ready-to-show', () => {
    addDarkOverlay();
    debugLogWindow.show();
  });
}

let permissionsPopupWindow;
async function showPermissionsPopupWindow() {
  if (permissionsPopupWindow) {
    permissionsPopupWindow.show();
    return;
  }
  if (!mainWindow) {
    return;
  }

  const theme = await pify(getDataFromMainWindow)('theme-setting');
  const size = mainWindow.getSize();
  const options = {
    width: Math.min(400, size[0]),
    height: Math.min(150, size[1]),
    resizable: false,
    title: locale.messages.signalDesktopPreferences.message,
    autoHideMenuBar: true,
    backgroundColor: '#FFFFFF',
    show: false,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      preload: path.join(__dirname, 'permissions_popup_preload.js'),
      // sandbox: true,
      nativeWindowOpen: true,
    },
    parent: mainWindow,
  };

  permissionsPopupWindow = new BrowserWindow(options);

  captureClicks(permissionsPopupWindow);

  permissionsPopupWindow.loadURL(
    prepareURL([__dirname, 'permissions_popup.html'], { theme })
  );

  permissionsPopupWindow.on('closed', () => {
    removeDarkOverlay();
    permissionsPopupWindow = null;
  });

  permissionsPopupWindow.once('ready-to-show', () => {
    addDarkOverlay();
    permissionsPopupWindow.show();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
let ready = false;
(async function () {
  const userDataPath = app.getPath('userData');

  let loggingSetupError;
  try {
    await logging.initialize();
  } catch (error) {
    loggingSetupError = error;
  }

  logger = logging.getLogger();
  logger.info('app ready');

  if (loggingSetupError) {
    logger.error('Problem setting up logging', loggingSetupError.stack);
  }

  if (!locale) {
    const appLocale = process.env.UWP_ENV === 'test' ? 'en' : Windows.Globalization.ApplicationLanguages.languages[0];
    locale = loadLocale({ appLocale, logger });
  }

  await attachmentChannel.initialize({ configDir: userDataPath });

  let key = userConfig.get('key');
  if (!key) {
    // https://www.zetetic.net/sqlcipher/sqlcipher-api/#key
    key = crypto.randomBytes(32).toString('hex');
    userConfig.set('key', key);
  }

  await sql.initialize({ configDir: userDataPath, key });
  await sqlChannels.initialize({ userConfig });

  ready = true;
})();

function setupMenu(options) {
  const { platform } = process;
  const menuOptions = Object.assign({}, options, {
    development,
    showDebugLog: showDebugLogWindow,
    showWindow,
    showAbout,
    showSettings: showSettingsWindow,
    openReleaseNotes,
    openNewBugForm,
    openSupportPage,
    openForums,
    platform,
    setupWithImport,
    setupAsNewDevice,
    setupAsStandalone,
  });
  const template = createTemplate(menuOptions, locale.messages);
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

ipc.on('set-badge-count', (event, count) => {
  var Notifications = Windows.UI.Notifications;
  var type = typeof (count) === 'string' ? Notifications.BadgeTemplateType.badgeGlyph : Notifications.BadgeTemplateType.badgeNumber;
  var badgeXml = Notifications.BadgeUpdateManager.getTemplateContent(type);
  badgeXml.firstChild.setAttribute('value', count);
  var badge = Notifications.BadgeNotification(badgeXml);
  Notifications.BadgeUpdateManager.createBadgeUpdaterForApplication().update(badge);
});

ipc.on('remove-setup-menu-items', () => {
  setupMenu();
});

ipc.on('add-setup-menu-items', () => {
  setupMenu({
    includeSetup: true,
  });
});

ipc.on('draw-attention', () => {
  Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri('signal://'));
});

ipc.on('set-media-permissions', (event, enabled) => {
  userConfig.set('mediaPermissions', enabled);
});
ipc.on('get-media-permissions', event => {
  // eslint-disable-next-line no-param-reassign
  event.returnValue = userConfig.get('mediaPermissions') || false;
});

ipc.on('restart', () => {
  Windows.UI.WebUI.WebUIApplication.requestRestartAsync('');
});

ipc.on('set-auto-hide-menu-bar', (event, autoHide) => {
  if (mainWindow) {
    mainWindow.setAutoHideMenuBar(autoHide);
  }
});

ipc.on('set-menu-bar-visibility', (event, visibility) => {
  if (mainWindow) {
    mainWindow.setMenuBarVisibility(visibility);
  }
});

ipc.on('close-about', () => {
  if (aboutWindow) {
    aboutWindow.close();
  }
});

ipc.on('update-tray-icon', (event, unreadCount) => {
  if (tray) {
    tray.updateIcon(unreadCount);
  }
});

// Debug Log-related IPC calls

ipc.on('show-debug-log', showDebugLogWindow);
ipc.on('close-debug-log', () => {
  if (debugLogWindow) {
    debugLogWindow.close();
  }
});

// Permissions Popup-related IPC calls

ipc.on('show-permissions-popup', showPermissionsPopupWindow);
ipc.on('close-permissions-popup', () => {
  if (permissionsPopupWindow) {
    permissionsPopupWindow.close();
  }
});

// Settings-related IPC calls

function addDarkOverlay() {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('add-dark-overlay');
  }
}
function removeDarkOverlay() {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('remove-dark-overlay');
  }
}

ipc.on('show-settings', showSettingsWindow);
ipc.on('close-settings', () => {
  if (settingsWindow) {
    settingsWindow.close();
  }
});

installSettingsGetter('device-name');

installSettingsGetter('theme-setting');
installSettingsSetter('theme-setting');
installSettingsGetter('hide-menu-bar');
installSettingsSetter('hide-menu-bar');

installSettingsGetter('notification-setting');
installSettingsSetter('notification-setting');
installSettingsGetter('audio-notification');
installSettingsSetter('audio-notification');

installSettingsGetter('spell-check');
installSettingsSetter('spell-check');

// This one is different because its single source of truth is userConfig, not IndexedDB
ipc.on('get-media-permissions', event => {
  event.sender.send(
    'get-success-media-permissions',
    null,
    userConfig.get('mediaPermissions') || false
  );
});
ipc.on('set-media-permissions', (event, value) => {
  userConfig.set('mediaPermissions', value);

  // We reinstall permissions handler to ensure that a revoked permission takes effect
  installPermissionsHandler({ session, userConfig });

  event.sender.send('set-success-media-permissions', null);
});

installSettingsGetter('is-primary');
installSettingsGetter('sync-request');
installSettingsGetter('sync-time');
installSettingsSetter('sync-time');

ipc.on('delete-all-data', () => {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('delete-all-data');
  }
});

function getDataFromMainWindow(name, callback) {
  ipc.once(`get-success-${name}`, (_event, error, value) =>
    callback(error, value)
  );
  mainWindow.webContents.send(`get-${name}`);
}

function installSettingsGetter(name) {
  ipc.on(`get-${name}`, event => {
    if (mainWindow && mainWindow.webContents) {
      getDataFromMainWindow(name, (error, value) =>
        event.sender.send(`get-success-${name}`, error, value)
      );
    }
  });
}

function installSettingsSetter(name) {
  ipc.on(`set-${name}`, (event, value) => {
    if (mainWindow && mainWindow.webContents) {
      ipc.once(`set-success-${name}`, (_event, error) =>
        event.sender.send(`set-success-${name}`, error)
      );
      mainWindow.webContents.send(`set-${name}`, value);
    }
  });
}
