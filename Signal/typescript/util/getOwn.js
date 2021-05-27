require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = require("lodash");
    // We want this to work with any object, so we allow `object` here.
    // eslint-disable-next-line @typescript-eslint/ban-types
    function getOwn(obj, key) {
        return lodash_1.has(obj, key) ? obj[key] : undefined;
    }
    exports.getOwn = getOwn;
});