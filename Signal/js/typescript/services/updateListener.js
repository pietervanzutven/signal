(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.services = window.ts.services || {};
    const exports = window.ts.services.updateListener = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const electron_1 = window.electron;
    function initializeUpdateListener(updatesActions) {
        electron_1.ipcRenderer.on('show-update-dialog', (_, dialogType) => {
            updatesActions.showUpdateDialog(dialogType);
        });
    }
    exports.initializeUpdateListener = initializeUpdateListener;
})();