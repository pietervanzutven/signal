require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    // These are strings (1) for the database (2) for Storybook.
    var CallMode;
    (function (CallMode) {
        CallMode["None"] = "None";
        CallMode["Direct"] = "Direct";
        CallMode["Group"] = "Group";
    })(CallMode = exports.CallMode || (exports.CallMode = {}));
    // Ideally, we would import many of these directly from RingRTC. But because Storybook
    //   cannot import RingRTC (as it runs in the browser), we have these copies. That also
    //   means we have to convert the "real" enum to our enum in some cases.
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
    // Must be kept in sync with RingRTC's ConnectionState
    var GroupCallConnectionState;
    (function (GroupCallConnectionState) {
        GroupCallConnectionState[GroupCallConnectionState["NotConnected"] = 0] = "NotConnected";
        GroupCallConnectionState[GroupCallConnectionState["Connecting"] = 1] = "Connecting";
        GroupCallConnectionState[GroupCallConnectionState["Connected"] = 2] = "Connected";
        GroupCallConnectionState[GroupCallConnectionState["Reconnecting"] = 3] = "Reconnecting";
    })(GroupCallConnectionState = exports.GroupCallConnectionState || (exports.GroupCallConnectionState = {}));
    // Must be kept in sync with RingRTC's JoinState
    var GroupCallJoinState;
    (function (GroupCallJoinState) {
        GroupCallJoinState[GroupCallJoinState["NotJoined"] = 0] = "NotJoined";
        GroupCallJoinState[GroupCallJoinState["Joining"] = 1] = "Joining";
        GroupCallJoinState[GroupCallJoinState["Joined"] = 2] = "Joined";
    })(GroupCallJoinState = exports.GroupCallJoinState || (exports.GroupCallJoinState = {}));
    var CallingDeviceType;
    (function (CallingDeviceType) {
        CallingDeviceType[CallingDeviceType["CAMERA"] = 0] = "CAMERA";
        CallingDeviceType[CallingDeviceType["MICROPHONE"] = 1] = "MICROPHONE";
        CallingDeviceType[CallingDeviceType["SPEAKER"] = 2] = "SPEAKER";
    })(CallingDeviceType = exports.CallingDeviceType || (exports.CallingDeviceType = {}));
});