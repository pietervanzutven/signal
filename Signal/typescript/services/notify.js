require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function filter(text) {
        return (text || '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    function notify({ platform, icon, message, onNotificationClick, silent, title, }) {
        const notification = new window.Notification(title, {
            body: platform === 'linux' ? filter(message) : message,
            icon,
            silent,
        });
        notification.onclick = onNotificationClick;
        return notification;
    }
    exports.notify = notify;
});