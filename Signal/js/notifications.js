/*
 * vim: ts=4:sw=4:expandtab
 */

;(function() {
    'use strict';
    window.Whisper = window.Whisper || {};
    const { Settings } = window.Signal.Types;

    var SETTINGS = {
        OFF     : 'off',
        COUNT   : 'count',
        NAME    : 'name',
        MESSAGE : 'message'
    };

    Whisper.Notifications = new (Backbone.Collection.extend({
        initialize: function() {
            this.isEnabled = false;
            this.on('add', this.update);
            this.on('remove', this.onRemove);
        },
        onClick: function(conversationId) {
            var conversation = ConversationController.get(conversationId);
            this.trigger('click', conversation);
        },
        update: function() {
            const isFocused = window.isFocused();
            const isAudioNotificationEnabled = storage.get('audio-notification') || false;
            const isAudioNotificationSupported = Settings.isAudioNotificationSupported();
            const shouldPlayNotificationSound = isAudioNotificationSupported &&
                isAudioNotificationEnabled;
            const numNotifications = this.length;
            console.log(
                'Update notifications:',
                'isFocused:', isFocused,
                'isEnabled:', this.isEnabled,
                'numNotifications:', numNotifications,
                'shouldPlayNotificationSound:', shouldPlayNotificationSound
            );

            if (!this.isEnabled) {
                return;
            }

            const hasNotifications = numNotifications > 0;
            if (!hasNotifications) {
                return;
            }

            const isNotificationOmitted = isFocused;
            if (isNotificationOmitted) {
                this.clear();
                return;
            }

            var setting = storage.get('notification-setting') || 'message';
            if (setting === SETTINGS.OFF) {
                return;
            }

            window.drawAttention();

            var title;
            var message;
            var iconUrl;

            // NOTE: i18n has more complex rules for pluralization than just
            // distinguishing between zero (0) and other (non-zero),
            // e.g. Russian:
            // http://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html
            var newMessageCount = [
                numNotifications,
                numNotifications === 1 ? i18n('newMessage') : i18n('newMessages')
            ].join(' ');

            var last = this.last();
            switch (this.getSetting()) {
              case SETTINGS.COUNT:
                title = 'Signal';
                message = newMessageCount;
                break;
              case SETTINGS.NAME:
                title = newMessageCount;
                message = 'Most recent from ' + last.get('title');
                iconUrl = last.get('iconUrl');
                break;
              case SETTINGS.MESSAGE:
                if (numNotifications === 1) {
                  title = last.get('title');
                } else {
                  title = newMessageCount;
                }
                message = last.get('message');
                iconUrl = last.get('iconUrl');
                break;
            }

            var Notifications = Windows.UI.Notifications;
            var toastXml = Notifications.ToastNotificationManager.getTemplateContent(Notifications.ToastTemplateType.toastText02);
            var toastNodeList = toastXml.getElementsByTagName('text');
            toastNodeList[0].appendChild(toastXml.createTextNode(title));
            toastNodeList[1].appendChild(toastXml.createTextNode(message));
            shouldPlayNotificationSound && toastXml.createElement('audio').setAttribute('src', 'ms-winsoundevent:Notification.SMS');
            toastXml.selectSingleNode("/toast").setAttribute("launch", last.get('conversationId'));
            var toast = Notifications.ToastNotification(toastXml);
            Notifications.ToastNotificationManager.createToastNotifier().show(toast);
            window.setBadgeCount(this.length);

            // We don't want to notify the user about these same messages again
            this.clear();
        },
        getSetting: function() {
            return storage.get('notification-setting') || SETTINGS.MESSAGE;
        },
        onRemove: function() {
            console.log('remove notification');
        },
        clear: function() {
            console.log('remove all notifications');
            this.reset([]);
        },
        enable: function() {
            const needUpdate = !this.isEnabled;
            this.isEnabled = true;
            if (needUpdate) {
              this.update();
            }
        },
        disable: function() {
            this.isEnabled = false;
        },
    }))();
})();
