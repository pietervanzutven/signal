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
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importStar(require("react"));
    const lodash_1 = require("lodash");
    const classnames_1 = __importDefault(require("classnames"));
    const Avatar_1 = require("./Avatar");
    const CallingButton_1 = require("./CallingButton");
    const CallBackgroundBlur_1 = require("./CallBackgroundBlur");
    const Calling_1 = require("../types/Calling");
    const missingCaseError_1 = require("../util/missingCaseError");
    const DirectCallRemoteParticipant_1 = require("./DirectCallRemoteParticipant");
    const GroupCallRemoteParticipants_1 = require("./GroupCallRemoteParticipants");
    exports.CallScreen = ({ call, conversation, createCanvasVideoRenderer, getGroupCallVideoFrameSource, hangUp, hasLocalAudio, hasLocalVideo, i18n, joinedAt, me, setLocalAudio, setLocalVideo, setLocalPreview, setRendererCanvas, togglePip, toggleSettings, }) => {
        const toggleAudio = react_1.useCallback(() => {
            setLocalAudio({
                enabled: !hasLocalAudio,
            });
        }, [setLocalAudio, hasLocalAudio]);
        const toggleVideo = react_1.useCallback(() => {
            setLocalVideo({
                enabled: !hasLocalVideo,
            });
        }, [setLocalVideo, hasLocalVideo]);
        const [acceptedDuration, setAcceptedDuration] = react_1.useState(null);
        const [showControls, setShowControls] = react_1.useState(true);
        const localVideoRef = react_1.useRef(null);
        react_1.useEffect(() => {
            setLocalPreview({ element: localVideoRef });
            return () => {
                setLocalPreview({ element: undefined });
            };
        }, [setLocalPreview, setRendererCanvas]);
        react_1.useEffect(() => {
            if (!joinedAt) {
                return lodash_1.noop;
            }
            // It's really jumpy with a value of 500ms.
            const interval = setInterval(() => {
                setAcceptedDuration(Date.now() - joinedAt);
            }, 100);
            return clearInterval.bind(null, interval);
        }, [joinedAt]);
        react_1.useEffect(() => {
            if (!showControls) {
                return lodash_1.noop;
            }
            const timer = setTimeout(() => {
                setShowControls(false);
            }, 5000);
            return clearInterval.bind(null, timer);
        }, [showControls]);
        react_1.useEffect(() => {
            const handleKeyDown = (event) => {
                let eventHandled = false;
                if (event.shiftKey && (event.key === 'V' || event.key === 'v')) {
                    toggleVideo();
                    eventHandled = true;
                }
                else if (event.shiftKey && (event.key === 'M' || event.key === 'm')) {
                    toggleAudio();
                    eventHandled = true;
                }
                if (eventHandled) {
                    event.preventDefault();
                    event.stopPropagation();
                    setShowControls(true);
                }
            };
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }, [toggleAudio, toggleVideo]);
        let hasRemoteVideo;
        let isConnected;
        let remoteParticipants;
        switch (call.callMode) {
            case Calling_1.CallMode.Direct:
                hasRemoteVideo = Boolean(call.hasRemoteVideo);
                isConnected = call.callState === Calling_1.CallState.Accepted;
                remoteParticipants = (react_1.default.createElement(DirectCallRemoteParticipant_1.DirectCallRemoteParticipant, { conversation: conversation, hasRemoteVideo: hasRemoteVideo, i18n: i18n, setRendererCanvas: setRendererCanvas }));
                break;
            case Calling_1.CallMode.Group:
                hasRemoteVideo = call.remoteParticipants.some(remoteParticipant => remoteParticipant.hasRemoteVideo);
                isConnected = call.connectionState === Calling_1.GroupCallConnectionState.Connected;
                remoteParticipants = (react_1.default.createElement(GroupCallRemoteParticipants_1.GroupCallRemoteParticipants, { remoteParticipants: call.remoteParticipants, createCanvasVideoRenderer: createCanvasVideoRenderer, getGroupCallVideoFrameSource: getGroupCallVideoFrameSource }));
                break;
            default:
                throw missingCaseError_1.missingCaseError(call);
        }
        const videoButtonType = hasLocalVideo
            ? CallingButton_1.CallingButtonType.VIDEO_ON
            : CallingButton_1.CallingButtonType.VIDEO_OFF;
        const audioButtonType = hasLocalAudio
            ? CallingButton_1.CallingButtonType.AUDIO_ON
            : CallingButton_1.CallingButtonType.AUDIO_OFF;
        const isAudioOnly = !hasLocalVideo && !hasRemoteVideo;
        const controlsFadeClass = classnames_1.default({
            'module-ongoing-call__controls--fadeIn': (showControls || isAudioOnly) && !isConnected,
            'module-ongoing-call__controls--fadeOut': !showControls && !isAudioOnly && isConnected,
        });
        return (react_1.default.createElement("div", {
            className: classnames_1.default('module-calling__container', `module-ongoing-call__container--${getCallModeClassSuffix(call.callMode)}`), onMouseMove: () => {
                setShowControls(true);
            }, role: "group"
        },
            react_1.default.createElement("div", { className: classnames_1.default('module-calling__header', 'module-ongoing-call__header', controlsFadeClass) },
                react_1.default.createElement("div", { className: "module-calling__header--header-name" }, conversation.title),
                call.callMode === Calling_1.CallMode.Direct &&
                renderHeaderMessage(i18n, call.callState || Calling_1.CallState.Prering, acceptedDuration),
                react_1.default.createElement("div", { className: "module-calling-tools" },
                    react_1.default.createElement("button", { type: "button", "aria-label": i18n('callingDeviceSelection__settings'), className: "module-calling-tools__button module-calling-button__settings", onClick: toggleSettings }),
                    call.callMode === Calling_1.CallMode.Direct && (react_1.default.createElement("button", { type: "button", "aria-label": i18n('calling__pip'), className: "module-calling-tools__button module-calling-button__pip", onClick: togglePip })))),
            remoteParticipants,
            react_1.default.createElement("div", { className: "module-ongoing-call__footer" },
                react_1.default.createElement("div", { className: "module-ongoing-call__footer__local-preview-offset" }),
                react_1.default.createElement("div", { className: classnames_1.default('module-ongoing-call__footer__actions', controlsFadeClass) },
                    react_1.default.createElement(CallingButton_1.CallingButton, { buttonType: videoButtonType, i18n: i18n, onClick: toggleVideo, tooltipDistance: 24 }),
                    react_1.default.createElement(CallingButton_1.CallingButton, { buttonType: audioButtonType, i18n: i18n, onClick: toggleAudio, tooltipDistance: 24 }),
                    react_1.default.createElement(CallingButton_1.CallingButton, {
                        buttonType: CallingButton_1.CallingButtonType.HANG_UP, i18n: i18n, onClick: () => {
                            hangUp({ conversationId: conversation.id });
                        }, tooltipDistance: 24
                    })),
                react_1.default.createElement("div", {
                    className: classnames_1.default('module-ongoing-call__footer__local-preview', {
                        'module-ongoing-call__footer__local-preview--audio-muted': !hasLocalAudio,
                    })
                }, hasLocalVideo ? (react_1.default.createElement("video", { className: "module-ongoing-call__footer__local-preview__video", ref: localVideoRef, autoPlay: true })) : (react_1.default.createElement(CallBackgroundBlur_1.CallBackgroundBlur, { avatarPath: me.avatarPath, color: me.color },
                    react_1.default.createElement(Avatar_1.Avatar, { avatarPath: me.avatarPath, color: me.color || 'ultramarine', noteToSelf: false, conversationType: "direct", i18n: i18n, name: me.name, phoneNumber: me.phoneNumber, profileName: me.profileName, title: me.title, size: 80 })))))));
    };
    function getCallModeClassSuffix(callMode) {
        switch (callMode) {
            case Calling_1.CallMode.Direct:
                return 'direct';
            case Calling_1.CallMode.Group:
                return 'group';
            default:
                throw missingCaseError_1.missingCaseError(callMode);
        }
    }
    function renderHeaderMessage(i18n, callState, acceptedDuration) {
        let message = null;
        if (callState === Calling_1.CallState.Prering) {
            message = i18n('outgoingCallPrering');
        }
        else if (callState === Calling_1.CallState.Ringing) {
            message = i18n('outgoingCallRinging');
        }
        else if (callState === Calling_1.CallState.Reconnecting) {
            message = i18n('callReconnecting');
        }
        else if (callState === Calling_1.CallState.Accepted && acceptedDuration) {
            message = i18n('callDuration', [renderDuration(acceptedDuration)]);
        }
        if (!message) {
            return null;
        }
        return react_1.default.createElement("div", { className: "module-ongoing-call__header-message" }, message);
    }
    function renderDuration(ms) {
        const secs = Math.floor((ms / 1000) % 60)
            .toString()
            .padStart(2, '0');
        const mins = Math.floor((ms / 60000) % 60)
            .toString()
            .padStart(2, '0');
        const hours = Math.floor(ms / 3600000);
        if (hours > 0) {
            return `${hours}:${mins}:${secs}`;
        }
        return `${mins}:${secs}`;
    }
});