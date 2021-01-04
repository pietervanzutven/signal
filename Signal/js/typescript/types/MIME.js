(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.types = window.ts.types || {};
    const exports = window.ts.types.MIME = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    exports.APPLICATION_OCTET_STREAM = 'application/octet-stream';
    exports.APPLICATION_JSON = 'application/json';
    exports.AUDIO_AAC = 'audio/aac';
    exports.AUDIO_MP3 = 'audio/mp3';
    exports.IMAGE_GIF = 'image/gif';
    exports.IMAGE_JPEG = 'image/jpeg';
    exports.IMAGE_WEBP = 'image/webp';
    exports.VIDEO_MP4 = 'video/mp4';
    exports.VIDEO_QUICKTIME = 'video/quicktime';
    exports.LONG_MESSAGE = 'text/x-signal-plain';
    exports.isJPEG = (value) => value === 'image/jpeg';
    exports.isImage = (value) => value && value.startsWith('image/');
    exports.isVideo = (value) => value && value.startsWith('video/');
    exports.isAudio = (value) => value && value.startsWith('audio/');
})();