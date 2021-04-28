(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.shims = window.ts.shims || {};
    const exports = window.ts.shims.storage = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    function put(key, value) {
        window.storage.put(key, value);
    }
    exports.put = put;
    async function remove(key) {
        await window.storage.remove(key);
    }
    exports.remove = remove;
})();