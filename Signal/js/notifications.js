/*
 * vim: ts=4:sw=4:expandtab
 */
;(function() {
    'use strict';
    window.Whisper = window.Whisper || {};

    var SETTINGS = {
        OFF     : 'off',
        COUNT   : 'count',
        NAME    : 'name',
        MESSAGE : 'message'
    };

    var sound = new Audio('audio/NewMessage.mp3');

    Whisper.Notifications = new (Backbone.Collection.extend({
        initialize: function() {
            this.on('add', this.update);
            this.on('remove', this.onRemove);
        },
        onclick: function() {
            var conversation;
            var last = this.last();
            if (last) {
                conversation = ConversationController.get(last.get('conversationId'));
            }
            this.trigger('click', conversation);
            this.clear();
        },
        update: function() {
            console.log('updating notifications', this.length);
            extension.notification.clear();
            if (this.length === 0) {
                return;
            }
            var audioNotification = storage.get('audio-notification') || false;
            if (audioNotification) {
                sound.play();
            }

            var setting = storage.get('notification-setting') || 'message';
            if (setting === SETTINGS.OFF) {
                return;
            }

            var iconUrl = 'images/icon_128.png';
            var title = [
                this.length,
                this.length === 1 ? i18n('newMessage') : i18n('newMessages')
            ].join(' ');

            if (setting === SETTINGS.COUNT) {
                extension.notification.update({
                    type     : 'basic',
                    title    : title,
                    iconUrl  : iconUrl
                });
                return;
            }

            var m = this.last();
            var type = 'basic';
            var message = i18n('newMessage');
            var imageUrl;
            if (this.showMessage()) {
                message = m.get('message');
                if (m.get('imageUrl')) {
                    type = 'image';
                    imageUrl = m.get('imageUrl');
                }
            }
            if (this.showSender()) {
                title = m.get('title');
                iconUrl = m.get('iconUrl');
            }
            extension.notification.update({
                type     : type,
                title    : title,
                message  : message,
                iconUrl  : iconUrl,
                imageUrl : imageUrl
            });

            var Notifications = Windows.UI.Notifications;
            var toastXml = Notifications.ToastNotificationManager.getTemplateContent(Notifications.ToastTemplateType.toastText02);
            var toastNodeList = toastXml.getElementsByTagName('text');
            toastNodeList[0].appendChild(toastXml.createTextNode(title));
            toastNodeList[1].appendChild(toastXml.createTextNode(message));
            toastXml.createElement('audio').setAttribute('src', 'ms-winsoundevent:Notification.SMS');
            var toast = Notifications.ToastNotification(toastXml);
            Notifications.ToastNotificationManager.createToastNotifier().show(toast);
            window.setBadgeCount(this.length);
        },
        getSetting: function() {
            return storage.get('notification-setting') || 'message';
        },
        showMessage: function() {
            return this.getSetting() === SETTINGS.MESSAGE;
        },
        showSender: function() {
            var setting = this.getSetting();
            return (setting === SETTINGS.MESSAGE || setting === SETTINGS.NAME);
        },
        onRemove: function() {
            console.log('remove notification');
            if (this.length === 0) {
                extension.notification.clear();
                return;
            }
        },
        clear: function() {
            this.reset([]);
        }
    }))();
})();
