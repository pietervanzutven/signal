require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const ringrtc_1 = require("ringrtc");
    const notify_1 = require("../../services/notify");
    const calling_1 = require("../../services/calling");
    const Calling_1 = require("../../types/Calling");
    const callingTones_1 = require("../../util/callingTones");
    const callingPermissions_1 = require("../../util/callingPermissions");
    const bounceAppIcon_1 = require("../../shims/bounceAppIcon");
    // Helpers
    function isCallActive({ callDetails, callState, }) {
        return Boolean(callDetails &&
            ((!callDetails.isIncoming &&
                (callState === Calling_1.CallState.Prering || callState === Calling_1.CallState.Ringing)) ||
                callState === Calling_1.CallState.Accepted ||
                callState === Calling_1.CallState.Reconnecting));
    }
    exports.isCallActive = isCallActive;
    // Actions
    const ACCEPT_CALL_PENDING = 'calling/ACCEPT_CALL_PENDING';
    const CANCEL_CALL = 'calling/CANCEL_CALL';
    const SHOW_CALL_LOBBY = 'calling/SHOW_CALL_LOBBY';
    const CALL_STATE_CHANGE_FULFILLED = 'calling/CALL_STATE_CHANGE_FULFILLED';
    const CHANGE_IO_DEVICE_FULFILLED = 'calling/CHANGE_IO_DEVICE_FULFILLED';
    const CLOSE_NEED_PERMISSION_SCREEN = 'calling/CLOSE_NEED_PERMISSION_SCREEN';
    const DECLINE_CALL = 'calling/DECLINE_CALL';
    const HANG_UP = 'calling/HANG_UP';
    const INCOMING_CALL = 'calling/INCOMING_CALL';
    const OUTGOING_CALL = 'calling/OUTGOING_CALL';
    const REFRESH_IO_DEVICES = 'calling/REFRESH_IO_DEVICES';
    const REMOTE_VIDEO_CHANGE = 'calling/REMOTE_VIDEO_CHANGE';
    const SET_LOCAL_AUDIO = 'calling/SET_LOCAL_AUDIO';
    const SET_LOCAL_VIDEO_FULFILLED = 'calling/SET_LOCAL_VIDEO_FULFILLED';
    const START_CALL = 'calling/START_CALL';
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
                await calling_1.calling.accept(payload.callId, payload.asVideoCall);
            }
            catch (err) {
                window.log.error(`Failed to acceptCall: ${err.stack}`);
            }
        };
    }
    function callStateChange(payload) {
        return async (dispatch) => {
            const { callDetails, callState } = payload;
            const { isIncoming } = callDetails;
            if (callState === Calling_1.CallState.Ringing && isIncoming) {
                await callingTones_1.callingTones.playRingtone();
                await showCallNotification(callDetails);
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
    async function showCallNotification(callDetails) {
        const canNotify = await window.getCallSystemNotification();
        if (!canNotify) {
            return;
        }
        const { title, isVideoCall } = callDetails;
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
    function cancelCall() {
        window.Signal.Services.calling.stopCallingLobby();
        return {
            type: CANCEL_CALL,
        };
    }
    function declineCall(payload) {
        calling_1.calling.decline(payload.callId);
        return {
            type: DECLINE_CALL,
            payload,
        };
    }
    function hangUp(payload) {
        calling_1.calling.hangup(payload.callId);
        return {
            type: HANG_UP,
            payload,
        };
    }
    function incomingCall(payload) {
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
        if (payload.callId) {
            calling_1.calling.setOutgoingAudio(payload.callId, payload.enabled);
        }
        return {
            type: SET_LOCAL_AUDIO,
            payload,
        };
    }
    function setLocalVideo(payload) {
        return async (dispatch) => {
            let enabled;
            if (await callingPermissions_1.requestCameraPermissions()) {
                if (payload.callId) {
                    calling_1.calling.setOutgoingVideo(payload.callId, payload.enabled);
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
        const { callDetails } = payload;
        window.Signal.Services.calling.startOutgoingCall(callDetails.id, callDetails.isVideoCall);
        return {
            type: START_CALL,
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
        hangUp,
        incomingCall,
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
            callDetails: undefined,
            callState: undefined,
            callEndedReason: undefined,
            hasLocalAudio: false,
            hasLocalVideo: false,
            hasRemoteVideo: false,
            participantsList: false,
            pip: false,
            selectedCamera: undefined,
            selectedMicrophone: undefined,
            selectedSpeaker: undefined,
            settingsDialogOpen: false,
        };
    }
    exports.getEmptyState = getEmptyState;
    function reducer(state = getEmptyState(), action) {
        if (action.type === SHOW_CALL_LOBBY) {
            return Object.assign(Object.assign({}, state), { callDetails: action.payload.callDetails, callState: undefined, hasLocalAudio: true, hasLocalVideo: action.payload.callDetails.isVideoCall });
        }
        if (action.type === START_CALL) {
            return Object.assign(Object.assign({}, state), { callState: Calling_1.CallState.Prering });
        }
        if (action.type === ACCEPT_CALL_PENDING) {
            return Object.assign(Object.assign({}, state), { hasLocalAudio: true, hasLocalVideo: action.payload.asVideoCall });
        }
        if (action.type === CANCEL_CALL ||
            action.type === DECLINE_CALL ||
            action.type === HANG_UP ||
            action.type === CLOSE_NEED_PERMISSION_SCREEN) {
            return getEmptyState();
        }
        if (action.type === INCOMING_CALL) {
            return Object.assign(Object.assign({}, state), { callDetails: action.payload.callDetails, callState: Calling_1.CallState.Prering });
        }
        if (action.type === OUTGOING_CALL) {
            return Object.assign(Object.assign({}, state), { callDetails: action.payload.callDetails, callState: Calling_1.CallState.Prering });
        }
        if (action.type === CALL_STATE_CHANGE_FULFILLED) {
            // We want to keep the state around for ended calls if they resulted in a message
            //   request so we can show the "needs permission" screen.
            if (action.payload.callState === Calling_1.CallState.Ended &&
                action.payload.callEndedReason !==
                ringrtc_1.CallEndedReason.RemoteHangupNeedPermission) {
                return getEmptyState();
            }
            return Object.assign(Object.assign({}, state), { callState: action.payload.callState, callEndedReason: action.payload.callEndedReason });
        }
        if (action.type === REMOTE_VIDEO_CHANGE) {
            return Object.assign(Object.assign({}, state), { hasRemoteVideo: action.payload.remoteVideoEnabled });
        }
        if (action.type === SET_LOCAL_AUDIO) {
            return Object.assign(Object.assign({}, state), { hasLocalAudio: action.payload.enabled });
        }
        if (action.type === SET_LOCAL_VIDEO_FULFILLED) {
            return Object.assign(Object.assign({}, state), { hasLocalVideo: action.payload.enabled });
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
            return Object.assign(Object.assign({}, state), { settingsDialogOpen: !state.settingsDialogOpen });
        }
        if (action.type === TOGGLE_PARTICIPANTS) {
            return Object.assign(Object.assign({}, state), { participantsList: !state.participantsList });
        }
        if (action.type === TOGGLE_PIP) {
            return Object.assign(Object.assign({}, state), { pip: !state.pip });
        }
        return state;
    }
    exports.reducer = reducer;
});