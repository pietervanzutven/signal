(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components._util = {};

    // A separate file so this doesn't get picked up by StyleGuidist over real components
    Object.defineProperty(exports, "__esModule", { value: true });
    function cleanId(id) {
        return id.replace(/[^\u0020-\u007e\u00a0-\u00ff]/g, '_');
    }
    exports.cleanId = cleanId;
})();