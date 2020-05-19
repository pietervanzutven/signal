'use strict';

var background = Windows.ApplicationModel.Background;
background.BackgroundExecutionManager.removeAccess();
for (var iter = background.BackgroundTaskRegistration.allTasks.first() ; iter.hasCurrent; iter.moveNext()) {
    var task = iter.current.value;
    task.unregister(true);
}
var group = background.BackgroundTaskRegistration.getTaskGroup('Signal');
if (group) {
    for (var iter = group.allTasks.first() ; iter.hasCurrent; iter.moveNext()) {
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
        if (event.detail[0].arguments !== '') {
            var conversation = ConversationController.get(event.detail[0].arguments);
            Whisper.Notifications.trigger('click', conversation);
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

var app = { 
    getVersion: function () {
        var version = Windows.ApplicationModel.Package.current.id.version;
        return version.major + '.' + version.minor + '.' + version.build
    }
};

var ipc = {
    events: {},
    on: function (name, callback) {
        ipc.events[name] = callback;
    },
    send: function (name, args) {
        var event = { name: name, returnValue: null, sender: { send: ipc.send } };
        ipc.events[name](event, args);
        return event.returnValue;
    },
    sendSync: function (name, args) {
        return ipc.send(name, args);
    }
}

let tray = null;

// Both of these will be set after app fires the 'ready' event
let logger;
let locale;

// Ingested in preload.js via a sendSync call
ipc.on('locale-data', (event, arg) => {
    event.returnValue = locale.messages;
});

ipc.on('show-window', () => { });

window.config.name = Windows.ApplicationModel.Package.current.id.name;

window.config.version = app.getVersion();

var version = Windows.System.Profile.AnalyticsInfo.versionInfo.deviceFamilyVersion;
window.config.uwp_version = ((version & 0x00000000FFFF0000) >> 16) + '.' + (version & 0x000000000000FFFF);

window.config.hostname = 'Windows';

window.config.appInstance = Windows.System.Diagnostics.ProcessDiagnosticInfo.getForCurrentProcess().processId;

let loggingSetupError;
logging.initialize().catch((error) => {
    loggingSetupError = error;
}).then(() => {
    logger = logging.getLogger();
    logger.info('app ready');

    if (loggingSetupError) {
        logger.error('Problem setting up logging', loggingSetupError.stack);
    }

    if (!locale) {
        locale = loadLocale();
    }
});

ipc.on('set-badge-count', (event, count) => {
    var Notifications = Windows.UI.Notifications;
    var type = typeof (count) === 'string' ? Notifications.BadgeTemplateType.badgeGlyph : Notifications.BadgeTemplateType.badgeNumber;
    var badgeXml = Notifications.BadgeUpdateManager.getTemplateContent(type);
    badgeXml.firstChild.setAttribute('value', count);
    var badge = Notifications.BadgeNotification(badgeXml);
    Notifications.BadgeUpdateManager.createBadgeUpdaterForApplication().update(badge);
});

ipc.on('draw-attention', () => {
    Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri('signal://'));
});

ipc.on('restart', () => {
    Windows.UI.WebUI.WebUIApplication.requestRestartAsync('');
});

ipc.on('set-auto-hide-menu-bar', (event, autoHide) => {
    if (window.mainWindow) {
        window.mainWindow.setAutoHideMenuBar(autoHide);
    }
});

ipc.on('set-menu-bar-visibility', (event, visibility) => {
    if (window.mainWindow) {
        window.mainWindow.setMenuBarVisibility(visibility);
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