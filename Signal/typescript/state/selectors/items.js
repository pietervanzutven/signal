require(exports => {
    "use strict";
    // Copyright 2019-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const reselect_1 = require("reselect");
    exports.getItems = (state) => state.items;
    exports.getUserAgent = reselect_1.createSelector(exports.getItems, (state) => state.userAgent);
    exports.getPinnedConversationIds = reselect_1.createSelector(exports.getItems, (state) => (state.pinnedConversationIds || []));
});