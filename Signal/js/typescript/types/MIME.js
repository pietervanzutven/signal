(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.types = window.ts.types || {};
    const exports = window.ts.types.MIME = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isJPEG = (value) => value === 'image/jpeg';
    exports.isImage = (value) => value.startsWith('image/');
    exports.isVideo = (value) => value.startsWith('video/');
    exports.isAudio = (value) => value.startsWith('audio/');
})();