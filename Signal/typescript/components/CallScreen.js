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
    exports.CallScreen = ({ callDetails, callState, hangUp, hasLocalAudio, hasLocalVideo, hasRemoteVideo, i18n, me, setLocalAudio, setLocalVideo, setLocalPreview, setRendererCanvas, togglePip, toggleSettings, }) => {
        const { acceptedTime, callId } = callDetails || {};
        const toggleAudio = react_1.useCallback(() => {
            if (!callId) {
                return;
            }
            setLocalAudio({
                callId,
                enabled: !hasLocalAudio,
            });
        }, [callId, setLocalAudio, hasLocalAudio]);
        const toggleVideo = react_1.useCallback(() => {
            if (!callId) {
                return;
            }
            setLocalVideo({
                callId,
                enabled: !hasLocalVideo,
            });
        }, [callId, setLocalVideo, hasLocalVideo]);
        const [acceptedDuration, setAcceptedDuration] = react_1.useState(null);
        const [showControls, setShowControls] = react_1.useState(true);
        const localVideoRef = react_1.useRef(null);
        const remoteVideoRef = react_1.useRef(null);
        react_1.useEffect(() => {
            setLocalPreview({ element: localVideoRef });
            setRendererCanvas({ element: remoteVideoRef });
            return () => {
                setLocalPreview({ element: undefined });
                setRendererCanvas({ element: undefined });
            };
        }, [setLocalPreview, setRendererCanvas]);
        react_1.useEffect(() => {
            if (!acceptedTime) {
                return lodash_1.noop;
            }
            // It's really jumpy with a value of 500ms.
            const interval = setInterval(() => {
                setAcceptedDuration(Date.now() - acceptedTime);
            }, 100);
            return clearInterval.bind(null, interval);
        }, [acceptedTime]);
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
        const isAudioOnly = !hasLocalVideo && !hasRemoteVideo;
        if (!callDetails || !callState) {
            return null;
        }
        const controlsFadeClass = classnames_1.default({
            'module-ongoing-call__controls--fadeIn': (showControls || isAudioOnly) && callState !== Calling_1.CallState.Accepted,
            'module-ongoing-call__controls--fadeOut': !showControls && !isAudioOnly && callState === Calling_1.CallState.Accepted,
        });
        const videoButtonType = hasLocalVideo
            ? CallingButton_1.CallingButtonType.VIDEO_ON
            : CallingButton_1.CallingButtonType.VIDEO_OFF;
        const audioButtonType = hasLocalAudio
            ? CallingButton_1.CallingButtonType.AUDIO_ON
            : CallingButton_1.CallingButtonType.AUDIO_OFF;
        return (react_1.default.createElement("div", {
            className: "module-calling__container", onMouseMove: () => {
                setShowControls(true);
            }, role: "group"
        },
            react_1.default.createElement("div", { className: classnames_1.default('module-calling__header', 'module-ongoing-call__header', controlsFadeClass) },
                react_1.default.createElement("div", { className: "module-calling__header--header-name" }, callDetails.title),
                renderHeaderMessage(i18n, callState, acceptedDuration),
                react_1.default.createElement("div", { className: "module-calling-tools" },
                    react_1.default.createElement("button", { type: "button", "aria-label": i18n('callingDeviceSelection__settings'), className: "module-calling-tools__button module-calling-button__settings", onClick: toggleSettings }),
                    react_1.default.createElement("button", { type: "button", "aria-label": i18n('calling__pip'), className: "module-calling-tools__button module-calling-button__pip", onClick: togglePip }))),
            hasRemoteVideo ? (react_1.default.createElement("canvas", { className: "module-ongoing-call__remote-video-enabled", ref: remoteVideoRef })) : (renderAvatar(i18n, callDetails)),
            react_1.default.createElement("div", { className: "module-ongoing-call__footer" },
                react_1.default.createElement("div", { className: "module-ongoing-call__footer__local-preview-offset" }),
                react_1.default.createElement("div", { className: classnames_1.default('module-ongoing-call__footer__actions', controlsFadeClass) },
                    react_1.default.createElement(CallingButton_1.CallingButton, { buttonType: videoButtonType, i18n: i18n, onClick: toggleVideo, tooltipDistance: 24 }),
                    react_1.default.createElement(CallingButton_1.CallingButton, { buttonType: audioButtonType, i18n: i18n, onClick: toggleAudio, tooltipDistance: 24 }),
                    react_1.default.createElement(CallingButton_1.CallingButton, {
                        buttonType: CallingButton_1.CallingButtonType.HANG_UP, i18n: i18n, onClick: () => {
                            hangUp({ callId });
                        }, tooltipDistance: 24
                    })),
                react_1.default.createElement("div", { className: "module-ongoing-call__footer__local-preview" }, hasLocalVideo ? (react_1.default.createElement("video", { className: "module-ongoing-call__footer__local-preview__video", ref: localVideoRef, autoPlay: true })) : (react_1.default.createElement(CallBackgroundBlur_1.CallBackgroundBlur, { avatarPath: me.avatarPath, color: me.color },
                    react_1.default.createElement(Avatar_1.Avatar, { avatarPath: me.avatarPath, color: me.color || 'ultramarine', noteToSelf: false, conversationType: "direct", i18n: i18n, name: me.name, phoneNumber: me.phoneNumber, profileName: me.profileName, title: me.title, size: 80 })))))));
    };
    function renderAvatar(i18n, callDetails) {
        const { avatarPath, color, name, phoneNumber, profileName, title, } = callDetails;
        return (react_1.default.createElement("div", { className: "module-ongoing-call__remote-video-disabled" },
            react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color || 'ultramarine', noteToSelf: false, conversationType: "direct", i18n: i18n, name: name, phoneNumber: phoneNumber, profileName: profileName, title: title, size: 112 })));
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