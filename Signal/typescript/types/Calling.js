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
    // Must be kept in sync with RingRTC.CallEndedReason
    var CallEndedReason;
    (function (CallEndedReason) {
        CallEndedReason["LocalHangup"] = "LocalHangup";
        CallEndedReason["RemoteHangup"] = "RemoteHangup";
        CallEndedReason["RemoteHangupNeedPermission"] = "RemoteHangupNeedPermission";
        CallEndedReason["Declined"] = "Declined";
        CallEndedReason["Busy"] = "Busy";
        CallEndedReason["Glare"] = "Glare";
        CallEndedReason["ReceivedOfferExpired"] = "ReceivedOfferExpired";
        CallEndedReason["ReceivedOfferWhileActive"] = "ReceivedOfferWhileActive";
        CallEndedReason["ReceivedOfferWithGlare"] = "ReceivedOfferWithGlare";
        CallEndedReason["SignalingFailure"] = "SignalingFailure";
        CallEndedReason["ConnectionFailure"] = "ConnectionFailure";
        CallEndedReason["InternalFailure"] = "InternalFailure";
        CallEndedReason["Timeout"] = "Timeout";
        CallEndedReason["AcceptedOnAnotherDevice"] = "AcceptedOnAnotherDevice";
        CallEndedReason["DeclinedOnAnotherDevice"] = "DeclinedOnAnotherDevice";
        CallEndedReason["BusyOnAnotherDevice"] = "BusyOnAnotherDevice";
        CallEndedReason["CallerIsNotMultiring"] = "CallerIsNotMultiring";
    })(CallEndedReason = exports.CallEndedReason || (exports.CallEndedReason = {}));
    var CallingDeviceType;
    (function (CallingDeviceType) {
        CallingDeviceType[CallingDeviceType["CAMERA"] = 0] = "CAMERA";
        CallingDeviceType[CallingDeviceType["MICROPHONE"] = 1] = "MICROPHONE";
        CallingDeviceType[CallingDeviceType["SPEAKER"] = 2] = "SPEAKER";
    })(CallingDeviceType = exports.CallingDeviceType || (exports.CallingDeviceType = {}));
});