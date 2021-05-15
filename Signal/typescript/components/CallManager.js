require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const CallingPip_1 = require("./CallingPip");
    const CallNeedPermissionScreen_1 = require("./CallNeedPermissionScreen");
    const CallingLobby_1 = require("./CallingLobby");
    const CallScreen_1 = require("./CallScreen");
    const IncomingCallBar_1 = require("./IncomingCallBar");
    const Calling_1 = require("../types/Calling");
    exports.CallManager = ({ acceptCall, callDetails, callState, callEndedReason, cancelCall, closeNeedPermissionScreen, declineCall, hangUp, hasLocalAudio, hasLocalVideo, hasRemoteVideo, i18n, pip, renderDeviceSelection, setLocalAudio, setLocalPreview, setLocalVideo, setRendererCanvas, settingsDialogOpen, startCall, toggleParticipants, togglePip, toggleSettings, }) => {
        if (!callDetails) {
            return null;
        }
        const incoming = callDetails.isIncoming;
        const outgoing = !incoming;
        const ongoing = callState === Calling_1.CallState.Accepted || callState === Calling_1.CallState.Reconnecting;
        const ringing = callState === Calling_1.CallState.Ringing;
        const ended = callState === Calling_1.CallState.Ended;
        if (ended) {
            if (callEndedReason === Calling_1.CallEndedReason.RemoteHangupNeedPermission) {
                return (react_1.default.createElement(CallNeedPermissionScreen_1.CallNeedPermissionScreen, { close: closeNeedPermissionScreen, callDetails: callDetails, i18n: i18n }));
            }
            return null;
        }
        if (!callState) {
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(CallingLobby_1.CallingLobby, {
                    callDetails: callDetails, callState: callState, hasLocalAudio: hasLocalAudio, hasLocalVideo: hasLocalVideo, i18n: i18n, isGroupCall: false, onCallCanceled: cancelCall, onJoinCall: () => {
                        startCall({ callDetails });
                    }, setLocalPreview: setLocalPreview, setLocalAudio: setLocalAudio, setLocalVideo: setLocalVideo, toggleParticipants: toggleParticipants, toggleSettings: toggleSettings
                }),
                settingsDialogOpen && renderDeviceSelection()));
        }
        if (outgoing || ongoing) {
            if (pip) {
                return (react_1.default.createElement(CallingPip_1.CallingPip, { callDetails: callDetails, hangUp: hangUp, hasLocalVideo: hasLocalVideo, hasRemoteVideo: hasRemoteVideo, i18n: i18n, setLocalPreview: setLocalPreview, setRendererCanvas: setRendererCanvas, togglePip: togglePip }));
            }
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(CallScreen_1.CallScreen, { callDetails: callDetails, callState: callState, hangUp: hangUp, hasLocalAudio: hasLocalAudio, hasLocalVideo: hasLocalVideo, i18n: i18n, hasRemoteVideo: hasRemoteVideo, setLocalPreview: setLocalPreview, setRendererCanvas: setRendererCanvas, setLocalAudio: setLocalAudio, setLocalVideo: setLocalVideo, togglePip: togglePip, toggleSettings: toggleSettings }),
                settingsDialogOpen && renderDeviceSelection()));
        }
        if (incoming && ringing) {
            return (react_1.default.createElement(IncomingCallBar_1.IncomingCallBar, { acceptCall: acceptCall, callDetails: callDetails, declineCall: declineCall, i18n: i18n }));
        }
        // Incoming && Prering
        return null;
    };
});