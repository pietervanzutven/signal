'use strict';

var background = Windows.ApplicationModel.Background;

var consoleLog = console.log;
var debugLog = [];
console.log = function () {
    consoleLog.apply(console, arguments);
    var currentdate = new Date();
    debugLog.push(('0' + currentdate.getHours()).slice(-2) + ':' + ('0' + currentdate.getMinutes()).slice(-2) + ':' + ('0' + currentdate.getSeconds()).slice(-2) + ' - ' + Array.from(arguments).join(' '));
}
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
    backGroundTask.taskEntryPoint = 'js\\backgroundtask.js';
    backGroundTask.isNetworkRequested = true;
    backGroundTask.setTrigger(timeTrigger);
    backGroundTask.addCondition(background.SystemCondition(background.SystemConditionType.internetAvailable));
    backGroundTask.register();
});

Windows.UI.WebUI.WebUIApplication.addEventListener('activated', event => {
    if (event.detail[0].kind === Windows.ApplicationModel.Activation.ActivationKind.protocol) {
        window.fileToken = Windows.Foundation.WwwFormUrlDecoder(event.detail[0].uri.query).getFirstValueByName("file");
    }
});

window.onload = function () {
    console.log('extension launched');
    storage.onready(function () {
        if (Whisper.Registration.everDone()) {
            openInbox();
        }
        if (!Whisper.Registration.isDone()) {
            //extension.install('standalone');
            extension.install('');
        }
    });
};

