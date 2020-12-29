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

window.onload = () => {
  storage.onready(() => {
    const color = Windows.UI.ViewManagement.UISettings().getColorValue(Windows.UI.ViewManagement.UIColorType.background);
    if (color.b === 255) {
      storage.put('theme-setting', 'light');
    } else {
      storage.put('theme-setting', 'dark');
    }
  });
}

window.requestIdleCallback = () => { };

const path = window.path;
const url = window.url;
const os = window.os;
const fs = window.fs;
const crypto = window.crypto;
const qs = window.qs;

const pify = window.pify;

const packageJson = {
  name: 'signal-desktop',
  productName: 'Signal',
};
const GlobalErrors = window.app.global_errors;

GlobalErrors.addHandler();

const getRealPath = pify(fs.realpath);
const {
  app,
  BrowserWindow,
  ipcMain: ipc,
  Menu,
  protocol: electronProtocol,
  session,
  shell,
} = electron;

const appUserModelId = `org.whispersystems.${packageJson.name}`;
console.log('Set Windows Application User Model ID (AUMID)', {
  appUserModelId,
});
app.setAppUserModelId(appUserModelId);

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

const config = window.app.config;

// Very important to put before the single instance check, since it is based on the
//   userData directory.
const userConfig = window.app.user_config;

const importMode =
  process.argv.some(arg => arg === '--import') || config.get('import');

const development = config.environment === 'development';

// We generally want to pull in our own modules after this point, after the user
//   data directory has been set.
const attachments = window.app.attachments
const attachmentChannel = window.app.attachment_channel;
const createTrayIcon = window.app.tray_icon;
const dockIcon = window.app.dock_icon;
const ephemeralConfig = window.app.ephemeral_config;
const logging = window.app.logging;
const sql = window.app.sql;
const sqlChannels = window.app.sql_channel;
const windowState = window.app.window_state;

function showWindow() {
  if (!mainWindow) {
    return;
  }

  // Using focus() instead of show() seems to be important on Windows when our window
  //   has been docked using Aero Snap/Snap Assist. A full .show() call here will cause
  //   the window to reposition:
  //   https://github.com/signalapp/Signal-Desktop/issues/1429
  if (mainWindow.isVisible()) {
    mainWindow.focus();
  } else {
    mainWindow.show();
  }

  // toggle the visibility of the show/hide tray icon menu entries
  if (tray) {
    tray.updateContextMenu();
  }

  // show the app on the Dock in case it was hidden before
  dockIcon.show();
}

if (!process.mas) {
  console.log('making app single instance');
  const gotLock = app.requestSingleInstanceLock();
  if (!gotLock) {
    console.log('quitting; we are the second instance');
    app.exit();
  } else {
    app.on('second-instance', () => {
      // Someone tried to run a second instance, we should focus our window
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }

        showWindow();
      }
      return true;
    });
  }
}

const windowFromUserConfig = userConfig.get('window');
const windowFromEphemeral = ephemeralConfig.get('window');
let windowConfig = windowFromEphemeral || windowFromUserConfig;
if (windowFromUserConfig) {
  userConfig.set('window', null);
  ephemeralConfig.set('window', windowConfig);
}

const loadLocale = window.app.locale.load;

// Both of these will be set after app fires the 'ready' event
let logger;
let locale;

function prepareURL(pathSegments, moreKeys) {
  return url.format({
    pathname: path.join.apply(null, pathSegments),
    protocol: 'file:',
    slashes: true,
    query: Object.assign({},
      {
        name: packageJson.productName,
        locale: locale.name,
        version: app.getVersion(),
        buildExpiration: config.get('buildExpiration'),
        serverUrl: config.get('serverUrl'),
        cdnUrl: config.get('cdnUrl'),
        certificateAuthority: config.get('certificateAuthority'),
        environment: config.environment,
        uwp_version: process.versions.uwp,
        hostname: os.hostname(),
        appInstance: process.env.NODE_APP_INSTANCE,
        proxyUrl: process.env.HTTPS_PROXY || process.env.https_proxy,
        contentProxyUrl: config.contentProxyUrl,
        importMode: importMode ? true : undefined, // for stringify()
        serverTrustRoot: config.get('serverTrustRoot'),
      },
      moreKeys,
    ),
  });
}

