require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const electron_1 = require("electron");
    let bounceId = -1;
    function init(win) {
        electron_1.ipcMain.on('bounce-app-icon-start', (_, isCritical = false) => {
            if (electron_1.app.dock) {
                const type = isCritical ? 'critical' : 'informational';
                bounceId = electron_1.app.dock.bounce(type);
                if (bounceId < 0) {
                    return;
                }
            }
            else if (win && win.flashFrame) {
                win.once('focus', () => {
                    win.flashFrame(false);
                });
                win.flashFrame(true);
            }
        });
        electron_1.ipcMain.on('bounce-app-icon-stop', () => {
            if (electron_1.app.dock) {
                if (bounceId < 0) {
                    return;
                }
                electron_1.app.dock.cancelBounce(bounceId);
                bounceId = -1;
            }
            else if (win && win.flashFrame) {
                win.flashFrame(false);
            }
        });
    }
    exports.init = init;
});