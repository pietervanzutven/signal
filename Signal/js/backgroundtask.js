'use strict';

var Notifications = Windows.UI.Notifications;

var window = this;
importScripts('ms-appx:///libtextsecure/components.js', 'ms-appx:///libtextsecure/protobufs.js', 'ms-appx:///libtextsecure/websocket-resources.js');

var debugLog = '';
function log(message)
{
    var currentDate = new Date();
    debugLog += ('00' + currentDate.getHours()).slice(-2) + ":" + ('00' + currentDate.getMinutes()).slice(-2) + ":" + ('00' + currentDate.getSeconds()).slice(-2) + ' - ' + message + '\n';
}

function updateToast(message)
{
    var toastXml = Notifications.ToastNotificationManager.getTemplateContent(Notifications.ToastTemplateType.toastText02);
    var toastNodeList = toastXml.getElementsByTagName('text');
    toastNodeList[0].appendChild(toastXml.createTextNode(message));
    toastXml.createElement('audio').setAttribute('src', 'ms-winsoundevent:Notification.SMS');
    var toast = Notifications.ToastNotification(toastXml);
    Notifications.ToastNotificationManager.createToastNotifier().show(toast);
}

function updateBadge(type, value) {
    var badgeXml = Notifications.BadgeUpdateManager.getTemplateContent(type);
    badgeXml.firstChild.setAttribute('value', value);
    var badge = Notifications.BadgeNotification(badgeXml);
    Notifications.BadgeUpdateManager.createBadgeUpdaterForApplication().update(badge);
}

(function () {
    log('Timer triggered');
    Notifications.ToastNotificationManager.history.clear();
    updateBadge(Notifications.BadgeTemplateType.badgeNumber, 0);

    var url = 'https://textsecure-service.whispersystems.org';
    var number_id = Windows.Storage.ApplicationData.current.localSettings.values['number_id'];
    var password = Windows.Storage.ApplicationData.current.localSettings.values['password'];

    var socket = new WebSocket(
    url.replace('https://', 'wss://').replace('http://', 'ws://')
        + '/v1/websocket/?login=' + encodeURIComponent(number_id)
        + '&password=' + encodeURIComponent(password)
        + '&agent=OWD');

    socket.onclose = () => {
        log('Socket closed');
        close();
    };
    socket.onerror = () => {
        log('Socket error');
    };
    socket.onopen = () => {
        log('Socket opened');
    };

    var wsr = new WebSocketResource(socket, {
        handleRequest: request => {
            log('Request received\npath: ' + request.path);
            if (request.path === '/api/v1/message' && Notifications.ToastNotificationManager.history.getHistory().length < 1) {
                log('New message(s) received');
                updateToast('New message(s) received');
                updateBadge(Notifications.BadgeTemplateType.badgeGlyph, 'newMessage');
            } else {
                request.respond(200, 'OK');
                if (request.verb === 'PUT' && request.path === '/api/v1/queue/empty') {
                    log('No new messages');
                }
            }
            socket.close();
        },
        keepalive: { path: '/v1/keepalive', disconnect: true }
    });
})();