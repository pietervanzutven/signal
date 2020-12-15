(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.util = window.ts.util || {};
    const exports = window.ts.util.timer = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = window.lodash;
    function getIncrement(length) {
        if (length < 0) {
            return 1000;
        }
        return Math.ceil(length / 12);
    }
    exports.getIncrement = getIncrement;
    function getTimerBucket(expiration, length) {
        const delta = expiration - Date.now();
        if (delta < 0) {
            return '00';
        }
        if (delta > length) {
            return '60';
        }
        const bucket = Math.round(delta / length * 12);
        return lodash_1.padStart(String(bucket * 5), 2, '0');
    }
    exports.getTimerBucket = getTimerBucket;
})();