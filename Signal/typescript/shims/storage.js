(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.shims = window.ts.shims || {};
    const exports = window.ts.shims.storage = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    // Matching window.storage.put API
    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    function put(key, value) {
        window.storage.put(key, value);
    }
    exports.put = put;
    async function remove(key) {
        await window.storage.remove(key);
    }
    exports.remove = remove;
})();