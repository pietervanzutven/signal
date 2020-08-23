(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.util = window.ts.util || {};
    const exports = window.ts.util.GoogleChrome = {}

    Object.defineProperty(exports, "__esModule", { value: true });
    // See: https://en.wikipedia.org/wiki/Comparison_of_web_browsers#Image_format_support
    const SUPPORTED_IMAGE_MIME_TYPES = {
        'image/bmp': true,
        'image/gif': true,
        'image/jpeg': true,
        'image/svg+xml': true,
        'image/webp': true,
        'image/x-xbitmap': true,
        // ICO
        'image/vnd.microsoft.icon': true,
        'image/ico': true,
        'image/icon': true,
        'image/x-icon': true,
        // PNG
        'image/apng': true,
        'image/png': true,
    };
    exports.isImageTypeSupported = (mimeType) => SUPPORTED_IMAGE_MIME_TYPES[mimeType] === true;
    const SUPPORTED_VIDEO_MIME_TYPES = {
        'video/mp4': true,
        'video/ogg': true,
        'video/webm': true,
    };
    // See: https://www.chromium.org/audio-video
    exports.isVideoTypeSupported = (mimeType) => SUPPORTED_VIDEO_MIME_TYPES[mimeType] === true;
})();