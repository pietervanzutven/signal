(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.types = window.ts.types || {};
    const exports = window.ts.types.Dialogs = {};

    /* eslint-disable camelcase */
    Object.defineProperty(exports, "__esModule", { value: true });
    var Dialogs;
    (function (Dialogs) {
        Dialogs[Dialogs["None"] = 0] = "None";
        Dialogs[Dialogs["Update"] = 1] = "Update";
        Dialogs[Dialogs["Cannot_Update"] = 2] = "Cannot_Update";
        Dialogs[Dialogs["MacOS_Read_Only"] = 3] = "MacOS_Read_Only";
    })(Dialogs = exports.Dialogs || (exports.Dialogs = {}));
})();