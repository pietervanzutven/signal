require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // This must be kept in sync with RingRTC.CallState.
    var CallState;
    (function (CallState) {
        CallState["Prering"] = "init";
        CallState["Ringing"] = "ringing";
        CallState["Accepted"] = "connected";
        CallState["Reconnecting"] = "connecting";
        CallState["Ended"] = "ended";
    })(CallState = exports.CallState || (exports.CallState = {}));
});