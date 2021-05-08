(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.notifications = window.ts.notifications || {};
    const exports = window.ts.notifications;

    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getStatus = ({ isAppFocused, isAudioNotificationEnabled, isAudioNotificationSupported, isEnabled, hasNotifications, userSetting, }) => {
        const type = (() => {
            if (!isEnabled) {
                return 'disabled';
            }
            if (!hasNotifications) {
                return 'noNotifications';
            }
            if (isAppFocused) {
                return 'appIsFocused';
            }
            if (userSetting === 'off') {
                return 'userSetting';
            }
            return 'ok';
        })();
        const shouldPlayNotificationSound = isAudioNotificationSupported && isAudioNotificationEnabled;
        const shouldShowNotifications = type === 'ok';
        const shouldClearNotifications = type === 'appIsFocused';
        return {
            shouldClearNotifications,
            shouldPlayNotificationSound,
            shouldShowNotifications,
            type,
        };
    };
})();