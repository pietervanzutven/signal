(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.services = window.ts.services || {};
    const exports = window.ts.services.updateListener = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const electron_1 = window.electron;
    const Dialogs_1 = window.ts.types.Dialogs;
    function initializeUpdateListener(updatesActions, events) {
        electron_1.ipcRenderer.on('show-update-dialog', (_, dialogType) => {
            updatesActions.showUpdateDialog(dialogType);
        });
        events.once('snooze-update', () => {
            updatesActions.showUpdateDialog(Dialogs_1.Dialogs.Update);
        });
    }
    exports.initializeUpdateListener = initializeUpdateListener;
})();