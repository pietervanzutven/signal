require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const CallScreen_1 = require("./CallScreen");
    const IncomingCallBar_1 = require("./IncomingCallBar");
    const Calling_1 = require("../types/Calling");
    exports.CallManager = ({ acceptCall, callDetails, callState, declineCall, getVideoCapturer, getVideoRenderer, hangUp, hasLocalAudio, hasLocalVideo, hasRemoteVideo, i18n, setLocalAudio, setLocalVideo, setVideoCapturer, setVideoRenderer, }) => {
        if (!callDetails || !callState) {
            return null;
        }
        const incoming = callDetails.isIncoming;
        const outgoing = !incoming;
        const ongoing = callState === Calling_1.CallState.Accepted || callState === Calling_1.CallState.Reconnecting;
        const ringing = callState === Calling_1.CallState.Ringing;
        if (outgoing || ongoing) {
            return (react_1.default.createElement(CallScreen_1.CallScreen, { callDetails: callDetails, callState: callState, getVideoCapturer: getVideoCapturer, getVideoRenderer: getVideoRenderer, hangUp: hangUp, hasLocalAudio: hasLocalAudio, hasLocalVideo: hasLocalVideo, i18n: i18n, hasRemoteVideo: hasRemoteVideo, setVideoCapturer: setVideoCapturer, setVideoRenderer: setVideoRenderer, setLocalAudio: setLocalAudio, setLocalVideo: setLocalVideo }));
        }
        if (incoming && ringing) {
            return (react_1.default.createElement(IncomingCallBar_1.IncomingCallBar, { acceptCall: acceptCall, callDetails: callDetails, declineCall: declineCall, i18n: i18n }));
        }
        // Ended || (Incoming && Prering)
        return null;
    };
});