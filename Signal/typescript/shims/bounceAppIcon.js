require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const electron_1 = require("electron");
    function bounceAppIconStart(isCritical = false) {
        electron_1.ipcRenderer.send('bounce-app-icon-start', isCritical);
    }
    exports.bounceAppIconStart = bounceAppIconStart;
    function bounceAppIconStop() {
        electron_1.ipcRenderer.send('bounce-app-icon-stop');
    }
    exports.bounceAppIconStop = bounceAppIconStop;
});