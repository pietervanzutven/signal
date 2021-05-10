require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = require("lodash");
    function makeLookup(items, key) {
        const pairs = lodash_1.map(items, item => [item[key], item]);
        return lodash_1.fromPairs(pairs);
    }
    exports.makeLookup = makeLookup;
});