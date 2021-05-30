require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importStar(require("react"));
    const CallingPip_1 = require("./CallingPip");
    const CallNeedPermissionScreen_1 = require("./CallNeedPermissionScreen");
    const CallingLobby_1 = require("./CallingLobby");
    const CallScreen_1 = require("./CallScreen");
    const IncomingCallBar_1 = require("./IncomingCallBar");
    const Calling_1 = require("../types/Calling");
    const missingCaseError_1 = require("../util/missingCaseError");
    const ActiveCallManager = ({ activeCall, availableCameras, cancelCall, closeNeedPermissionScreen, createCanvasVideoRenderer, hangUp, i18n, getGroupCallVideoFrameSource, me, renderDeviceSelection, setLocalAudio, setLocalPreview, setLocalVideo, setRendererCanvas, startCall, toggleParticipants, togglePip, toggleSettings, }) => {
        const { call, activeCallState, conversation } = activeCall;
        const { joinedAt, hasLocalAudio, hasLocalVideo, settingsDialogOpen, pip, } = activeCallState;
        const cancelActiveCall = react_1.useCallback(() => {
            cancelCall({ conversationId: conversation.id });
        }, [cancelCall, conversation.id]);
        const joinActiveCall = react_1.useCallback(() => {
            startCall({
                callMode: call.callMode,
                conversationId: conversation.id,
                hasLocalAudio,
                hasLocalVideo,
            });
        }, [startCall, call.callMode, conversation.id, hasLocalAudio, hasLocalVideo]);
        const getGroupCallVideoFrameSourceForActiveCall = react_1.useCallback((demuxId) => {
            return getGroupCallVideoFrameSource(conversation.id, demuxId);
        }, [getGroupCallVideoFrameSource, conversation.id]);
        let showCallLobby;
        switch (call.callMode) {
            case Calling_1.CallMode.Direct: {
                const { callState, callEndedReason } = call;
                const ended = callState === Calling_1.CallState.Ended;
                if (ended &&
                    callEndedReason === Calling_1.CallEndedReason.RemoteHangupNeedPermission) {
                    return (react_1.default.createElement(CallNeedPermissionScreen_1.CallNeedPermissionScreen, { close: closeNeedPermissionScreen, conversation: conversation, i18n: i18n }));
                }
                showCallLobby = !callState;
                break;
            }
            case Calling_1.CallMode.Group: {
                showCallLobby = call.joinState === Calling_1.GroupCallJoinState.NotJoined;
                break;
            }
            default:
                throw missingCaseError_1.missingCaseError(call);
        }
        if (showCallLobby) {
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(CallingLobby_1.CallingLobby, {
                    availableCameras: availableCameras, conversation: conversation, hasLocalAudio: hasLocalAudio, hasLocalVideo: hasLocalVideo, i18n: i18n,
                    // TODO: Set this to `true` for group calls. We can get away with this for
                    //   now because it only affects rendering. See DESKTOP-888 and DESKTOP-889.
                    isGroupCall: false, me: me, onCallCanceled: cancelActiveCall, onJoinCall: joinActiveCall, setLocalPreview: setLocalPreview, setLocalAudio: setLocalAudio, setLocalVideo: setLocalVideo, toggleParticipants: toggleParticipants, toggleSettings: toggleSettings
                }),
                settingsDialogOpen && renderDeviceSelection()));
        }
        // TODO: Group calls should also support the PiP. See DESKTOP-886.
        if (pip && call.callMode === Calling_1.CallMode.Direct) {
            const hasRemoteVideo = Boolean(call.hasRemoteVideo);
            return (react_1.default.createElement(CallingPip_1.CallingPip, { conversation: conversation, hangUp: hangUp, hasLocalVideo: hasLocalVideo, hasRemoteVideo: hasRemoteVideo, i18n: i18n, setLocalPreview: setLocalPreview, setRendererCanvas: setRendererCanvas, togglePip: togglePip }));
        }
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(CallScreen_1.CallScreen, { call: call, conversation: conversation, createCanvasVideoRenderer: createCanvasVideoRenderer, getGroupCallVideoFrameSource: getGroupCallVideoFrameSourceForActiveCall, hangUp: hangUp, hasLocalAudio: hasLocalAudio, hasLocalVideo: hasLocalVideo, i18n: i18n, joinedAt: joinedAt, me: me, setLocalPreview: setLocalPreview, setRendererCanvas: setRendererCanvas, setLocalAudio: setLocalAudio, setLocalVideo: setLocalVideo, togglePip: togglePip, toggleSettings: toggleSettings }),
            settingsDialogOpen && renderDeviceSelection()));
    };
    exports.CallManager = props => {
        const { activeCall, incomingCall, acceptCall, declineCall, i18n } = props;
        if (activeCall) {
            // `props` should logically have an `activeCall` at this point, but TypeScript can't
            //   figure that out, so we pass it in again.
            return react_1.default.createElement(ActiveCallManager, Object.assign({}, props, { activeCall: activeCall }));
        }
        // In the future, we may want to show the incoming call bar when a call is active.
        if (incomingCall) {
            return (react_1.default.createElement(IncomingCallBar_1.IncomingCallBar, { acceptCall: acceptCall, declineCall: declineCall, i18n: i18n, call: incomingCall.call, conversation: incomingCall.conversation }));
        }
        return null;
    };
});