require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Must be kept in sync with RingRTC.CallState
    var CallState;
    (function (CallState) {
        CallState["Prering"] = "init";
        CallState["Ringing"] = "ringing";
        CallState["Accepted"] = "connected";
        CallState["Reconnecting"] = "connecting";
        CallState["Ended"] = "ended";
    })(CallState = exports.CallState || (exports.CallState = {}));
    var CallingDeviceType;
    (function (CallingDeviceType) {
        CallingDeviceType[CallingDeviceType["CAMERA"] = 0] = "CAMERA";
        CallingDeviceType[CallingDeviceType["MICROPHONE"] = 1] = "MICROPHONE";
        CallingDeviceType[CallingDeviceType["SPEAKER"] = 2] = "SPEAKER";
    })(CallingDeviceType = exports.CallingDeviceType || (exports.CallingDeviceType = {}));
});