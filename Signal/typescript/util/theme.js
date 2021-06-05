require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const missingCaseError_1 = require("./missingCaseError");
    var Theme;
    (function (Theme) {
        Theme[Theme["Light"] = 0] = "Light";
        Theme[Theme["Dark"] = 1] = "Dark";
    })(Theme = exports.Theme || (exports.Theme = {}));
    function themeClassName(theme) {
        switch (theme) {
            case Theme.Light:
                return 'light-theme';
            case Theme.Dark:
                return 'dark-theme';
            default:
                throw missingCaseError_1.missingCaseError(theme);
        }
    }
    exports.themeClassName = themeClassName;
});