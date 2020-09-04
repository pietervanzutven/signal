(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.types = window.ts.types || {};
    const exports = window.ts.types.MIME = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    exports.APPLICATION_OCTET_STREAM = 'application/octet-stream';
    exports.AUDIO_AAC = 'audio/aac';
    exports.AUDIO_MP3 = 'audio/mp3';
    exports.IMAGE_GIF = 'image/gif';
    exports.IMAGE_JPEG = 'image/jpeg';
    exports.VIDEO_QUICKTIME = 'video/quicktime';
    exports.isJPEG = (value) => value === 'image/jpeg';
    exports.isImage = (value) => value.startsWith('image/');
    exports.isVideo = (value) => value.startsWith('video/');
    exports.isAudio = (value) => value.startsWith('audio/');
})();