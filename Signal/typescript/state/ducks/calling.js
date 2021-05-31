require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const ringrtc_1 = require("ringrtc");
    const lodash_1 = require("lodash");
    const getOwn_1 = require("../../util/getOwn");
    const missingCaseError_1 = require("../../util/missingCaseError");
    const notify_1 = require("../../services/notify");
    const calling_1 = require("../../services/calling");
    const Calling_1 = require("../../types/Calling");
    const callingTones_1 = require("../../util/callingTones");
    const callingPermissions_1 = require("../../util/callingPermissions");
    const bounceAppIcon_1 = require("../../shims/bounceAppIcon");
    // Helpers
    exports.getActiveCall = ({ activeCallState, callsByConversation, }) => activeCallState &&
        getOwn_1.getOwn(callsByConversation, activeCallState.conversationId);
    // Actions
    const ACCEPT_CALL_PENDING = 'calling/ACCEPT_CALL_PENDING';
    const CANCEL_CALL = 'calling/CANCEL_CALL';
    const SHOW_CALL_LOBBY = 'calling/SHOW_CALL_LOBBY';
    const CALL_STATE_CHANGE_FULFILLED = 'calling/CALL_STATE_CHANGE_FULFILLED';
    const CHANGE_IO_DEVICE_FULFILLED = 'calling/CHANGE_IO_DEVICE_FULFILLED';
    const CLOSE_NEED_PERMISSION_SCREEN = 'calling/CLOSE_NEED_PERMISSION_SCREEN';
    const DECLINE_CALL = 'calling/DECLINE_CALL';
    const GROUP_CALL_STATE_CHANGE = 'calling/GROUP_CALL_STATE_CHANGE';
    const HANG_UP = 'calling/HANG_UP';
    const INCOMING_CALL = 'calling/INCOMING_CALL';
    const OUTGOING_CALL = 'calling/OUTGOING_CALL';
    const REFRESH_IO_DEVICES = 'calling/REFRESH_IO_DEVICES';
    const REMOTE_VIDEO_CHANGE = 'calling/REMOTE_VIDEO_CHANGE';
    const SET_LOCAL_AUDIO_FULFILLED = 'calling/SET_LOCAL_AUDIO_FULFILLED';
    const SET_LOCAL_VIDEO_FULFILLED = 'calling/SET_LOCAL_VIDEO_FULFILLED';
    const START_DIRECT_CALL = 'calling/START_DIRECT_CALL';
    const TOGGLE_PARTICIPANTS = 'calling/TOGGLE_PARTICIPANTS';
    const TOGGLE_PIP = 'calling/TOGGLE_PIP';
    const TOGGLE_SETTINGS = 'calling/TOGGLE_SETTINGS';
    // Action Creators
    function acceptCall(payload) {
        return async (dispatch) => {
            dispatch({
                type: ACCEPT_CALL_PENDING,
                payload,
            });
            try {
                await calling_1.calling.accept(payload.conversationId, payload.asVideoCall);
            }
            catch (err) {
                window.log.error(`Failed to acceptCall: ${err.stack}`);
            }
        };
    }
    function callStateChange(payload) {
        return async (dispatch) => {
            const { callState, isIncoming, title, isVideoCall } = payload;
            if (callState === Calling_1.CallState.Ringing && isIncoming) {
                await callingTones_1.callingTones.playRingtone();
                await showCallNotification(title, isVideoCall);
                bounceAppIcon_1.bounceAppIconStart();
            }
            if (callState !== Calling_1.CallState.Ringing) {
                await callingTones_1.callingTones.stopRingtone();
                bounceAppIcon_1.bounceAppIconStop();
            }
            if (callState === Calling_1.CallState.Ended) {
                await callingTones_1.callingTones.playEndCall();
            }
            dispatch({
                type: CALL_STATE_CHANGE_FULFILLED,
                payload,
            });
        };
    }
    function changeIODevice(payload) {
        return async (dispatch) => {
            // Only `setPreferredCamera` returns a Promise.
            if (payload.type === Calling_1.CallingDeviceType.CAMERA) {
                await calling_1.calling.setPreferredCamera(payload.selectedDevice);
            }
            else if (payload.type === Calling_1.CallingDeviceType.MICROPHONE) {
                calling_1.calling.setPreferredMicrophone(payload.selectedDevice);
            }
            else if (payload.type === Calling_1.CallingDeviceType.SPEAKER) {
                calling_1.calling.setPreferredSpeaker(payload.selectedDevice);
            }
            dispatch({
                type: CHANGE_IO_DEVICE_FULFILLED,
                payload,
            });
        };
    }
    async function showCallNotification(title, isVideoCall) {
        const canNotify = await window.getCallSystemNotification();
        if (!canNotify) {
            return;
        }
        notify_1.notify({
            title,
            icon: isVideoCall
                ? 'images/icons/v2/video-solid-24.svg'
                : 'images/icons/v2/phone-right-solid-24.svg',
            message: window.i18n(isVideoCall ? 'incomingVideoCall' : 'incomingAudioCall'),
            onNotificationClick: () => {
                window.showWindow();
            },
            silent: false,
        });
    }
    function closeNeedPermissionScreen() {
        return {
            type: CLOSE_NEED_PERMISSION_SCREEN,
            payload: null,
        };
    }
    function cancelCall(payload) {
        calling_1.calling.stopCallingLobby(payload.conversationId);
        return {
            type: CANCEL_CALL,
        };
    }
    function declineCall(payload) {
        calling_1.calling.decline(payload.conversationId);
        return {
            type: DECLINE_CALL,
            payload,
        };
    }
    function groupCallStateChange(payload) {
        return {
            type: GROUP_CALL_STATE_CHANGE,
            payload,
        };
    }
    function hangUp(payload) {
        calling_1.calling.hangup(payload.conversationId);
        return {
            type: HANG_UP,
            payload,
        };
    }
    function receiveIncomingCall(payload) {
        return {
            type: INCOMING_CALL,
            payload,
        };
    }
    function outgoingCall(payload) {
        callingTones_1.callingTones.playRingtone();
        return {
            type: OUTGOING_CALL,
            payload,
        };
    }
    function refreshIODevices(payload) {
        return {
            type: REFRESH_IO_DEVICES,
            payload,
        };
    }
    function remoteVideoChange(payload) {
        return {
            type: REMOTE_VIDEO_CHANGE,
            payload,
        };
    }
    function setLocalPreview(payload) {
        return () => {
            calling_1.calling.videoCapturer.setLocalPreview(payload.element);
        };
    }
    function setRendererCanvas(payload) {
        return () => {
            calling_1.calling.videoRenderer.setCanvas(payload.element);
        };
    }
    function setLocalAudio(payload) {
        return (dispatch, getState) => {
            const activeCall = exports.getActiveCall(getState().calling);
            if (!activeCall) {
                window.log.warn('Trying to set local audio when no call is active');
                return;
            }
            calling_1.calling.setOutgoingAudio(activeCall.conversationId, payload.enabled);
            dispatch({
                type: SET_LOCAL_AUDIO_FULFILLED,
                payload,
            });
        };
    }
    function setLocalVideo(payload) {
        return async (dispatch, getState) => {
            const activeCall = exports.getActiveCall(getState().calling);
            if (!activeCall) {
                window.log.warn('Trying to set local video when no call is active');
                return;
            }
            let enabled;
            if (await callingPermissions_1.requestCameraPermissions()) {
                if (activeCall.callMode === Calling_1.CallMode.Group ||
                    (activeCall.callMode === Calling_1.CallMode.Direct && activeCall.callState)) {
                    calling_1.calling.setOutgoingVideo(activeCall.conversationId, payload.enabled);
                }
                else if (payload.enabled) {
                    calling_1.calling.enableLocalCamera();
                }
                else {
                    calling_1.calling.disableLocalCamera();
                }
                ({ enabled } = payload);
            }
            else {
                enabled = false;
            }
            dispatch({
                type: SET_LOCAL_VIDEO_FULFILLED,
                payload: Object.assign(Object.assign({}, payload), { enabled }),
            });
        };
    }
    function showCallLobby(payload) {
        return {
            type: SHOW_CALL_LOBBY,
            payload,
        };
    }
    function startCall(payload) {
        return dispatch => {
            switch (payload.callMode) {
                case Calling_1.CallMode.Direct:
                    calling_1.calling.startOutgoingDirectCall(payload.conversationId, payload.hasLocalAudio, payload.hasLocalVideo);
                    dispatch({
                        type: START_DIRECT_CALL,
                        payload,
                    });
                    break;
                case Calling_1.CallMode.Group:
                    calling_1.calling.joinGroupCall(payload.conversationId, payload.hasLocalAudio, payload.hasLocalVideo);
                    // The calling service should already be wired up to Redux so we don't need to
                    //   dispatch anything here.
                    break;
                default:
                    throw missingCaseError_1.missingCaseError(payload.callMode);
            }
        };
    }
    function toggleParticipants() {
        return {
            type: TOGGLE_PARTICIPANTS,
        };
    }
    function togglePip() {
        return {
            type: TOGGLE_PIP,
        };
    }
    function toggleSettings() {
        return {
            type: TOGGLE_SETTINGS,
        };
    }
    exports.actions = {
        acceptCall,
        cancelCall,
        callStateChange,
        changeIODevice,
        closeNeedPermissionScreen,
        declineCall,
        groupCallStateChange,
        hangUp,
        receiveIncomingCall,
        outgoingCall,
        refreshIODevices,
        remoteVideoChange,
        setLocalPreview,
        setRendererCanvas,
        setLocalAudio,
        setLocalVideo,
        showCallLobby,
        startCall,
        toggleParticipants,
        togglePip,
        toggleSettings,
    };
    // Reducer
    function getEmptyState() {
        return {
            availableCameras: [],
            availableMicrophones: [],
            availableSpeakers: [],
            selectedCamera: undefined,
            selectedMicrophone: undefined,
            selectedSpeaker: undefined,
            callsByConversation: {},
            activeCallState: undefined,
        };
    }
    exports.getEmptyState = getEmptyState;
    function removeConversationFromState(state, conversationId) {
        var _a;
        return Object.assign(Object.assign({}, (conversationId === ((_a = state.activeCallState) === null || _a === void 0 ? void 0 : _a.conversationId)
            ? lodash_1.omit(state, 'activeCallState')
            : state)), { callsByConversation: lodash_1.omit(state.callsByConversation, conversationId) });
    }
    function reducer(state = getEmptyState(), action) {
        var _a, _b, _c, _d, _e;
        const { callsByConversation } = state;
        if (action.type === SHOW_CALL_LOBBY) {
            let call;
            switch (action.payload.callMode) {
                case Calling_1.CallMode.Direct:
                    call = {
                        callMode: Calling_1.CallMode.Direct,
                        conversationId: action.payload.conversationId,
                        isIncoming: false,
                        isVideoCall: action.payload.hasLocalVideo,
                    };
                    break;
                case Calling_1.CallMode.Group:
                    // We expect to be in this state briefly. The Calling service should update the
                    //   call state shortly.
                    call = {
                        callMode: Calling_1.CallMode.Group,
                        conversationId: action.payload.conversationId,
                        connectionState: action.payload.connectionState,
                        joinState: action.payload.joinState,
                        remoteParticipants: action.payload.remoteParticipants,
                    };
                    break;
                default:
                    throw missingCaseError_1.missingCaseError(action.payload);
            }
            return Object.assign(Object.assign({}, state), {
                callsByConversation: Object.assign(Object.assign({}, callsByConversation), { [action.payload.conversationId]: call }), activeCallState: {
                    conversationId: action.payload.conversationId,
                    hasLocalAudio: action.payload.hasLocalAudio,
                    hasLocalVideo: action.payload.hasLocalVideo,
                    showParticipantsList: false,
                    pip: false,
                    settingsDialogOpen: false,
                }
            });
        }
        if (action.type === START_DIRECT_CALL) {
            return Object.assign(Object.assign({}, state), {
                callsByConversation: Object.assign(Object.assign({}, callsByConversation), {
                    [action.payload.conversationId]: {
                        callMode: Calling_1.CallMode.Direct,
                        conversationId: action.payload.conversationId,
                        callState: Calling_1.CallState.Prering,
                        isIncoming: false,
                        isVideoCall: action.payload.hasLocalVideo,
                    }
                }), activeCallState: {
                    conversationId: action.payload.conversationId,
                    hasLocalAudio: action.payload.hasLocalAudio,
                    hasLocalVideo: action.payload.hasLocalVideo,
                    showParticipantsList: false,
                    pip: false,
                    settingsDialogOpen: false,
                }
            });
        }
        if (action.type === ACCEPT_CALL_PENDING) {
            if (!lodash_1.has(state.callsByConversation, action.payload.conversationId)) {
                window.log.warn('Unable to accept a non-existent call');
                return state;
            }
            return Object.assign(Object.assign({}, state), {
                activeCallState: {
                    conversationId: action.payload.conversationId,
                    hasLocalAudio: true,
                    hasLocalVideo: action.payload.asVideoCall,
                    showParticipantsList: false,
                    pip: false,
                    settingsDialogOpen: false,
                }
            });
        }
        if (action.type === CANCEL_CALL ||
            action.type === HANG_UP ||
            action.type === CLOSE_NEED_PERMISSION_SCREEN) {
            const activeCall = exports.getActiveCall(state);
            if (!activeCall) {
                window.log.warn('No active call to remove');
                return state;
            }
            switch (activeCall.callMode) {
                case Calling_1.CallMode.Direct:
                    return removeConversationFromState(state, activeCall.conversationId);
                case Calling_1.CallMode.Group:
                    return lodash_1.omit(state, 'activeCallState');
                default:
                    throw missingCaseError_1.missingCaseError(activeCall);
            }
        }
        if (action.type === DECLINE_CALL) {
            return removeConversationFromState(state, action.payload.conversationId);
        }
        if (action.type === INCOMING_CALL) {
            return Object.assign(Object.assign({}, state), {
                callsByConversation: Object.assign(Object.assign({}, callsByConversation), {
                    [action.payload.conversationId]: {
                        callMode: Calling_1.CallMode.Direct,
                        conversationId: action.payload.conversationId,
                        callState: Calling_1.CallState.Prering,
                        isIncoming: true,
                        isVideoCall: action.payload.isVideoCall,
                    }
                })
            });
        }
        if (action.type === OUTGOING_CALL) {
            return Object.assign(Object.assign({}, state), {
                callsByConversation: Object.assign(Object.assign({}, callsByConversation), {
                    [action.payload.conversationId]: {
                        callMode: Calling_1.CallMode.Direct,
                        conversationId: action.payload.conversationId,
                        callState: Calling_1.CallState.Prering,
                        isIncoming: false,
                        isVideoCall: action.payload.hasLocalVideo,
                    }
                }), activeCallState: {
                    conversationId: action.payload.conversationId,
                    hasLocalAudio: action.payload.hasLocalAudio,
                    hasLocalVideo: action.payload.hasLocalVideo,
                    showParticipantsList: false,
                    pip: false,
                    settingsDialogOpen: false,
                }
            });
        }
        if (action.type === CALL_STATE_CHANGE_FULFILLED) {
            // We want to keep the state around for ended calls if they resulted in a message
            //   request so we can show the "needs permission" screen.
            if (action.payload.callState === Calling_1.CallState.Ended &&
                action.payload.callEndedReason !==
                ringrtc_1.CallEndedReason.RemoteHangupNeedPermission) {
                return removeConversationFromState(state, action.payload.conversationId);
            }
            const call = getOwn_1.getOwn(state.callsByConversation, action.payload.conversationId);
            if (((_a = call) === null || _a === void 0 ? void 0 : _a.callMode) !== Calling_1.CallMode.Direct) {
                window.log.warn('Cannot update state for a non-direct call');
                return state;
            }
            let activeCallState;
            if (((_b = state.activeCallState) === null || _b === void 0 ? void 0 : _b.conversationId) === action.payload.conversationId) {
                activeCallState = Object.assign(Object.assign({}, state.activeCallState), { joinedAt: action.payload.acceptedTime });
            }
            else {
                ({ activeCallState } = state);
            }
            return Object.assign(Object.assign({}, state), { callsByConversation: Object.assign(Object.assign({}, callsByConversation), { [action.payload.conversationId]: Object.assign(Object.assign({}, call), { callState: action.payload.callState, callEndedReason: action.payload.callEndedReason }) }), activeCallState });
        }
        if (action.type === GROUP_CALL_STATE_CHANGE) {
            const { conversationId, connectionState, joinState, hasLocalAudio, hasLocalVideo, remoteParticipants, } = action.payload;
            if (connectionState === Calling_1.GroupCallConnectionState.NotConnected) {
                return Object.assign(Object.assign({}, state), {
                    callsByConversation: lodash_1.omit(callsByConversation, conversationId), activeCallState: ((_c = state.activeCallState) === null || _c === void 0 ? void 0 : _c.conversationId) === conversationId
                        ? undefined
                        : state.activeCallState
                });
            }
            return Object.assign(Object.assign({}, state), {
                callsByConversation: Object.assign(Object.assign({}, callsByConversation), {
                    [conversationId]: {
                        callMode: Calling_1.CallMode.Group,
                        conversationId,
                        connectionState,
                        joinState,
                        remoteParticipants,
                    }
                }), activeCallState: ((_d = state.activeCallState) === null || _d === void 0 ? void 0 : _d.conversationId) === conversationId
                    ? Object.assign(Object.assign({}, state.activeCallState), {
                        hasLocalAudio,
                        hasLocalVideo
                    }) : state.activeCallState
            });
        }
        if (action.type === REMOTE_VIDEO_CHANGE) {
            const { conversationId, hasVideo } = action.payload;
            const call = getOwn_1.getOwn(state.callsByConversation, conversationId);
            if (((_e = call) === null || _e === void 0 ? void 0 : _e.callMode) !== Calling_1.CallMode.Direct) {
                window.log.warn('Cannot update remote video for a non-direct call');
                return state;
            }
            return Object.assign(Object.assign({}, state), { callsByConversation: Object.assign(Object.assign({}, callsByConversation), { [conversationId]: Object.assign(Object.assign({}, call), { hasRemoteVideo: hasVideo }) }) });
        }
        if (action.type === SET_LOCAL_AUDIO_FULFILLED) {
            if (!state.activeCallState) {
                window.log.warn('Cannot set local audio with no active call');
                return state;
            }
            return Object.assign(Object.assign({}, state), { activeCallState: Object.assign(Object.assign({}, state.activeCallState), { hasLocalAudio: action.payload.enabled }) });
        }
        if (action.type === SET_LOCAL_VIDEO_FULFILLED) {
            if (!state.activeCallState) {
                window.log.warn('Cannot set local video with no active call');
                return state;
            }
            return Object.assign(Object.assign({}, state), { activeCallState: Object.assign(Object.assign({}, state.activeCallState), { hasLocalVideo: action.payload.enabled }) });
        }
        if (action.type === CHANGE_IO_DEVICE_FULFILLED) {
            const { selectedDevice } = action.payload;
            const nextState = Object.create(null);
            if (action.payload.type === Calling_1.CallingDeviceType.CAMERA) {
                nextState.selectedCamera = selectedDevice;
            }
            else if (action.payload.type === Calling_1.CallingDeviceType.MICROPHONE) {
                nextState.selectedMicrophone = selectedDevice;
            }
            else if (action.payload.type === Calling_1.CallingDeviceType.SPEAKER) {
                nextState.selectedSpeaker = selectedDevice;
            }
            return Object.assign(Object.assign({}, state), nextState);
        }
        if (action.type === REFRESH_IO_DEVICES) {
            const { availableMicrophones, selectedMicrophone, availableSpeakers, selectedSpeaker, availableCameras, selectedCamera, } = action.payload;
            return Object.assign(Object.assign({}, state), {
                availableMicrophones,
                selectedMicrophone,
                availableSpeakers,
                selectedSpeaker,
                availableCameras,
                selectedCamera
            });
        }
        if (action.type === TOGGLE_SETTINGS) {
            const { activeCallState } = state;
            if (!activeCallState) {
                window.log.warn('Cannot toggle settings when there is no active call');
                return state;
            }
            return Object.assign(Object.assign({}, state), { activeCallState: Object.assign(Object.assign({}, activeCallState), { settingsDialogOpen: !activeCallState.settingsDialogOpen }) });
        }
        if (action.type === TOGGLE_PARTICIPANTS) {
            const { activeCallState } = state;
            if (!activeCallState) {
                window.log.warn('Cannot toggle participants list when there is no active call');
                return state;
            }
            return Object.assign(Object.assign({}, state), { activeCallState: Object.assign(Object.assign({}, activeCallState), { showParticipantsList: !activeCallState.showParticipantsList }) });
        }
        if (action.type === TOGGLE_PIP) {
            const { activeCallState } = state;
            if (!activeCallState) {
                window.log.warn('Cannot toggle PiP when there is no active call');
                return state;
            }
            return Object.assign(Object.assign({}, state), { activeCallState: Object.assign(Object.assign({}, activeCallState), { pip: !activeCallState.pip }) });
        }
        return state;
    }
    exports.reducer = reducer;
});