function handleUrl(event, target) {
  event.preventDefault();
  const { protocol } = url.parse(target);
  if (protocol === 'http:' || protocol === 'https:') {
    shell.openExternal(target);
  }
}

function captureClicks(window) { }

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 610;
const MIN_WIDTH = 640;
const MIN_HEIGHT = 360;
const BOUNDS_BUFFER = 100;

function isVisible(window, bounds) {
  const boundsX = _.get(bounds, 'x') || 0;
  const boundsY = _.get(bounds, 'y') || 0;
  const boundsWidth = _.get(bounds, 'width') || DEFAULT_WIDTH;
  const boundsHeight = _.get(bounds, 'height') || DEFAULT_HEIGHT;

  // requiring BOUNDS_BUFFER pixels on the left or right side
  const rightSideClearOfLeftBound =
    window.x + window.width >= boundsX + BOUNDS_BUFFER;
  const leftSideClearOfRightBound =
    window.x <= boundsX + boundsWidth - BOUNDS_BUFFER;

  // top can't be offscreen, and must show at least BOUNDS_BUFFER pixels at bottom
  const topClearOfUpperBound = window.y >= boundsY;
  const topClearOfLowerBound =
    window.y <= boundsY + boundsHeight - BOUNDS_BUFFER;

  return (
    rightSideClearOfLeftBound &&
    leftSideClearOfRightBound &&
    topClearOfUpperBound &&
    topClearOfLowerBound
  );
}

function createWindow() {
  const { screen } = electron;
  const windowOptions = Object.assign(
    {
      show: !startInTray, // allow to start minimised in tray
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      minWidth: MIN_WIDTH,
      minHeight: MIN_HEIGHT,
      autoHideMenuBar: false,
      backgroundColor:
        config.environment === 'test' || config.environment === 'test-lib'
          ? '#ffffff' // Tests should always be rendered on a white background
          : '#2090EA',
      webPreferences: {
        nodeIntegration: false,
        nodeIntegrationInWorker: false,
        contextIsolation: false,
        preload: path.join(__dirname, 'preload.js'),
        nativeWindowOpen: true,
      },
      icon: path.join(__dirname, 'images', 'icon_256.png'),
    },
    _.pick(windowConfig, [
      'maximized',
      'autoHideMenuBar',
      'width',
      'height',
      'x',
      'y',
    ])
  );

  if (!_.isNumber(windowOptions.width) || windowOptions.width < MIN_WIDTH) {
    windowOptions.width = DEFAULT_WIDTH;
  }
  if (!_.isNumber(windowOptions.height) || windowOptions.height < MIN_HEIGHT) {
    windowOptions.height = DEFAULT_HEIGHT;
  }
  if (!_.isBoolean(windowOptions.maximized)) {
    delete windowOptions.maximized;
  }
  if (!_.isBoolean(windowOptions.autoHideMenuBar)) {
    delete windowOptions.autoHideMenuBar;
  }

  const visibleOnAnyScreen = _.some(screen.getAllDisplays(), display => {
    if (!_.isNumber(windowOptions.x) || !_.isNumber(windowOptions.y)) {
      return false;
    }

    return isVisible(windowOptions, _.get(display, 'bounds'));
  });
  if (!visibleOnAnyScreen) {
    console.log('Location reset needed');
    delete windowOptions.x;
    delete windowOptions.y;
  }

  if (windowOptions.fullscreen === false) {
    delete windowOptions.fullscreen;
  }

  logger.info(
    'Initializing BrowserWindow config: %s',
    JSON.stringify(windowOptions)
  );
}

// Create the browser window.
mainWindow = new BrowserWindow();

