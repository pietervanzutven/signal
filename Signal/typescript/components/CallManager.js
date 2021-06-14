require(exports => {
    "use strict";
    // Copyright 2020-2021 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }));
    var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    });
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CallManager = void 0;
    const react_1 = __importStar(require("react"));
    const CallNeedPermissionScreen_1 = require("./CallNeedPermissionScreen");
    const CallScreen_1 = require("./CallScreen");
    const CallingLobby_1 = require("./CallingLobby");
    const CallingParticipantsList_1 = require("./CallingParticipantsList");
    const CallingPip_1 = require("./CallingPip");
    const IncomingCallBar_1 = require("./IncomingCallBar");
    const SafetyNumberChangeDialog_1 = require("./SafetyNumberChangeDialog");
    const Calling_1 = require("../types/Calling");
    const missingCaseError_1 = require("../util/missingCaseError");
    const ActiveCallManager = ({ activeCall, availableCameras, cancelCall, closeNeedPermissionScreen, hangUp, i18n, keyChangeOk, getGroupCallVideoFrameSource, me, renderDeviceSelection, renderSafetyNumberViewer, setGroupCallVideoRequest, setLocalAudio, setLocalPreview, setLocalVideo, setRendererCanvas, startCall, toggleParticipants, togglePip, toggleSettings, toggleSpeakerView, }) => {
        const { conversation, hasLocalAudio, hasLocalVideo, joinedAt, peekedParticipants, pip, settingsDialogOpen, showParticipantsList, } = activeCall;
        const cancelActiveCall = react_1.useCallback(() => {
            cancelCall({ conversationId: conversation.id });
        }, [cancelCall, conversation.id]);
        const joinActiveCall = react_1.useCallback(() => {
            startCall({
                callMode: activeCall.callMode,
                conversationId: conversation.id,
                hasLocalAudio,
                hasLocalVideo,
            });
        }, [
            startCall,
            activeCall.callMode,
            conversation.id,
            hasLocalAudio,
            hasLocalVideo,
        ]);
        const getGroupCallVideoFrameSourceForActiveCall = react_1.useCallback((demuxId) => {
            return getGroupCallVideoFrameSource(conversation.id, demuxId);
        }, [getGroupCallVideoFrameSource, conversation.id]);
        const setGroupCallVideoRequestForConversation = react_1.useCallback((resolutions) => {
            setGroupCallVideoRequest({
                conversationId: conversation.id,
                resolutions,
            });
        }, [setGroupCallVideoRequest, conversation.id]);
        let isCallFull;
        let showCallLobby;
        switch (activeCall.callMode) {
            case Calling_1.CallMode.Direct: {
                const { callState, callEndedReason } = activeCall;
                const ended = callState === Calling_1.CallState.Ended;
                if (ended &&
                    callEndedReason === Calling_1.CallEndedReason.RemoteHangupNeedPermission) {
                    return (react_1.default.createElement(CallNeedPermissionScreen_1.CallNeedPermissionScreen, { close: closeNeedPermissionScreen, conversation: conversation, i18n: i18n }));
                }
                showCallLobby = !callState;
                isCallFull = false;
                break;
            }
            case Calling_1.CallMode.Group: {
                showCallLobby = activeCall.joinState === Calling_1.GroupCallJoinState.NotJoined;
                isCallFull = activeCall.deviceCount >= activeCall.maxDevices;
                break;
            }
            default:
                throw missingCaseError_1.missingCaseError(activeCall);
        }
        if (showCallLobby) {
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(CallingLobby_1.CallingLobby, { availableCameras: availableCameras, conversation: conversation, hasLocalAudio: hasLocalAudio, hasLocalVideo: hasLocalVideo, i18n: i18n, isGroupCall: activeCall.callMode === Calling_1.CallMode.Group, isCallFull: isCallFull, me: me, onCallCanceled: cancelActiveCall, onJoinCall: joinActiveCall, peekedParticipants: peekedParticipants, setLocalPreview: setLocalPreview, setLocalAudio: setLocalAudio, setLocalVideo: setLocalVideo, showParticipantsList: showParticipantsList, toggleParticipants: toggleParticipants, toggleSettings: toggleSettings }),
                settingsDialogOpen && renderDeviceSelection(),
                showParticipantsList && activeCall.callMode === Calling_1.CallMode.Group ? (react_1.default.createElement(CallingParticipantsList_1.CallingParticipantsList, { i18n: i18n, onClose: toggleParticipants, ourUuid: me.uuid, participants: peekedParticipants })) : null));
        }
        if (pip) {
            return (react_1.default.createElement(CallingPip_1.CallingPip, { activeCall: activeCall, getGroupCallVideoFrameSource: getGroupCallVideoFrameSourceForActiveCall, hangUp: hangUp, hasLocalVideo: hasLocalVideo, i18n: i18n, setGroupCallVideoRequest: setGroupCallVideoRequestForConversation, setLocalPreview: setLocalPreview, setRendererCanvas: setRendererCanvas, togglePip: togglePip }));
        }
        const groupCallParticipantsForParticipantsList = activeCall.callMode === Calling_1.CallMode.Group
            ? [
                ...activeCall.remoteParticipants.map(participant => (Object.assign(Object.assign({}, participant), { hasAudio: participant.hasRemoteAudio, hasVideo: participant.hasRemoteVideo }))),
                Object.assign(Object.assign({}, me), { hasAudio: hasLocalAudio, hasVideo: hasLocalVideo }),
            ]
            : [];
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(CallScreen_1.CallScreen, { activeCall: activeCall, getGroupCallVideoFrameSource: getGroupCallVideoFrameSourceForActiveCall, hangUp: hangUp, i18n: i18n, joinedAt: joinedAt, me: me, setGroupCallVideoRequest: setGroupCallVideoRequestForConversation, setLocalPreview: setLocalPreview, setRendererCanvas: setRendererCanvas, setLocalAudio: setLocalAudio, setLocalVideo: setLocalVideo, stickyControls: showParticipantsList, toggleParticipants: toggleParticipants, togglePip: togglePip, toggleSettings: toggleSettings, toggleSpeakerView: toggleSpeakerView }),
            settingsDialogOpen && renderDeviceSelection(),
            showParticipantsList && activeCall.callMode === Calling_1.CallMode.Group ? (react_1.default.createElement(CallingParticipantsList_1.CallingParticipantsList, { i18n: i18n, onClose: toggleParticipants, ourUuid: me.uuid, participants: groupCallParticipantsForParticipantsList })) : null,
            activeCall.callMode === Calling_1.CallMode.Group &&
                activeCall.conversationsWithSafetyNumberChanges.length ? (react_1.default.createElement(SafetyNumberChangeDialog_1.SafetyNumberChangeDialog, {
                    confirmText: i18n('continueCall'), contacts: activeCall.conversationsWithSafetyNumberChanges, i18n: i18n, onCancel: () => {
                        hangUp({ conversationId: activeCall.conversation.id });
                    }, onConfirm: () => {
                        keyChangeOk({ conversationId: activeCall.conversation.id });
                    }, renderSafetyNumber: renderSafetyNumberViewer
                })) : null));
    };
    const CallManager = props => {
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
    exports.CallManager = CallManager;
});