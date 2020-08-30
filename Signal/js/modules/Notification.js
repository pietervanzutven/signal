﻿(function () {
    window.notifications = [];

    function Notification(title, options) {
        this.id = window.getGuid();
        this.onclick = () => { };
        this.click = () => {
            delete window.notifications[this.id];
            this.onclick();
        }

        const Notifications = Windows.UI.Notifications;
        const toastXml = Notifications.ToastNotificationManager.getTemplateContent(Notifications.ToastTemplateType.toastText02);
        const toastNodeList = toastXml.getElementsByTagName('text');
        toastNodeList[0].appendChild(toastXml.createTextNode(title));
        toastNodeList[1].appendChild(toastXml.createTextNode(options.body));
        if (!options.silent) {
            toastXml.createElement('audio').setAttribute('src', 'ms-winsoundevent:Notification.SMS');
        }
        toastXml.selectSingleNode("/toast").setAttribute("launch", this.id);
        const toast = Notifications.ToastNotification(toastXml);
        Notifications.ToastNotificationManager.createToastNotifier().show(toast);

        window.notifications[this.id] = this;
    }

    window.Notification = Notification;
})();