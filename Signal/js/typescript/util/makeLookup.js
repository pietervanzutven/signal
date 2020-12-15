function require_ts_util_makeLookup() {
    "use strict";

    const exports = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = window.lodash;
    function makeLookup(items, key) {
        // Yep, we can't index into item without knowing what it is. True. But we want to.
        // @ts-ignore
        const pairs = lodash_1.map(items, item => [item[key], item]);
        return lodash_1.fromPairs(pairs);
    }
    exports.makeLookup = makeLookup;

    return exports;
}