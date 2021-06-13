require(exports => {
    "use strict";
    // Copyright 2019-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    function makeLookup(items, key) {
        return (items || []).reduce((lookup, item) => {
            if (item && item[key]) {
                // The force cast is necessary if we want the keyof T above, and the flexibility
                //   to pass anything in. And of course we're modifying a parameter!
                // eslint-disable-next-line no-param-reassign
                lookup[String(item[key])] = item;
            }
            return lookup;
        }, {});
    }
    exports.makeLookup = makeLookup;
});