window.matchMedia('(max-width: 600px)').addListener(() => {
    var gutter = $('#container').contents().find('.gutter');
    var conversation = $('#container').contents().find('.conversation-stack');
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

var Signal = {};
var BBDB = {};
var BBDBchanged = false;

console.log('Loading database...');
Windows.Storage.ApplicationData.current.localFolder.createFileAsync('BBDB.json', Windows.Storage.CreationCollisionOption.openIfExists).then(
    function (file) {
        Windows.Storage.FileIO.readTextAsync(file).then(
            function (text) {
                if (text === '') {
                    BBDB = {};
                } else {
                    BBDB = parseJSON(text);
                    Windows.Storage.ApplicationData.current.localSettings.values['number_id'] = BBDB.items.number_id.value;
                    Windows.Storage.ApplicationData.current.localSettings.values['password'] = BBDB.items.password.value;
                    BBDB.debug = {};
                }

                console.log('Cleanup media items...');
                Windows.Storage.ApplicationData.current.localFolder.getFilesAsync().then(
                    function (files) {
                        text = stringifyJSON(BBDB);
                        files.forEach(
                            function (file) {
                                var fileName = file.name;
                                if (file.fileType === '.dat' && !text.includes(fileName)) {
                                    console.log('Media item ' + fileName + ' not in database, deleting...');
                                    file.deleteAsync().then(
                                        function () {
                                            console.log('Media item ' + fileName + ' deleted.');
                                        }
                                    );
                                }
                            }
                        );
                    }
                );
            }
        );
    }
);

setInterval(function () {
    if (BBDBchanged) {
        BBDBchanged = false;
        console.log('Saving database...');
        Windows.Storage.ApplicationData.current.localFolder.createFileAsync('BBDB.json', Windows.Storage.CreationCollisionOption.openIfExists).then(
            function (file) {
                Windows.Storage.FileIO.writeTextAsync(file, stringifyJSON(BBDB)).then(
                    function () {
                        console.log('Database saved.');
                    }
                );
            }
        );
    }
}, 5000);

Backbone.sync = function (method, object, options) {
    console.log('BB ' + method + ' on store: ' + object.storeName);

    var store = {};
    var storeName = object.storeName;
    if (BBDB[storeName]) {
        store = BBDB[storeName];
    }

    var syncDfd = Backbone.$ ? Backbone.$.Deferred && Backbone.$.Deferred() : Backbone.Deferred && Backbone.Deferred();

    var resp = [];
    switch (method) {
        case "read":
            if (object.id) {
                console.log('BB query id: ' + object.id);
                resp = store[object.id];
            } else if (options.conditions) {
                console.log('BB query conditions: ' + options.conditions);
                console.log('BB QUERY NOT IMPLEMENTED!');
            } else if (options.index) {
                console.log('BB query index: ' + options.index.name);
                switch (options.index.name) {
                    case 'conversation':
                        resp = Object.values(store).filter(element => element.conversationId === options.index.lower[0]);
                        break;
                    case 'unread':
                        resp = Object.values(store).filter(element => element.conversationId === options.index.lower[0] && element.unread);
                        break;
                    case 'search':
                        resp = Object.values(store).filter(element => element.id.includes(options.index.lower) || element.name.toLowerCase().includes(options.index.lower));
                        break;
                    case 'receipt':
                        resp = Object.values(store).filter(element => element.sent_at === options.index.only);
                        break;
                    case 'unique':
                        resp = Object.values(store).filter(element => element.source === options.index.value[0] && element.sourceDevice === options.index.value[1] && element.sent_at === options.index.value[2]);
                        break;
                    case 'expires_at':
                        resp = Object.values(store).filter(element => element.expires_at);
                        break;
                    case 'group':
                        resp = Object.values(store).filter(element => element.members && element.members.indexOf(options.index.only) !== -1);
                        break;
                    default:
                        console.log('BB QUERY NOT IMPLEMENTED!');
                }
            } else if (options.range) {
                console.log('BB query range: ' + options.range);
                resp = Object.values(store).filter(element => element.id >= options.range[0] && element.id <= options.range[1]);
            } else {
                console.log('BB query all elements');
                resp = Object.values(store);
            }
            if (Array.isArray(resp) && resp.length > 1 && options.limit) {
                resp = resp.slice(-options.limit);
            }
            break;
        case "create":
        case "update":
            if (!object.id && object.id !== 0) {
                object.id = Date.now();
                object.attributes.id = object.id;
            }
            resp = object.toJSON();

            if (resp.attachments) {
                for (var i = 0; i < resp.attachments.length; i++) {
                    if (resp.attachments[i].data instanceof ArrayBuffer) {
                        resp.attachments[i].data = saveMediaItem(resp.attachments[i].data);
                    }
                }
            }
            if (resp.avatar && resp.avatar.data instanceof ArrayBuffer) {
                resp.avatar.data = saveMediaItem(resp.avatar.data);
            }

            store[object.id] = resp;
            BBDBchanged = true;
            break;
        case "delete":
            resp = null;

            if (object.id || object.cid) {
                if (object.attributes.attachments) {
                    for (var i = 0; i < object.attributes.attachments.length; i++) {
                        if (!(object.attributes.attachments[i].data instanceof ArrayBuffer)) {
                            deleteMediaItem(object.attributes.attachments[i].data);
                        }
                    }
                }
                if (object.attributes.avatar && !(object.attributes.avatar.data instanceof ArrayBuffer)) {
                    deleteMediaItem(object.attributes.avatar.data);
                }

                delete store[object.id];
            } else {
                store = {};
            }

            BBDBchanged = true;
            break;
    }
    BBDB[storeName] = store;

    if (options && options.success) {
        options.success(resp);
    }
    if (syncDfd) {
        syncDfd.resolve(resp);
    }

    return syncDfd && syncDfd.promise();
};

function saveMediaItem(dataArray) {
    var fileName = Date.now() + Math.random() + '.dat';
    console.log('Saving media item ' + fileName + '...');
    var data = new Uint8Array(dataArray);
    Windows.Storage.ApplicationData.current.localFolder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.failIfExists).then(
        function (file) {
            Windows.Storage.FileIO.writeBytesAsync(file, data).then(
                function () {
                    console.log('Media item ' + fileName + ' saved.');
                }
            );
        }
    );
    return fileName;
}

function deleteMediaItem(fileName) {
    console.log('Deleting media item ' + fileName + '.');
    Windows.Storage.ApplicationData.current.localFolder.getFileAsync(fileName).then(
        function (file) {
            file.deleteAsync().then(
                function () {
                    console.log('Media item ' + fileName + ' deleted.');
                }
            );
        }
    );
}

function stringifyJSON(object) {
    return JSON.stringify(object, function (key, value) {
        if (value instanceof ArrayBuffer) {
            value = 'ArrayBufferString' + btoa(String.fromCharCode.apply(null, new Uint8Array(value)));
        }
        return value;
    });
}

function parseJSON(string) {
    return JSON.parse(string, function (key, value) {
        if (typeof value === 'string') {
            if (value.substring(0, 17) === 'ArrayBufferString') {
                var str = atob(value.replace('ArrayBufferString', ''));
                value = new ArrayBuffer(str.length);
                var array = new Uint8Array(value);
                for (var i = 0; i < str.length; i++) {
                    array[i] = str.charCodeAt(i);
                }
            }
        }
        if (key === 'attachments') {
            for (var i = 0; i < value.length; i++) {
                if (value[i].data instanceof ArrayBuffer) {
                    value[i].data = saveMediaItem(value[i].data);
                }
            }
        }
        if (key === 'avatar' && value && value.data instanceof ArrayBuffer) {
            value.data = saveMediaItem(value.data);
        }
        return value;
    });
}