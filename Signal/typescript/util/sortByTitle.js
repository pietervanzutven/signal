require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    function sortByTitle(arr) {
        return [...arr].sort((a, b) => a.title.localeCompare(b.title));
    }
    exports.sortByTitle = sortByTitle;
});