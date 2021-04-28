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
    const DECLINE_CALL = 'calling/DECLINE_CALL';
    const HANG_UP = 'calling/HANG_UP';
    const INCOMING_CALL = 'calling/INCOMING_CALL';
    const OUTGOING_CALL = 'calling/OUTGOING_CALL';
    const REMOTE_VIDEO_CHANGE = 'calling/REMOTE_VIDEO_CHANGE';
    const SET_LOCAL_AUDIO = 'calling/SET_LOCAL_AUDIO';
    const SET_LOCAL_VIDEO = 'calling/SET_LOCAL_VIDEO';
    const SET_LOCAL_VIDEO_FULFILLED = 'calling/SET_LOCAL_VIDEO_FULFILLED';
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
    async function doCallStateChange(payload) {
        const { callDetails, callState } = payload;
        const { isIncoming } = callDetails;
        if (callState === Calling_1.CallState.Ringing && isIncoming) {
            await callingTones_1.callingTones.playRingtone();
            await showCallNotification(callDetails);
            bounceAppIcon_1.bounceAppIconStart();
        }
        if (callState !== Calling_1.CallState.Ringing) {
            callingTones_1.callingTones.stopRingtone();
            bounceAppIcon_1.bounceAppIconStop();
        }
        if (callState === Calling_1.CallState.Ended) {
            // tslint:disable-next-line no-floating-promises
            callingTones_1.callingTones.playEndCall();
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
            platform: window.platform,
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
    function remoteVideoChange(payload) {
        return {
            type: REMOTE_VIDEO_CHANGE,
            payload,
        };
    }
    function setVideoCapturer(payload) {
        calling_1.calling.setVideoCapturer(payload.callId, payload.capturer);
        return {
            type: 'NOOP',
            payload: null,
        };
    }
    function setVideoRenderer(payload) {
        calling_1.calling.setVideoRenderer(payload.callId, payload.renderer);
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
        declineCall,
        hangUp,
        incomingCall,
        outgoingCall,
        remoteVideoChange,
        setVideoCapturer,
        setVideoRenderer,
        setLocalAudio,
        setLocalVideo,
    };
    // Reducer
    function getEmptyState() {
        return {
            callDetails: undefined,
            callState: undefined,
            hasLocalAudio: false,
            hasLocalVideo: false,
            hasRemoteVideo: false,
        };
    }
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
        return state;
    }
    exports.reducer = reducer;
});