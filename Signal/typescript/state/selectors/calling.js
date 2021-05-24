require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const reselect_1 = require("reselect");
    const Calling_1 = require("../../types/Calling");
    const getOwn_1 = require("../../util/getOwn");
    const getActiveCallState = (state) => state.activeCallState;
    const getCallsByConversation = (state) => state.callsByConversation;
    // In theory, there could be multiple incoming calls. In practice, neither RingRTC nor the
    //   UI are ready to handle this.
    exports.getIncomingCall = reselect_1.createSelector(getCallsByConversation, callsByConversation => Object.values(callsByConversation).find(call => call.isIncoming && call.callState === Calling_1.CallState.Ringing));
    exports.getActiveCall = reselect_1.createSelector(getActiveCallState, getCallsByConversation, (activeCallState, callsByConversation) => activeCallState &&
        getOwn_1.getOwn(callsByConversation, activeCallState.conversationId));
    exports.isCallActive = reselect_1.createSelector(exports.getActiveCall, Boolean);
});