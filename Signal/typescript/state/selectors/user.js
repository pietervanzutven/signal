require(exports => {
    "use strict";
    // Copyright 2019-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const reselect_1 = require("reselect");
    exports.getUser = (state) => state.user;
    exports.getUserNumber = reselect_1.createSelector(exports.getUser, (state) => state.ourNumber);
    exports.getRegionCode = reselect_1.createSelector(exports.getUser, (state) => state.regionCode);
    exports.getUserConversationId = reselect_1.createSelector(exports.getUser, (state) => state.ourConversationId);
    exports.getUserUuid = reselect_1.createSelector(exports.getUser, (state) => state.ourUuid);
    exports.getIntl = reselect_1.createSelector(exports.getUser, (state) => state.i18n);
    exports.getInteractionMode = reselect_1.createSelector(exports.getUser, (state) => state.interactionMode);
    exports.getAttachmentsPath = reselect_1.createSelector(exports.getUser, (state) => state.attachmentsPath);
    exports.getStickersPath = reselect_1.createSelector(exports.getUser, (state) => state.stickersPath);
    exports.getPlatform = reselect_1.createSelector(exports.getUser, (state) => state.platform);
    exports.getTempPath = reselect_1.createSelector(exports.getUser, (state) => state.tempPath);
});