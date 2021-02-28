(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.shims = window.ts.shims || {};
    const exports = window.ts.shims.updateIpc = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const electron_1 = window.electron;
    function startUpdate() {
        electron_1.ipcRenderer.send('start-update');
    }
    exports.startUpdate = startUpdate;
    function ackRender() {
        electron_1.ipcRenderer.send('show-update-dialog-ack');
    }
    exports.ackRender = ackRender;
})();