(function () {
    'use strict';

    window.types = window.types || {};
    const exports = window.types.settings = {}

    const OS = window.os;

    exports.isAudioNotificationSupported = () => !OS.isLinux();

})();