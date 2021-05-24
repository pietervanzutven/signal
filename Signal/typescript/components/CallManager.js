require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
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
    exports.CallManager = ({ acceptCall, activeCall, availableCameras, cancelCall, closeNeedPermissionScreen, declineCall, hangUp, i18n, incomingCall, me, renderDeviceSelection, setLocalAudio, setLocalPreview, setLocalVideo, setRendererCanvas, startCall, toggleParticipants, togglePip, toggleSettings, }) => {
        if (activeCall) {
            const { call, activeCallState, conversation } = activeCall;
            const { callState, callEndedReason } = call;
            const { joinedAt, hasLocalAudio, hasLocalVideo, settingsDialogOpen, pip, } = activeCallState;
            const ended = callState === Calling_1.CallState.Ended;
            if (ended) {
                if (callEndedReason === Calling_1.CallEndedReason.RemoteHangupNeedPermission) {
                    return (react_1.default.createElement(CallNeedPermissionScreen_1.CallNeedPermissionScreen, { close: closeNeedPermissionScreen, conversation: conversation, i18n: i18n }));
                }
            }
            if (!callState) {
                return (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement(CallingLobby_1.CallingLobby, {
                        availableCameras: availableCameras, conversation: conversation, hasLocalAudio: hasLocalAudio, hasLocalVideo: hasLocalVideo, i18n: i18n, isGroupCall: false, onCallCanceled: cancelCall, onJoinCall: () => {
                            startCall({
                                conversationId: conversation.id,
                                hasLocalAudio,
                                hasLocalVideo,
                            });
                        }, setLocalPreview: setLocalPreview, setLocalAudio: setLocalAudio, setLocalVideo: setLocalVideo, toggleParticipants: toggleParticipants, toggleSettings: toggleSettings
                    }),
                    settingsDialogOpen && renderDeviceSelection()));
            }
            const hasRemoteVideo = Boolean(call.hasRemoteVideo);
            if (pip) {
                return (react_1.default.createElement(CallingPip_1.CallingPip, { conversation: conversation, hangUp: hangUp, hasLocalVideo: hasLocalVideo, hasRemoteVideo: hasRemoteVideo, i18n: i18n, setLocalPreview: setLocalPreview, setRendererCanvas: setRendererCanvas, togglePip: togglePip }));
            }
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(CallScreen_1.CallScreen, { conversation: conversation, callState: callState, hangUp: hangUp, hasLocalAudio: hasLocalAudio, hasLocalVideo: hasLocalVideo, i18n: i18n, joinedAt: joinedAt, me: me, hasRemoteVideo: hasRemoteVideo, setLocalPreview: setLocalPreview, setRendererCanvas: setRendererCanvas, setLocalAudio: setLocalAudio, setLocalVideo: setLocalVideo, togglePip: togglePip, toggleSettings: toggleSettings }),
                settingsDialogOpen && renderDeviceSelection()));
        }
        // In the future, we may want to show the incoming call bar when a call is active.
        if (incomingCall) {
            return (react_1.default.createElement(IncomingCallBar_1.IncomingCallBar, { acceptCall: acceptCall, declineCall: declineCall, i18n: i18n, call: incomingCall.call, conversation: incomingCall.conversation }));
        }
        return null;
    };
});