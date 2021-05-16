require(exports => {
    "use strict";
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const Sound_1 = require("../util/Sound");
    const Settings_1 = require("../types/Settings");
    const OS = __importStar(require("../OS"));
    function filter(text) {
        return (text || '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    function notify({ icon, message, onNotificationClick, silent, title, }) {
        const audioNotificationSupport = Settings_1.getAudioNotificationSupport();
        const notification = new window.Notification(title, {
            body: OS.isLinux() ? filter(message) : message,
            icon,
            silent: silent || audioNotificationSupport !== Settings_1.AudioNotificationSupport.Native,
        });
        notification.onclick = onNotificationClick;
        if (!silent && audioNotificationSupport === Settings_1.AudioNotificationSupport.Custom) {
            // We kick off the sound to be played. No neet to await it.
            new Sound_1.Sound({ src: 'sounds/notification.ogg' }).play();
        }
        return notification;
    }
    exports.notify = notify;
});