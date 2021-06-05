require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const reselect_1 = require("reselect");
    const Calling_1 = require("../../types/Calling");
    const getOwn_1 = require("../../util/getOwn");
    const getCalling = (state) => state.calling;
    exports.getCallsByConversation = reselect_1.createSelector(getCalling, (state) => state.callsByConversation);
    exports.getCallSelector = reselect_1.createSelector(exports.getCallsByConversation, (callsByConversation) => (conversationId) => getOwn_1.getOwn(callsByConversation, conversationId));
    // In theory, there could be multiple incoming calls. In practice, neither RingRTC nor the
    //   UI are ready to handle this.
    exports.getIncomingCall = reselect_1.createSelector(exports.getCallsByConversation, (callsByConversation) => {
        const result = Object.values(callsByConversation).find(call => call.callMode === Calling_1.CallMode.Direct &&
            call.isIncoming &&
            call.callState === Calling_1.CallState.Ringing);
        // TypeScript needs a little help to be sure that this is a direct call.
        return (result === null || result === void 0 ? void 0 : result.callMode) === Calling_1.CallMode.Direct ? result : undefined;
    });
});