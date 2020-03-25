﻿'use strict';

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

// Ingested in preload.js via a sendSync call
ipc.on('locale-data', function (event, arg) {
    event.returnValue = locale.messages;
});

ipc.on('show-window', function () { });

ipc.on('set-badge-count', function (event, count) {
    var Notifications = Windows.UI.Notifications;
    var type = typeof (count) === 'string' ? Notifications.BadgeTemplateType.badgeGlyph : Notifications.BadgeTemplateType.badgeNumber;
    var badgeXml = Notifications.BadgeUpdateManager.getTemplateContent(type);
    badgeXml.firstChild.setAttribute('value', count);
    var badge = Notifications.BadgeNotification(badgeXml);
    Notifications.BadgeUpdateManager.createBadgeUpdaterForApplication().update(badge);
});

ipc.on('draw-attention', function () {
    Windows.System.Launcher.launchUriAsync(new Uri('signal://'));
});

ipc.on('restart', function () {
    Windows.UI.WebUI.WebUIApplication.requestRestartAsync('');
});

logging.initialize();
const logger = logging.getLogger();

var version = Windows.System.Profile.AnalyticsInfo.versionInfo.deviceFamilyVersion;
window.config.uwp_version = ((version & 0x00000000FFFF0000) >> 16) + '.' + (version & 0x000000000000FFFF);

let locale;
if (!locale) {
    locale = loadLocale();
}

ipc.on("set-auto-hide-menu-bar", function (event, autoHide) { });

ipc.on("set-menu-bar-visibility", function (event, visibility) { });