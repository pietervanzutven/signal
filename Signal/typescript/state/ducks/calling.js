require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const notify_1 = require("../../services/notify");
    const calling_1 = require("../../services/calling");
    const Calling_1 = require("../../types/Calling");
    const callingTones_1 = require("../../util/callingTones");
    const callingPermissions_1 = require("../../util/callingPermissions");
    const bounceAppIcon_1 = require("../../shims/bounceAppIcon");
    // Actions
    const ACCEPT_CALL = 'calling/ACCEPT_CALL';
    const CALL_STATE_CHANGE = 'calling/CALL_STATE_CHANGE';
    const CALL_STATE_CHANGE_FULFILLED = 'calling/CALL_STATE_CHANGE_FULFILLED';
    const CHANGE_IO_DEVICE = 'calling/CHANGE_IO_DEVICE';
    const CHANGE_IO_DEVICE_FULFILLED = 'calling/CHANGE_IO_DEVICE_FULFILLED';
    const DECLINE_CALL = 'calling/DECLINE_CALL';
    const HANG_UP = 'calling/HANG_UP';
    const INCOMING_CALL = 'calling/INCOMING_CALL';
    const OUTGOING_CALL = 'calling/OUTGOING_CALL';
    const REFRESH_IO_DEVICES = 'calling/REFRESH_IO_DEVICES';
    const REMOTE_VIDEO_CHANGE = 'calling/REMOTE_VIDEO_CHANGE';
    const SET_LOCAL_AUDIO = 'calling/SET_LOCAL_AUDIO';
    const SET_LOCAL_VIDEO = 'calling/SET_LOCAL_VIDEO';
    const SET_LOCAL_VIDEO_FULFILLED = 'calling/SET_LOCAL_VIDEO_FULFILLED';
    const TOGGLE_SETTINGS = 'calling/TOGGLE_SETTINGS';
    // Action Creators
    function acceptCall(payload) {
        // tslint:disable-next-line no-floating-promises
        (async () => {
            try {
                await calling_1.calling.accept(payload.callId, payload.asVideoCall);
            }
            catch (err) {
                window.log.error(`Failed to acceptCall: ${err.stack}`);
            }
        })();
        return {
            type: ACCEPT_CALL,
            payload,
        };
    }
    function callStateChange(payload) {
        return {
            type: CALL_STATE_CHANGE,
            payload: doCallStateChange(payload),
        };
    }
    function changeIODevice(payload) {
        return {
            type: CHANGE_IO_DEVICE,
            payload: doChangeIODevice(payload),
        };
    }
    async function doChangeIODevice(payload) {
        if (payload.type === Calling_1.CallingDeviceType.CAMERA) {
            await calling_1.calling.setPreferredCamera(payload.selectedDevice);
        }
        else if (payload.type === Calling_1.CallingDeviceType.MICROPHONE) {
            calling_1.calling.setPreferredMicrophone(payload.selectedDevice);
        }
        else if (payload.type === Calling_1.CallingDeviceType.SPEAKER) {
            calling_1.calling.setPreferredSpeaker(payload.selectedDevice);
        }
        return payload;
    }
    async function doCallStateChange(payload) {
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
        return payload;
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
        // tslint:disable-next-line no-floating-promises
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
        calling_1.calling.videoCapturer.setLocalPreview(payload.element);
        return {
            type: 'NOOP',
            payload: null,
        };
    }
    function setRendererCanvas(payload) {
        calling_1.calling.videoRenderer.setCanvas(payload.element);
        return {
            type: 'NOOP',
            payload: null,
        };
    }
    function setLocalAudio(payload) {
        calling_1.calling.setOutgoingAudio(payload.callId, payload.enabled);
        return {
            type: SET_LOCAL_AUDIO,
            payload,
        };
    }
    function setLocalVideo(payload) {
        return {
            type: SET_LOCAL_VIDEO,
            payload: doSetLocalVideo(payload),
        };
    }
    function toggleSettings() {
        return {
            type: TOGGLE_SETTINGS,
        };
    }
    async function doSetLocalVideo(payload) {
        if (await callingPermissions_1.requestCameraPermissions()) {
            calling_1.calling.setOutgoingVideo(payload.callId, payload.enabled);
            return payload;
        }
        return Object.assign(Object.assign({}, payload), { enabled: false });
    }
    exports.actions = {
        acceptCall,
        callStateChange,
        changeIODevice,
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
            hasLocalAudio: false,
            hasLocalVideo: false,
            hasRemoteVideo: false,
            selectedCamera: undefined,
            selectedMicrophone: undefined,
            selectedSpeaker: undefined,
            settingsDialogOpen: false,
        };
    }
    // tslint:disable-next-line max-func-body-length
    function reducer(state = getEmptyState(), action) {
        if (action.type === ACCEPT_CALL) {
            return Object.assign(Object.assign({}, state), { hasLocalAudio: true, hasLocalVideo: action.payload.asVideoCall });
        }
        if (action.type === DECLINE_CALL || action.type === HANG_UP) {
            return getEmptyState();
        }
        if (action.type === INCOMING_CALL) {
            return Object.assign(Object.assign({}, state), { callDetails: action.payload.callDetails, callState: Calling_1.CallState.Prering });
        }
        if (action.type === OUTGOING_CALL) {
            return Object.assign(Object.assign({}, state), { callDetails: action.payload.callDetails, callState: Calling_1.CallState.Prering, hasLocalAudio: true, hasLocalVideo: action.payload.callDetails.isVideoCall });
        }
        if (action.type === CALL_STATE_CHANGE_FULFILLED) {
            if (action.payload.callState === Calling_1.CallState.Ended) {
                return getEmptyState();
            }
            return Object.assign(Object.assign({}, state), { callState: action.payload.callState });
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
        return state;
    }
    exports.reducer = reducer;
});