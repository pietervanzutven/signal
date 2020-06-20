(function () {
    window.types = window.types || {};
    window.types.mime = {
        isJPEG: mimeType =>
            mimeType === 'image/jpeg'
    };
})()