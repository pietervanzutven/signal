require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
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
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CallScreen = void 0;
    const react_1 = __importStar(require("react"));
    const lodash_1 = require("lodash");
    const classnames_1 = __importDefault(require("classnames"));
    const Avatar_1 = require("./Avatar");
    const CallingHeader_1 = require("./CallingHeader");
    const CallingButton_1 = require("./CallingButton");
    const CallBackgroundBlur_1 = require("./CallBackgroundBlur");
    const Calling_1 = require("../types/Calling");
    const missingCaseError_1 = require("../util/missingCaseError");
    const DirectCallRemoteParticipant_1 = require("./DirectCallRemoteParticipant");
    const GroupCallRemoteParticipants_1 = require("./GroupCallRemoteParticipants");
    const GroupCallToastManager_1 = require("./GroupCallToastManager");
    const CallScreen = ({ activeCall, getGroupCallVideoFrameSource, hangUp, i18n, joinedAt, me, setGroupCallVideoRequest, setLocalAudio, setLocalVideo, setLocalPreview, setRendererCanvas, stickyControls, toggleParticipants, togglePip, toggleSettings, }) => {
        const { conversation, hasLocalAudio, hasLocalVideo, showParticipantsList, } = activeCall;
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
            if (!showControls || stickyControls) {
                return lodash_1.noop;
            }
            const timer = setTimeout(() => {
                setShowControls(false);
            }, 5000);
            return clearInterval.bind(null, timer);
        }, [showControls, stickyControls]);
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
        const hasRemoteVideo = activeCall.remoteParticipants.some(remoteParticipant => remoteParticipant.hasRemoteVideo);
        let headerMessage;
        let headerTitle;
        let isConnected;
        let participantCount;
        let remoteParticipantsElement;
        switch (activeCall.callMode) {
            case Calling_1.CallMode.Direct:
                headerMessage = renderHeaderMessage(i18n, activeCall.callState || Calling_1.CallState.Prering, acceptedDuration);
                headerTitle = conversation.title;
                isConnected = activeCall.callState === Calling_1.CallState.Accepted;
                participantCount = isConnected ? 2 : 0;
                remoteParticipantsElement = (react_1.default.createElement(DirectCallRemoteParticipant_1.DirectCallRemoteParticipant, { conversation: conversation, hasRemoteVideo: hasRemoteVideo, i18n: i18n, setRendererCanvas: setRendererCanvas }));
                break;
            case Calling_1.CallMode.Group:
                participantCount = activeCall.remoteParticipants.length + 1;
                headerMessage = undefined;
                headerTitle = activeCall.remoteParticipants.length
                    ? undefined
                    : i18n('calling__in-this-call--zero');
                isConnected =
                    activeCall.connectionState === Calling_1.GroupCallConnectionState.Connected;
                remoteParticipantsElement = (react_1.default.createElement(GroupCallRemoteParticipants_1.GroupCallRemoteParticipants, { getGroupCallVideoFrameSource: getGroupCallVideoFrameSource, i18n: i18n, remoteParticipants: activeCall.remoteParticipants, setGroupCallVideoRequest: setGroupCallVideoRequest }));
                break;
            default:
                throw missingCaseError_1.missingCaseError(activeCall);
        }
        const isLonelyInGroup = activeCall.callMode === Calling_1.CallMode.Group &&
            !activeCall.remoteParticipants.length;
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
            className: classnames_1.default('module-calling__container', `module-ongoing-call__container--${getCallModeClassSuffix(activeCall.callMode)}`), onMouseMove: () => {
                setShowControls(true);
            }, role: "group"
        },
            activeCall.callMode === Calling_1.CallMode.Group ? (react_1.default.createElement(GroupCallToastManager_1.GroupCallToastManager, { connectionState: activeCall.connectionState, i18n: i18n })) : null,
            react_1.default.createElement("div", { className: classnames_1.default('module-ongoing-call__header', controlsFadeClass) },
                react_1.default.createElement(CallingHeader_1.CallingHeader, { canPip: true, i18n: i18n, isGroupCall: activeCall.callMode === Calling_1.CallMode.Group, message: headerMessage, participantCount: participantCount, showParticipantsList: showParticipantsList, title: headerTitle, toggleParticipants: toggleParticipants, togglePip: togglePip, toggleSettings: toggleSettings })),
            remoteParticipantsElement,
            hasLocalVideo && isLonelyInGroup ? (react_1.default.createElement("div", { className: "module-ongoing-call__local-preview-fullsize" },
                react_1.default.createElement("video", { className: "module-ongoing-call__footer__local-preview__video", ref: localVideoRef, autoPlay: true }))) : null,
            !hasLocalVideo && isLonelyInGroup ? (react_1.default.createElement("div", { className: "module-ongoing-call__local-preview-fullsize" },
                react_1.default.createElement(CallBackgroundBlur_1.CallBackgroundBlur, { avatarPath: me.avatarPath, color: me.color },
                    react_1.default.createElement(Avatar_1.Avatar, { avatarPath: me.avatarPath, color: me.color || 'ultramarine', noteToSelf: false, conversationType: "direct", i18n: i18n, name: me.name, phoneNumber: me.phoneNumber, profileName: me.profileName, title: me.title, size: 80 }),
                    react_1.default.createElement("div", { className: "module-calling__video-off--container" },
                        react_1.default.createElement("div", { className: "module-calling__video-off--icon" }),
                        react_1.default.createElement("span", { className: "module-calling__video-off--text" }, i18n('calling__your-video-is-off')))))) : null,
            react_1.default.createElement("div", { className: "module-ongoing-call__footer" },
                react_1.default.createElement("div", { className: "module-ongoing-call__footer__local-preview-offset" }),
                react_1.default.createElement("div", { className: classnames_1.default('module-ongoing-call__footer__actions', controlsFadeClass) },
                    react_1.default.createElement(CallingButton_1.CallingButton, { buttonType: videoButtonType, i18n: i18n, onClick: toggleVideo }),
                    react_1.default.createElement(CallingButton_1.CallingButton, { buttonType: audioButtonType, i18n: i18n, onClick: toggleAudio }),
                    react_1.default.createElement(CallingButton_1.CallingButton, {
                        buttonType: CallingButton_1.CallingButtonType.HANG_UP, i18n: i18n, onClick: () => {
                            hangUp({ conversationId: conversation.id });
                        }
                    })),
                react_1.default.createElement("div", {
                    className: classnames_1.default('module-ongoing-call__footer__local-preview', {
                        'module-ongoing-call__footer__local-preview--audio-muted': !hasLocalAudio,
                    })
                },
                    hasLocalVideo && !isLonelyInGroup ? (react_1.default.createElement("video", { className: "module-ongoing-call__footer__local-preview__video", ref: localVideoRef, autoPlay: true })) : null,
                    !hasLocalVideo && !isLonelyInGroup ? (react_1.default.createElement(CallBackgroundBlur_1.CallBackgroundBlur, { avatarPath: me.avatarPath, color: me.color },
                        react_1.default.createElement(Avatar_1.Avatar, { avatarPath: me.avatarPath, color: me.color || 'ultramarine', noteToSelf: false, conversationType: "direct", i18n: i18n, name: me.name, phoneNumber: me.phoneNumber, profileName: me.profileName, title: me.title, size: 80 }))) : null))));
    };
    exports.CallScreen = CallScreen;
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
        let message;
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
        return message;
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