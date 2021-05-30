require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const reselect_1 = require("reselect");
    const Calling_1 = require("../../types/Calling");
    const getCallsByConversation = (state) => state.callsByConversation;
    // In theory, there could be multiple incoming calls. In practice, neither RingRTC nor the
    //   UI are ready to handle this.
    exports.getIncomingCall = reselect_1.createSelector(getCallsByConversation, (callsByConversation) => {
        var _a;
        const result = Object.values(callsByConversation).find(call => call.callMode === Calling_1.CallMode.Direct &&
            call.isIncoming &&
            call.callState === Calling_1.CallState.Ringing);
        // TypeScript needs a little help to be sure that this is a direct call.
        return ((_a = result) === null || _a === void 0 ? void 0 : _a.callMode) === Calling_1.CallMode.Direct ? result : undefined;
    });
});