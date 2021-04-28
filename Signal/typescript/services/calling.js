require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const ringrtc_1 = require("ringrtc");
    const is_1 = __importDefault(require("@sindresorhus/is"));
    var ringrtc_2 = require("ringrtc");
    exports.CallState = ringrtc_2.CallState;
    exports.CanvasVideoRenderer = ringrtc_2.CanvasVideoRenderer;
    exports.GumVideoCapturer = ringrtc_2.GumVideoCapturer;
    class CallingClass {
        initialize(uxActions) {
            this.uxActions = uxActions;
            if (!uxActions) {
                throw new Error('CallingClass.initialize: Invalid uxActions.');
            }
            if (!is_1.default.function_(uxActions.incomingCall)) {
                throw new Error('CallingClass.initialize: Invalid uxActions.incomingCall');
            }
            if (!is_1.default.function_(uxActions.outgoingCall)) {
                throw new Error('CallingClass.initialize: Invalid uxActions.outgoingCall');
            }
            if (!is_1.default.function_(uxActions.callStateChange)) {
                throw new Error('CallingClass.initialize: Invalid uxActions.callStateChange');
            }
            if (!is_1.default.function_(uxActions.remoteVideoChange)) {
                throw new Error('CallingClass.initialize: Invalid uxActions.remoteVideoChange');
            }
            ringrtc_1.RingRTC.handleOutgoingSignaling = this.handleOutgoingSignaling.bind(this);
            ringrtc_1.RingRTC.handleIncomingCall = this.handleIncomingCall.bind(this);
            ringrtc_1.RingRTC.handleAutoEndedIncomingCallRequest = this.handleAutoEndedIncomingCallRequest.bind(this);
            ringrtc_1.RingRTC.handleLogMessage = this.handleLogMessage.bind(this);
        }
        async startOutgoingCall(conversation, isVideoCall) {
            if (!this.uxActions) {
                window.log.error('Missing uxActions, new call not allowed.');
                return;
            }
            if (ringrtc_1.RingRTC.call && ringrtc_1.RingRTC.call.state !== ringrtc_1.CallState.Ended) {
                window.log.info('Call already in progress, new call not allowed.');
                return;
            }
            const remoteUserId = this.getRemoteUserIdFromConversation(conversation);
            if (!remoteUserId || !this.localDeviceId) {
                window.log.error('Missing identifier, new call not allowed.');
                return;
            }
            const haveMediaPermissions = await this.requestPermissions(isVideoCall);
            if (!haveMediaPermissions) {
                window.log.info('Permissions were denied, new call not allowed.');
                return;
            }
            // We could make this faster by getting the call object
            // from the RingRTC before we lookup the ICE servers.
            const call = ringrtc_1.RingRTC.startOutgoingCall(remoteUserId, isVideoCall, this.localDeviceId, await this.getCallSettings(conversation));
            this.attachToCall(conversation, call);
            this.uxActions.outgoingCall({
                callDetails: this.getUxCallDetails(conversation, call),
            });
        }
        async accept(callId, asVideoCall) {
            const haveMediaPermissions = await this.requestPermissions(asVideoCall);
            if (haveMediaPermissions) {
                ringrtc_1.RingRTC.accept(callId, asVideoCall);
            }
            else {
                window.log.info('Permissions were denied, call not allowed, hanging up.');
                ringrtc_1.RingRTC.hangup(callId);
            }
        }
        decline(callId) {
            ringrtc_1.RingRTC.decline(callId);
        }
        hangup(callId) {
            ringrtc_1.RingRTC.hangup(callId);
        }
        setOutgoingAudio(callId, enabled) {
            ringrtc_1.RingRTC.setOutgoingAudio(callId, enabled);
        }
        setOutgoingVideo(callId, enabled) {
            ringrtc_1.RingRTC.setOutgoingVideo(callId, enabled);
        }
        setVideoCapturer(callId, capturer) {
            ringrtc_1.RingRTC.setVideoCapturer(callId, capturer);
        }
        setVideoRenderer(callId, renderer) {
            ringrtc_1.RingRTC.setVideoRenderer(callId, renderer);
        }
        async handleCallingMessage(envelope, callingMessage) {
            const enableIncomingCalls = await window.getIncomingCallNotification();
            if (callingMessage.offer && !enableIncomingCalls) {
                // Drop offers silently if incoming call notifications are disabled.
                window.log.info('Incoming calls are disabled, ignoring call offer.');
                return;
            }
            const remoteUserId = envelope.source || envelope.sourceUuid;
            const remoteDeviceId = this.parseDeviceId(envelope.sourceDevice);
            if (!remoteUserId || !remoteDeviceId || !this.localDeviceId) {
                window.log.error('Missing identifier, ignoring call message.');
                return;
            }
            const messageAgeSec = envelope.messageAgeSec ? envelope.messageAgeSec : 0;
            ringrtc_1.RingRTC.handleCallingMessage(remoteUserId, remoteDeviceId, this.localDeviceId, messageAgeSec, callingMessage);
        }
        async requestCameraPermissions() {
            const cameraPermission = await window.getMediaCameraPermissions();
            if (!cameraPermission) {
                await window.showCallingPermissionsPopup(true);
                // Check the setting again (from the source of truth).
                return window.getMediaCameraPermissions();
            }
            return true;
        }
        async requestMicrophonePermissions() {
            const microphonePermission = await window.getMediaPermissions();
            if (!microphonePermission) {
                await window.showCallingPermissionsPopup(false);
                // Check the setting again (from the source of truth).
                return window.getMediaPermissions();
            }
            return true;
        }
        async requestPermissions(isVideoCall) {
            const microphonePermission = await this.requestMicrophonePermissions();
            if (microphonePermission) {
                if (isVideoCall) {
                    return this.requestCameraPermissions();
                }
                else {
                    return true;
                }
            }
            else {
                return false;
            }
        }
        async handleOutgoingSignaling(remoteUserId, message) {
            const conversation = window.ConversationController.get(remoteUserId);
            const sendOptions = conversation
                ? conversation.getSendOptions()
                : undefined;
            if (!window.textsecure.messaging) {
                window.log.warn('handleOutgoingSignaling() returning false; offline');
                return false;
            }
            try {
                await window.textsecure.messaging.sendCallingMessage(remoteUserId, message, sendOptions);
                window.log.info('handleOutgoingSignaling() completed successfully');
                return true;
            }
            catch (err) {
                if (err && err.errors && err.errors.length > 0) {
                    window.log.error(`handleOutgoingSignaling() failed: ${err.errors[0].reason}`);
                }
                else {
                    window.log.error('handleOutgoingSignaling() failed');
                }
                return false;
            }
        }
        async handleIncomingCall(call) {
            if (!this.uxActions || !this.localDeviceId) {
                window.log.error('Missing required objects, ignoring incoming call.');
                return null;
            }
            const conversation = window.ConversationController.get(call.remoteUserId);
            if (!conversation) {
                window.log.error('Missing conversation, ignoring incoming call.');
                return null;
            }
            try {
                // The peer must be 'trusted' before accepting a call from them.
                // This is mostly the safety number check, unverified meaning that they were
                // verified before but now they are not.
                const verifiedEnum = await conversation.safeGetVerified();
                if (verifiedEnum ===
                    window.textsecure.storage.protocol.VerifiedStatus.UNVERIFIED) {
                    window.log.info(`Peer is not trusted, ignoring incoming call for conversation: ${conversation.idForLogging()}`);
                    this.addCallHistoryForFailedIncomingCall(conversation, call);
                    return null;
                }
                // Simple Call Requests: Ensure that the conversation is accepted.
                // If not, do not allow the call.
                if (!conversation.getAccepted()) {
                    window.log.info(`Messaging is not accepted, ignoring incoming call for conversation: ${conversation.idForLogging()}`);
                    this.addCallHistoryForFailedIncomingCall(conversation, call);
                    return null;
                }
                this.attachToCall(conversation, call);
                this.uxActions.incomingCall({
                    callDetails: this.getUxCallDetails(conversation, call),
                });
                return await this.getCallSettings(conversation);
            }
            catch (err) {
                window.log.error(`Ignoring incoming call: ${err.stack}`);
                this.addCallHistoryForFailedIncomingCall(conversation, call);
                return null;
            }
        }
        handleAutoEndedIncomingCallRequest(remoteUserId, reason) {
            const conversation = window.ConversationController.get(remoteUserId);
            if (!conversation) {
                return;
            }
            this.addCallHistoryForAutoEndedIncomingCall(conversation, reason);
        }
        attachToCall(conversation, call) {
            const { uxActions } = this;
            if (!uxActions) {
                return;
            }
            let acceptedTime;
            call.handleStateChanged = () => {
                if (call.state === ringrtc_1.CallState.Accepted) {
                    acceptedTime = Date.now();
                }
                else if (call.state === ringrtc_1.CallState.Ended) {
                    this.addCallHistoryForEndedCall(conversation, call, acceptedTime);
                }
                uxActions.callStateChange({
                    callState: call.state,
                    callDetails: this.getUxCallDetails(conversation, call),
                });
            };
            call.handleRemoteVideoEnabled = () => {
                uxActions.remoteVideoChange({
                    remoteVideoEnabled: call.remoteVideoEnabled,
                });
            };
        }
        async handleLogMessage(level, fileName, line, message) {
            // info/warn/error are only needed to be logged for now.
            // tslint:disable-next-line switch-default
            switch (level) {
                case ringrtc_1.CallLogLevel.Info:
                    window.log.info(`${fileName}:${line} ${message}`);
                    break;
                case ringrtc_1.CallLogLevel.Warn:
                    window.log.warn(`${fileName}:${line} ${message}`);
                    break;
                case ringrtc_1.CallLogLevel.Error:
                    window.log.error(`${fileName}:${line} ${message}`);
            }
        }
        getRemoteUserIdFromConversation(conversation) {
            const recipients = conversation.getRecipients();
            if (recipients.length !== 1) {
                return undefined;
            }
            return recipients[0];
        }
        get localDeviceId() {
            return this.parseDeviceId(window.textsecure.storage.user.getDeviceId());
        }
        parseDeviceId(deviceId) {
            if (typeof deviceId === 'string') {
                return parseInt(deviceId, 10);
            }
            if (typeof deviceId === 'number') {
                return deviceId;
            }
            return null;
        }
        async getCallSettings(conversation) {
            if (!window.textsecure.messaging) {
                throw new Error('getCallSettings: offline!');
            }
            const iceServerJson = await window.textsecure.messaging.server.getIceServers();
            const shouldRelayCalls = Boolean(await window.getAlwaysRelayCalls());
            // If the peer is 'unknown', i.e. not in the contact list, force IP hiding.
            const isContactUnknown = !conversation.getIsAddedByContact();
            return {
                iceServer: JSON.parse(iceServerJson),
                hideIp: shouldRelayCalls || isContactUnknown,
            };
        }
        getUxCallDetails(conversation, call) {
            return Object.assign(Object.assign({}, conversation.cachedProps), { callId: call.callId, isIncoming: call.isIncoming, isVideoCall: call.isVideoCall });
        }
        addCallHistoryForEndedCall(conversation, call, acceptedTime) {
            const { endedReason, isIncoming } = call;
            const wasAccepted = Boolean(acceptedTime);
            const isOutgoing = !isIncoming;
            const wasDeclined = !wasAccepted &&
                (endedReason === ringrtc_1.CallEndedReason.Declined ||
                    endedReason === ringrtc_1.CallEndedReason.DeclinedOnAnotherDevice ||
                    (isIncoming && endedReason === ringrtc_1.CallEndedReason.LocalHangup) ||
                    (isOutgoing && endedReason === ringrtc_1.CallEndedReason.RemoteHangup) ||
                    (isOutgoing &&
                        endedReason === ringrtc_1.CallEndedReason.RemoteHangupNeedPermission));
            if (call.endedReason === ringrtc_1.CallEndedReason.AcceptedOnAnotherDevice) {
                // tslint:disable-next-line no-parameter-reassignment
                acceptedTime = Date.now();
            }
            const callHistoryDetails = {
                wasIncoming: call.isIncoming,
                wasVideoCall: call.isVideoCall,
                wasDeclined,
                acceptedTime,
                endedTime: Date.now(),
            };
            conversation.addCallHistory(callHistoryDetails);
        }
        addCallHistoryForFailedIncomingCall(conversation, call) {
            const callHistoryDetails = {
                wasIncoming: true,
                wasVideoCall: call.isVideoCall,
                // Since the user didn't decline, make sure it shows up as a missed call instead
                wasDeclined: false,
                acceptedTime: undefined,
                endedTime: Date.now(),
            };
            conversation.addCallHistory(callHistoryDetails);
        }
        addCallHistoryForAutoEndedIncomingCall(conversation, _reason) {
            const callHistoryDetails = {
                wasIncoming: true,
                // We don't actually know, but it doesn't seem that important in this case,
                // but we could maybe plumb this info through RingRTC
                wasVideoCall: false,
                // Since the user didn't decline, make sure it shows up as a missed call instead
                wasDeclined: false,
                acceptedTime: undefined,
                endedTime: Date.now(),
            };
            conversation.addCallHistory(callHistoryDetails);
        }
    }
    exports.CallingClass = CallingClass;
    exports.calling = new CallingClass();
});