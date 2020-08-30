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
    const OS = __importStar(window.ts.OS);
    const MIN_WINDOWS_VERSION = '8.0.0';
    exports.isAudioNotificationSupported = () => OS.isWindows(MIN_WINDOWS_VERSION) || OS.isMacOS();
})();