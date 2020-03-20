'use strict';

var background = Windows.ApplicationModel.Background;

console.info = console.log;
console.warn = console.log;
console.error = console.log;

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
    }
});

window.matchMedia('(max-width: 600px)').addListener(() => {
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