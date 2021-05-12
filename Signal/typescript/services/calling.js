require(exports => {
    "use strict";
    /* eslint-disable class-methods-use-this */
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const ringrtc_1 = require("ringrtc");
    // ts-ignore
    const is_1 = __importDefault(require("@sindresorhus/is"));
    var ringrtc_2 = require("ringrtc");
    exports.CallState = ringrtc_2.CallState;
    exports.CanvasVideoRenderer = ringrtc_2.CanvasVideoRenderer;
    exports.GumVideoCapturer = ringrtc_2.GumVideoCapturer;
    class CallingClass {
        constructor() {
            this.videoCapturer = new ringrtc_1.GumVideoCapturer(640, 480, 30);
            this.videoRenderer = new ringrtc_1.CanvasVideoRenderer();
        }
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
            window.log.info('CallingClass.startOutgoingCall()');
            if (!this.uxActions) {
                window.log.error('Missing uxActions, new call not allowed.');
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
            window.log.info('CallingClass.startOutgoingCall(): Getting call settings');
            const callSettings = await this.getCallSettings(conversation);
            // Check state after awaiting to debounce call button.
            if (ringrtc_1.RingRTC.call && ringrtc_1.RingRTC.call.state !== ringrtc_1.CallState.Ended) {
                window.log.info('Call already in progress, new call not allowed.');
                return;
            }
            window.log.info('CallingClass.startOutgoingCall(): Starting in RingRTC');
            // We could make this faster by getting the call object
            // from the RingRTC before we lookup the ICE servers.
            const call = ringrtc_1.RingRTC.startOutgoingCall(remoteUserId, isVideoCall, this.localDeviceId, callSettings);
            await this.startDeviceReselectionTimer();
            ringrtc_1.RingRTC.setVideoCapturer(call.callId, this.videoCapturer);
            ringrtc_1.RingRTC.setVideoRenderer(call.callId, this.videoRenderer);
            this.attachToCall(conversation, call);
            this.uxActions.outgoingCall({
                callDetails: this.getUxCallDetails(conversation, call),
            });
        }
        async accept(callId, asVideoCall) {
            window.log.info('CallingClass.accept()');
            const haveMediaPermissions = await this.requestPermissions(asVideoCall);
            if (haveMediaPermissions) {
                await this.startDeviceReselectionTimer();
                ringrtc_1.RingRTC.setVideoCapturer(callId, this.videoCapturer);
                ringrtc_1.RingRTC.setVideoRenderer(callId, this.videoRenderer);
                ringrtc_1.RingRTC.accept(callId, asVideoCall);
            }
            else {
                window.log.info('Permissions were denied, call not allowed, hanging up.');
                ringrtc_1.RingRTC.hangup(callId);
            }
        }
        decline(callId) {
            window.log.info('CallingClass.decline()');
            ringrtc_1.RingRTC.decline(callId);
        }
        hangup(callId) {
            window.log.info('CallingClass.hangup()');
            ringrtc_1.RingRTC.hangup(callId);
        }
        setOutgoingAudio(callId, enabled) {
            ringrtc_1.RingRTC.setOutgoingAudio(callId, enabled);
        }
        setOutgoingVideo(callId, enabled) {
            ringrtc_1.RingRTC.setOutgoingVideo(callId, enabled);
        }
        async startDeviceReselectionTimer() {
            // Poll once
            await this.pollForMediaDevices();
            // Start the timer
            if (!this.deviceReselectionTimer) {
                this.deviceReselectionTimer = setInterval(async () => {
                    await this.pollForMediaDevices();
                }, 3000);
            }
        }
        stopDeviceReselectionTimer() {
            if (this.deviceReselectionTimer) {
                clearInterval(this.deviceReselectionTimer);
                this.deviceReselectionTimer = undefined;
            }
        }
        mediaDeviceSettingsEqual(a, b) {
            if (!a && !b) {
                return true;
            }
            if (!a || !b) {
                return false;
            }
            if (a.availableCameras.length !== b.availableCameras.length ||
                a.availableMicrophones.length !== b.availableMicrophones.length ||
                a.availableSpeakers.length !== b.availableSpeakers.length) {
                return false;
            }
            for (let i = 0; i < a.availableCameras.length; i += 1) {
                if (a.availableCameras[i].deviceId !== b.availableCameras[i].deviceId ||
                    a.availableCameras[i].groupId !== b.availableCameras[i].groupId ||
                    a.availableCameras[i].label !== b.availableCameras[i].label) {
                    return false;
                }
            }
            for (let i = 0; i < a.availableMicrophones.length; i += 1) {
                if (a.availableMicrophones[i].name !== b.availableMicrophones[i].name ||
                    a.availableMicrophones[i].uniqueId !==
                    b.availableMicrophones[i].uniqueId) {
                    return false;
                }
            }
            for (let i = 0; i < a.availableSpeakers.length; i += 1) {
                if (a.availableSpeakers[i].name !== b.availableSpeakers[i].name ||
                    a.availableSpeakers[i].uniqueId !== b.availableSpeakers[i].uniqueId) {
                    return false;
                }
            }
            if ((a.selectedCamera && !b.selectedCamera) ||
                (!a.selectedCamera && b.selectedCamera) ||
                (a.selectedMicrophone && !b.selectedMicrophone) ||
                (!a.selectedMicrophone && b.selectedMicrophone) ||
                (a.selectedSpeaker && !b.selectedSpeaker) ||
                (!a.selectedSpeaker && b.selectedSpeaker)) {
                return false;
            }
            if (a.selectedCamera &&
                b.selectedCamera &&
                a.selectedCamera !== b.selectedCamera) {
                return false;
            }
            if (a.selectedMicrophone &&
                b.selectedMicrophone &&
                a.selectedMicrophone.index !== b.selectedMicrophone.index) {
                return false;
            }
            if (a.selectedSpeaker &&
                b.selectedSpeaker &&
                a.selectedSpeaker.index !== b.selectedSpeaker.index) {
                return false;
            }
            return true;
        }
        async pollForMediaDevices() {
            var _a;
            const newSettings = await this.getMediaDeviceSettings();
            if (!this.mediaDeviceSettingsEqual(this.lastMediaDeviceSettings, newSettings)) {
                window.log.info('MediaDevice: available devices changed (from->to)', this.lastMediaDeviceSettings, newSettings);
                await this.selectPreferredDevices(newSettings);
                this.lastMediaDeviceSettings = newSettings;
                (_a = this.uxActions) === null || _a === void 0 ? void 0 : _a.refreshIODevices(newSettings);
            }
        }
        async getMediaDeviceSettings() {
            const availableMicrophones = ringrtc_1.RingRTC.getAudioInputs();
            const preferredMicrophone = window.storage.get('preferred-audio-input-device');
            const selectedMicIndex = this.findBestMatchingDeviceIndex(availableMicrophones, preferredMicrophone);
            const selectedMicrophone = selectedMicIndex !== undefined
                ? availableMicrophones[selectedMicIndex]
                : undefined;
            const availableSpeakers = ringrtc_1.RingRTC.getAudioOutputs();
            const preferredSpeaker = window.storage.get('preferred-audio-output-device');
            const selectedSpeakerIndex = this.findBestMatchingDeviceIndex(availableSpeakers, preferredSpeaker);
            const selectedSpeaker = selectedSpeakerIndex !== undefined
                ? availableSpeakers[selectedSpeakerIndex]
                : undefined;
            const availableCameras = await this.videoCapturer.enumerateDevices();
            const preferredCamera = window.storage.get('preferred-video-input-device');
            const selectedCamera = this.findBestMatchingCamera(availableCameras, preferredCamera);
            return {
                availableMicrophones,
                availableSpeakers,
                selectedMicrophone,
                selectedSpeaker,
                availableCameras,
                selectedCamera,
            };
        }
        findBestMatchingDeviceIndex(available, preferred) {
            if (!preferred) {
                // No preference stored
                return undefined;
            }
            // Match by uniqueId first, if available
            if (preferred.uniqueId) {
                const matchIndex = available.findIndex(d => d.uniqueId === preferred.uniqueId);
                if (matchIndex !== -1) {
                    return matchIndex;
                }
            }
            // Match by name second
            const matchingNames = available.filter(d => d.name === preferred.name);
            if (matchingNames.length > 0) {
                return matchingNames[0].index;
            }
            // Nothing matches; take the first device if there are any
            return available.length > 0 ? 0 : undefined;
        }
        findBestMatchingCamera(available, preferred) {
            const matchingId = available.filter(d => d.deviceId === preferred);
            const nonInfrared = available.filter(d => !d.label.includes('IR Camera'));
            // By default, pick the first non-IR camera (but allow the user to pick the
            // infrared if they so desire)
            if (matchingId.length > 0) {
                return matchingId[0].deviceId;
            }
            if (nonInfrared.length > 0) {
                return nonInfrared[0].deviceId;
            }
            return undefined;
        }
        setPreferredMicrophone(device) {
            window.log.info('MediaDevice: setPreferredMicrophone', device);
            window.storage.put('preferred-audio-input-device', device);
            ringrtc_1.RingRTC.setAudioInput(device.index);
        }
        setPreferredSpeaker(device) {
            window.log.info('MediaDevice: setPreferredSpeaker', device);
            window.storage.put('preferred-audio-output-device', device);
            ringrtc_1.RingRTC.setAudioOutput(device.index);
        }
        async setPreferredCamera(device) {
            window.log.info('MediaDevice: setPreferredCamera', device);
            window.storage.put('preferred-video-input-device', device);
            await this.videoCapturer.setPreferredDevice(device);
        }
        async handleCallingMessage(envelope, callingMessage) {
            window.log.info('CallingClass.handleCallingMessage()');
            const enableIncomingCalls = await window.getIncomingCallNotification();
            if (callingMessage.offer && !enableIncomingCalls) {
                // Drop offers silently if incoming call notifications are disabled.
                window.log.info('Incoming calls are disabled, ignoring call offer.');
                return;
            }
            const remoteUserId = envelope.sourceUuid || envelope.source;
            const remoteDeviceId = this.parseDeviceId(envelope.sourceDevice);
            if (!remoteUserId || !remoteDeviceId || !this.localDeviceId) {
                window.log.error('Missing identifier, ignoring call message.');
                return;
            }
            const senderIdentityRecord = window.textsecure.storage.protocol.getIdentityRecord(remoteUserId);
            if (!senderIdentityRecord) {
                window.log.error('Missing sender identity record; ignoring call message.');
                return;
            }
            const senderIdentityKey = senderIdentityRecord.publicKey.slice(1); // Ignore the type header, it is not used.
            const receiverIdentityRecord = window.textsecure.storage.protocol.getIdentityRecord(window.textsecure.storage.user.getUuid() ||
                window.textsecure.storage.user.getNumber());
            if (!receiverIdentityRecord) {
                window.log.error('Missing receiver identity record; ignoring call message.');
                return;
            }
            const receiverIdentityKey = receiverIdentityRecord.publicKey.slice(1); // Ignore the type header, it is not used.
            const messageAgeSec = envelope.messageAgeSec ? envelope.messageAgeSec : 0;
            window.log.info('CallingClass.handleCallingMessage(): Handling in RingRTC');
            ringrtc_1.RingRTC.handleCallingMessage(remoteUserId, remoteDeviceId, this.localDeviceId, messageAgeSec, callingMessage, senderIdentityKey, receiverIdentityKey);
        }
        async selectPreferredDevices(settings) {
            if ((!this.lastMediaDeviceSettings && settings.selectedCamera) ||
                (this.lastMediaDeviceSettings &&
                    settings.selectedCamera &&
                    this.lastMediaDeviceSettings.selectedCamera !== settings.selectedCamera)) {
                window.log.info('MediaDevice: selecting camera', settings.selectedCamera);
                await this.videoCapturer.setPreferredDevice(settings.selectedCamera);
            }
            // Assume that the MediaDeviceSettings have been obtained very recently and
            // the index is still valid (no devices have been plugged in in between).
            if (settings.selectedMicrophone) {
                window.log.info('MediaDevice: selecting microphone', settings.selectedMicrophone);
                ringrtc_1.RingRTC.setAudioInput(settings.selectedMicrophone.index);
            }
            if (settings.selectedSpeaker) {
                window.log.info('MediaDevice: selecting speaker', settings.selectedMicrophone);
                ringrtc_1.RingRTC.setAudioOutput(settings.selectedSpeaker.index);
            }
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
                return true;
            }
            return false;
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
        // If we return null here, we hang up the call.
        async handleIncomingCall(call) {
            window.log.info('CallingClass.handleIncomingCall()');
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
                window.log.info('CallingClass.handleIncomingCall(): Proceeding');
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
            // eslint-disable-next-line no-param-reassign
            call.handleStateChanged = () => {
                if (call.state === ringrtc_1.CallState.Accepted) {
                    acceptedTime = Date.now();
                }
                else if (call.state === ringrtc_1.CallState.Ended) {
                    this.addCallHistoryForEndedCall(conversation, call, acceptedTime);
                    this.stopDeviceReselectionTimer();
                    this.lastMediaDeviceSettings = undefined;
                }
                uxActions.callStateChange({
                    callState: call.state,
                    callDetails: this.getUxCallDetails(conversation, call),
                });
            };
            // eslint-disable-next-line no-param-reassign
            call.handleRemoteVideoEnabled = () => {
                uxActions.remoteVideoChange({
                    remoteVideoEnabled: call.remoteVideoEnabled,
                });
            };
        }
        async handleLogMessage(level, fileName, line, message) {
            switch (level) {
                case ringrtc_1.CallLogLevel.Info:
                    window.log.info(`${fileName}:${line} ${message}`);
                    break;
                case ringrtc_1.CallLogLevel.Warn:
                    window.log.warn(`${fileName}:${line} ${message}`);
                    break;
                case ringrtc_1.CallLogLevel.Error:
                    window.log.error(`${fileName}:${line} ${message}`);
                    break;
                default:
                    break;
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
            const isContactUnknown = !conversation.isFromOrAddedByTrustedContact();
            return {
                iceServer: JSON.parse(iceServerJson),
                hideIp: shouldRelayCalls || isContactUnknown,
            };
        }
        getUxCallDetails(conversation, call) {
            // Does not meet CallDetailsType interface requirements
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return Object.assign(Object.assign({}, conversation.cachedProps), { callId: call.callId, isIncoming: call.isIncoming, isVideoCall: call.isVideoCall });
        }
        addCallHistoryForEndedCall(conversation, call, acceptedTimeParam) {
            let acceptedTime = acceptedTimeParam;
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