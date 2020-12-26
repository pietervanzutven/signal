(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.shims = window.ts.shims || {};
    const exports = window.ts.shims.storage = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    async function put(key, value) {
        // @ts-ignore
        return window.storage.put(key, value);
    }
    exports.put = put;
    async function remove(key) {
        // @ts-ignore
        return window.storage.remove(key);
    }
    exports.remove = remove;
})();