function captureAndSaveWindowStats() {
  if (!mainWindow) {
    return;
  }

  const size = mainWindow.getSize();
  const position = mainWindow.getPosition();

  // so if we need to recreate the window, we have the most recent settings
  windowConfig = {
    maximized: mainWindow.isMaximized(),
    autoHideMenuBar: mainWindow.isMenuBarAutoHide(),
    width: size[0],
    height: size[1],
    x: position[0],
    y: position[1],
  };

  if (mainWindow.isFullScreen()) {
    // Only include this property if true, because when explicitly set to
    // false the fullscreen button will be disabled on osx
    windowConfig.fullscreen = true;
  }

  logger.info(
    'Updating BrowserWindow config: %s',
    JSON.stringify(windowConfig)
  );
  ephemeralConfig.set('window', windowConfig);
}

const debouncedCaptureStats = _.debounce(captureAndSaveWindowStats, 500);
mainWindow.on('resize', debouncedCaptureStats);
mainWindow.on('move', debouncedCaptureStats);

mainWindow.on('focus', () => {
  mainWindow.flashFrame(false);
});

// Ingested in preload.js via a sendSync call
ipc.on('locale-data', event => {
  // eslint-disable-next-line no-param-reassign
  event.returnValue = locale.messages;
});

if (config.get('openDevTools')) {
  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

captureClicks(mainWindow);

// Emitted when the window is about to be closed.
// Note: We do most of our shutdown logic here because all windows are closed by
//   Electron before the app quits.
mainWindow.on('close', async e => {
  console.log('close event', {
    readyForShutdown: mainWindow ? mainWindow.readyForShutdown : null,
    shouldQuit: windowState.shouldQuit(),
  });
  // If the application is terminating, just do the default
  if (
    config.environment === 'test' ||
    config.environment === 'test-lib' ||
    (mainWindow.readyForShutdown && windowState.shouldQuit())
  ) {
    return;
  }

  // Prevent the shutdown
  e.preventDefault();
  mainWindow.hide();

  // On Mac, or on other platforms when the tray icon is in use, the window
  // should be only hidden, not closed, when the user clicks the close button
  if (
    !windowState.shouldQuit() &&
    (usingTrayIcon || process.platform === 'darwin')
  ) {
    // toggle the visibility of the show/hide tray icon menu entries
    if (tray) {
      tray.updateContextMenu();
    }

    // hide the app from the Dock on macOS if the tray icon is enabled
    if (usingTrayIcon) {
      dockIcon.hide();
    }

    return;
  }

  await requestShutdown();
  if (mainWindow) {
    mainWindow.readyForShutdown = true;
  }
  app.quit();
});

// Emitted when the window is closed.
mainWindow.on('closed', () => {
  // Dereference the window object, usually you would store windows
  // in an array if your app supports multi windows, this is the time
  // when you should delete the corresponding element.
  mainWindow = null;
});

ipc.on('show-window', () => {
  showWindow();
});

ipc.once('ready-for-updates', async () => {
  // First, install requested sticker pack
  if (process.argv.length > 1) {
    const [incomingUrl] = process.argv;
    if (incomingUrl.startsWith('sgnl://')) {
      handleSgnlLink(incomingUrl);
    }
  }

  // Second, start checking for app updates
  try {
    await updater.start(getMainWindow, locale.messages, logger);
  } catch (error) {
    logger.error(
      'Error starting update checks:',
      error && error.stack ? error.stack : error
    );
  }
});

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
      contextIsolation: false,
      preload: path.join(__dirname, 'about_preload.js'),
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
      contextIsolation: false,
      preload: path.join(__dirname, 'settings_preload.js'),
      nativeWindowOpen: true,
    },
    parent: mainWindow,
  };

  settingsWindow = new BrowserWindow(options);

  captureClicks(settingsWindow);

  settingsWindow.loadURL(prepareURL([__dirname, 'settings.html']));

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
      contextIsolation: false,
      preload: path.join(__dirname, 'debug_log_preload.js'),
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
      contextIsolation: false,
      preload: path.join(__dirname, 'permissions_popup_preload.js'),
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
(async () => {
  const userDataPath = app.getPath('userData');

  await logging.initialize();
  logger = logging.getLogger();
  logger.info('app ready');
  logger.info(`starting version ${packageJson.version}`);

  if (!locale) {
    const appLocale = process.env.UWP_ENV === 'test' ? 'en' : app.getLocale();
    locale = loadLocale({ appLocale, logger });
  }

  GlobalErrors.updateLocale(locale.messages);

  let key = userConfig.get('key');
  if (!key) {
    console.log(
      'key/initialize: Generating new encryption key, since we did not find it on disk'
    );
    // https://www.zetetic.net/sqlcipher/sqlcipher-api/#key
    key = crypto.randomBytes(32).toString('hex');
    userConfig.set('key', key);
  }
  const success = await sql.initialize({
    configDir: userDataPath,
    key,
    messages: locale.messages,
  });
  if (!success) {
    console.log('sql.initialize was unsuccessful; returning early');
    return;
  }
  await sqlChannels.initialize();

  try {
    const IDB_KEY = 'indexeddb-delete-needed';
    const item = await sql.getItemById(IDB_KEY);
    if (item && item.value) {
      await sql.removeIndexedDBFiles();
      await sql.removeItemById(IDB_KEY);
    }
  } catch (error) {
    console.log(
      '(ready event handler) error deleting IndexedDB:',
      error && error.stack ? error.stack : error
    );
  }

  async function cleanupOrphanedAttachments() {
    const allAttachments = await attachments.getAllAttachments(userDataPath);
    const orphanedAttachments = await sql.removeKnownAttachments(
      allAttachments
    );
    await attachments.deleteAll({
      userDataPath,
      attachments: orphanedAttachments,
    });

    const allStickers = await attachments.getAllStickers(userDataPath);
    const orphanedStickers = await sql.removeKnownStickers(allStickers);
    await attachments.deleteAllStickers({
      userDataPath,
      stickers: orphanedStickers,
    });
  }

  try {
    await attachments.clearTempPath(userDataPath);
  } catch (error) {
    logger.error(
      'main/ready: Error deleting temp dir:',
      error && error.stack ? error.stack : error
    );
  }
  await attachmentChannel.initialize({
    configDir: userDataPath,
    cleanupOrphanedAttachments,
  });

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

async function requestShutdown() {
  if (!mainWindow || !mainWindow.webContents) {
    return;
  }

  console.log('requestShutdown: Requesting close of mainWindow...');
  const request = new Promise((resolve, reject) => {
    ipc.once('now-ready-for-shutdown', (_event, error) => {
      console.log('requestShutdown: Response received');

      if (error) {
        return reject(error);
      }

      return resolve();
    });
    mainWindow.webContents.send('get-ready-for-shutdown');

    // We'll wait two minutes, then force the app to go down. This can happen if someone
    //   exits the app before we've set everything up in preload() (so the browser isn't
    //   yet listening for these events), or if there are a whole lot of stacked-up tasks.
    // Note: two minutes is also our timeout for SQL tasks in data.js in the browser.
    setTimeout(() => {
      console.log(
        'requestShutdown: Response never received; forcing shutdown.'
      );
      resolve();
    }, 2 * 60 * 1000);
  });

  try {
    await request;
  } catch (error) {
    console.log(
      'requestShutdown error:',
      error && error.stack ? error.stack : error
    );
  }
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
      getDataFromMainWindow(name, (error, value) => {
        const contents = event.sender;
        if (contents.isDestroyed()) {
          return;
        }

        contents.send(`get-success-${name}`, error, value);
      });
    }
  });
}

function installSettingsSetter(name) {
  ipc.on(`set-${name}`, (event, value) => {
    if (mainWindow && mainWindow.webContents) {
      ipc.once(`set-success-${name}`, (_event, error) => {
        const contents = event.sender;
        if (contents.isDestroyed()) {
          return;
        }

        contents.send(`set-success-${name}`, error);
      });
      mainWindow.webContents.send(`set-${name}`, value);
    }
  });
}

function handleSgnlLink(incomingUrl) {
  const { host: command, query } = url.parse(incomingUrl);
  const args = qs.parse(query);
  if (command === 'addstickers' && mainWindow && mainWindow.webContents) {
    const { pack_id: packId, pack_key: packKeyHex } = args;
    const packKey = Buffer.from(packKeyHex, 'hex').toString('base64');
    mainWindow.webContents.send('show-sticker-pack', { packId, packKey });
  } else {
    console.error('Unhandled sgnl link');
  }
}
