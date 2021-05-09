(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.types = window.ts.types || {};
    const exports = window.ts.types.Settings = {};

    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const OS = __importStar(require("../OS"));
    const MIN_WINDOWS_VERSION = '8.0.0';
    var AudioNotificationSupport;
    (function (AudioNotificationSupport) {
        AudioNotificationSupport[AudioNotificationSupport["None"] = 0] = "None";
        AudioNotificationSupport[AudioNotificationSupport["Native"] = 1] = "Native";
        AudioNotificationSupport[AudioNotificationSupport["Custom"] = 2] = "Custom";
    })(AudioNotificationSupport = exports.AudioNotificationSupport || (exports.AudioNotificationSupport = {}));
    function getAudioNotificationSupport() {
        if (OS.isWindows(MIN_WINDOWS_VERSION) || OS.isMacOS()) {
            return AudioNotificationSupport.Native;
        }
        else if (OS.isLinux()) {
            return AudioNotificationSupport.Custom;
        }
        return AudioNotificationSupport.None;
    }
    exports.getAudioNotificationSupport = getAudioNotificationSupport;
    exports.isAudioNotificationSupported = () => getAudioNotificationSupport() !== AudioNotificationSupport.None;
    // Using `Notification::tag` has a bug on Windows 7:
    // https://github.com/electron/electron/issues/11189
    exports.isNotificationGroupingSupported = () => !OS.isWindows() || OS.isWindows(MIN_WINDOWS_VERSION);
    // the "hide menu bar" option is specific to Windows and Linux
    exports.isHideMenuBarSupported = () => !OS.isMacOS();
    // the "draw attention on notification" option is specific to Windows and Linux
    exports.isDrawAttentionSupported = () => !OS.isMacOS();
})();