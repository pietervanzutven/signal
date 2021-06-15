require(exports => {
    "use strict";
    // Copyright 2018-2021 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hide = exports.show = void 0;
    const electron_1 = require("electron");
    function show() {
        if (process.platform === 'darwin') {
            electron_1.app.dock.show();
        }
    }
    exports.show = show;
    function hide() {
        if (process.platform === 'darwin') {
            electron_1.app.dock.hide();
        }
    }
    exports.hide = hide;
});