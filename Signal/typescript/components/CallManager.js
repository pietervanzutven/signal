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
    const CallNeedPermissionScreen_1 = require("./CallNeedPermissionScreen");
    const CallScreen_1 = require("./CallScreen");
    const CallingLobby_1 = require("./CallingLobby");
    const CallingParticipantsList_1 = require("./CallingParticipantsList");
    const CallingPip_1 = require("./CallingPip");
    const IncomingCallBar_1 = require("./IncomingCallBar");
    const Calling_1 = require("../types/Calling");
    const missingCaseError_1 = require("../util/missingCaseError");
    const ActiveCallManager = ({ activeCall, availableCameras, cancelCall, closeNeedPermissionScreen, createCanvasVideoRenderer, hangUp, i18n, getGroupCallVideoFrameSource, me, renderDeviceSelection, setLocalAudio, setLocalPreview, setLocalVideo, setRendererCanvas, startCall, toggleParticipants, togglePip, toggleSettings, }) => {
        const { call, activeCallState, conversation, groupCallParticipants, } = activeCall;
        const { hasLocalAudio, hasLocalVideo, joinedAt, pip, settingsDialogOpen, showParticipantsList, } = activeCallState;
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
            const participantNames = groupCallParticipants.map(participant => participant.isSelf
                ? i18n('you')
                : participant.firstName || participant.title);
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(CallingLobby_1.CallingLobby, { availableCameras: availableCameras, conversation: conversation, hasLocalAudio: hasLocalAudio, hasLocalVideo: hasLocalVideo, i18n: i18n, isGroupCall: call.callMode === Calling_1.CallMode.Group, me: me, onCallCanceled: cancelActiveCall, onJoinCall: joinActiveCall, participantNames: participantNames, setLocalPreview: setLocalPreview, setLocalAudio: setLocalAudio, setLocalVideo: setLocalVideo, toggleParticipants: toggleParticipants, toggleSettings: toggleSettings }),
                settingsDialogOpen && renderDeviceSelection(),
                showParticipantsList && call.callMode === Calling_1.CallMode.Group ? (react_1.default.createElement(CallingParticipantsList_1.CallingParticipantsList, { i18n: i18n, onClose: toggleParticipants, participants: groupCallParticipants })) : null));
        }
        if (pip) {
            return (react_1.default.createElement(CallingPip_1.CallingPip, { call: call, conversation: conversation, createCanvasVideoRenderer: createCanvasVideoRenderer, getGroupCallVideoFrameSource: getGroupCallVideoFrameSourceForActiveCall, hangUp: hangUp, hasLocalVideo: hasLocalVideo, i18n: i18n, setLocalPreview: setLocalPreview, setRendererCanvas: setRendererCanvas, togglePip: togglePip }));
        }
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(CallScreen_1.CallScreen, { call: call, conversation: conversation, createCanvasVideoRenderer: createCanvasVideoRenderer, getGroupCallVideoFrameSource: getGroupCallVideoFrameSourceForActiveCall, hangUp: hangUp, hasLocalAudio: hasLocalAudio, hasLocalVideo: hasLocalVideo, i18n: i18n, joinedAt: joinedAt, me: me, setLocalPreview: setLocalPreview, setRendererCanvas: setRendererCanvas, setLocalAudio: setLocalAudio, setLocalVideo: setLocalVideo, stickyControls: showParticipantsList, toggleParticipants: toggleParticipants, togglePip: togglePip, toggleSettings: toggleSettings }),
            settingsDialogOpen && renderDeviceSelection(),
            showParticipantsList && call.callMode === Calling_1.CallMode.Group ? (react_1.default.createElement(CallingParticipantsList_1.CallingParticipantsList, { i18n: i18n, onClose: toggleParticipants, participants: groupCallParticipants })) : null));
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