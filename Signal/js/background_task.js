'use strict';

var window = this;
window.PROTO_ROOT = '/protos';
importScripts('ms-appx:///libtextsecure/components.js','ms-appx:///libtextsecure/protobufs.js','ms-appx:///typescript/textsecure/EventTarget.js','ms-appx:///typescript/textsecure/WebsocketResources.js');
window.textsecure = Object.assign(window.textsecure, window.ts.textsecure);

function updateToast(message) {
    var shouldShowNotification = Windows.Storage.ApplicationData.current.localSettings.values['notification-setting'] || 'message';
    if (shouldShowNotification !== 'off') {
        var shouldPlayNotificationSound = Windows.Storage.ApplicationData.current.localSettings.values['audio-notification'] || false;
        var toastXml = Notifications.ToastNotificationManager.getTemplateContent(Notifications.ToastTemplateType.toastText02);
        var toastNodeList = toastXml.getElementsByTagName('text');
        toastNodeList[0].appendChild(toastXml.createTextNode(message));
        shouldPlayNotificationSound && toastXml.createElement('audio').setAttribute('src', 'ms-winsoundevent:Notification.SMS');
        var toast = Notifications.ToastNotification(toastXml);
        Notifications.ToastNotificationManager.createToastNotifier().show(toast);
    }
}
var Notifications = Windows.UI.Notifications;
Notifications.ToastNotificationManager.history.clear();

function updateBadge(count) {
    var Notifications = Windows.UI.Notifications;
    var type = typeof (count) === 'string' ? Notifications.BadgeTemplateType.badgeGlyph : Notifications.BadgeTemplateType.badgeNumber;
    var badgeXml = Notifications.BadgeUpdateManager.getTemplateContent(type);
    badgeXml.firstChild.setAttribute('value', count);
    var badge = Notifications.BadgeNotification(badgeXml);
    Notifications.BadgeUpdateManager.createBadgeUpdaterForApplication().update(badge);
}
updateBadge(0);

var url = 'https://textsecure-service.whispersystems.org';
var number_id = Windows.Storage.ApplicationData.current.localSettings.values['number_id'];
var password = Windows.Storage.ApplicationData.current.localSettings.values['password'];

var socket = new WebSocket(
url.replace('https://', 'wss://').replace('http://', 'ws://')
    + '/v1/websocket/?login=' + encodeURIComponent(number_id)
    + '&password=' + encodeURIComponent(password)
    + '&agent=OWD');

socket.onclose = () => close();

var wsr = new window.ts.textsecure.WebsocketResources.default(socket, {
    handleRequest: request => {
        if (request.path === '/api/v1/message' && Notifications.ToastNotificationManager.history.getHistory().length < 1) {
            updateToast('New message(s) received');
            updateBadge('newMessage');
        } else {
            request.respond(200, 'OK');
        }
        socket.close();
    },
    keepalive: { path: '/v1/keepalive', disconnect: true }
});