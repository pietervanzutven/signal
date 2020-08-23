(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.types = window.ts.types || {};
    const exports = window.ts.types.Attachment = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @prettier
     */
    const is_1 = __importDefault(window.sindresorhus.is);
    const GoogleChrome = __importStar(window.ts.util.GoogleChrome);
    exports.isVisualMedia = (attachment) => {
        const { contentType } = attachment;
        if (is_1.default.undefined(contentType)) {
            return false;
        }
        const isSupportedImageType = GoogleChrome.isImageTypeSupported(contentType);
        const isSupportedVideoType = GoogleChrome.isVideoTypeSupported(contentType);
        return isSupportedImageType || isSupportedVideoType;
    };
})();