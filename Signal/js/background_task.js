'use strict';

var window = this;
window.config = {};
var loadLocale = function () { return { messages: {} } };

importScripts('ms-appx:///libtextsecure/components.js', 'ms-appx:///app/logging.js', 'ms-appx:///main.js', 'ms-appx:///preload.js', 'ms-appx:///libtextsecure/event_target.js', 'ms-appx:///libtextsecure/protobufs.js', 'ms-appx:///libtextsecure/websocket-resources.js');

var Notifications = Windows.UI.Notifications;
Notifications.ToastNotificationManager.history.clear();
window.setBadgeCount(0);
function updateToast(message) {
    var toastXml = Notifications.ToastNotificationManager.getTemplateContent(Notifications.ToastTemplateType.toastText02);
    var toastNodeList = toastXml.getElementsByTagName('text');
    toastNodeList[0].appendChild(toastXml.createTextNode(message));
    toastXml.createElement('audio').setAttribute('src', 'ms-winsoundevent:Notification.SMS');
    var toast = Notifications.ToastNotification(toastXml);
    Notifications.ToastNotificationManager.createToastNotifier().show(toast);
}

var url = 'https://textsecure-service.whispersystems.org';
var number_id = Windows.Storage.ApplicationData.current.localSettings.values['number_id'];
var password = Windows.Storage.ApplicationData.current.localSettings.values['password'];

var socket = new WebSocket(
url.replace('https://', 'wss://').replace('http://', 'ws://')
    + '/v1/websocket/?login=' + encodeURIComponent(number_id)
    + '&password=' + encodeURIComponent(password)
    + '&agent=OWD');

socket.onclose = () => close();

var wsr = new WebSocketResource(socket, {
    handleRequest: request => {
        if (request.path === '/api/v1/message' && Notifications.ToastNotificationManager.history.getHistory().length < 1) {
            updateToast('New message(s) received');
            window.setBadgeCount('newMessage');
        } else {
            request.respond(200, 'OK');
        }
        socket.close();
    },
    keepalive: { path: '/v1/keepalive', disconnect: true }
});