(function () {
    const OS = window.os;

    window.types = window.types || {};
    window.types.settings = {
        shouldShowAudioNotificationSetting: () =>
            !OS.isLinux()
    }
})();