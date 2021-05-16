require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const CallingButton_1 = require("./CallingButton");
    const CallBackgroundBlur_1 = require("./CallBackgroundBlur");
    exports.CallingLobby = ({ availableCameras, callDetails, hasLocalAudio, hasLocalVideo, i18n, isGroupCall = false, onCallCanceled, onJoinCall, setLocalAudio, setLocalPreview, setLocalVideo, toggleParticipants, toggleSettings, }) => {
        const localVideoRef = react_1.default.useRef(null);
        const toggleAudio = react_1.default.useCallback(() => {
            if (!callDetails) {
                return;
            }
            setLocalAudio({ enabled: !hasLocalAudio });
        }, [callDetails, hasLocalAudio, setLocalAudio]);
        const toggleVideo = react_1.default.useCallback(() => {
            if (!callDetails) {
                return;
            }
            setLocalVideo({ enabled: !hasLocalVideo });
        }, [callDetails, hasLocalVideo, setLocalVideo]);
        react_1.default.useEffect(() => {
            setLocalPreview({ element: localVideoRef });
            return () => {
                setLocalPreview({ element: undefined });
            };
        }, [setLocalPreview]);
        react_1.default.useEffect(() => {
            function handleKeyDown(event) {
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
                }
            }
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }, [toggleVideo, toggleAudio]);
        // eslint-disable-next-line no-nested-ternary
        const videoButtonType = hasLocalVideo
            ? CallingButton_1.CallingButtonType.VIDEO_ON
            : availableCameras.length === 0
                ? CallingButton_1.CallingButtonType.VIDEO_DISABLED
                : CallingButton_1.CallingButtonType.VIDEO_OFF;
        const audioButtonType = hasLocalAudio
            ? CallingButton_1.CallingButtonType.AUDIO_ON
            : CallingButton_1.CallingButtonType.AUDIO_OFF;
        return (react_1.default.createElement("div", { className: "module-calling__container" },
            react_1.default.createElement("div", { className: "module-calling__header" },
                react_1.default.createElement("div", { className: "module-calling__header--header-name" }, callDetails.title),
                react_1.default.createElement("div", { className: "module-calling-tools" },
                    isGroupCall ? (react_1.default.createElement("button", { type: "button", "aria-label": i18n('calling__participants'), className: "module-calling-tools__button module-calling-button__participants", onClick: toggleParticipants })) : null,
                    react_1.default.createElement("button", { type: "button", "aria-label": i18n('callingDeviceSelection__settings'), className: "module-calling-tools__button module-calling-button__settings", onClick: toggleSettings }))),
            react_1.default.createElement("div", { className: "module-calling-lobby__video" },
                hasLocalVideo && availableCameras.length > 0 ? (react_1.default.createElement("video", { ref: localVideoRef, autoPlay: true })) : (react_1.default.createElement(CallBackgroundBlur_1.CallBackgroundBlur, { avatarPath: callDetails.avatarPath, color: callDetails.color },
                    react_1.default.createElement("div", { className: "module-calling-lobby__video-off--icon" }),
                    react_1.default.createElement("span", { className: "module-calling-lobby__video-off--text" }, i18n('calling__your-video-is-off')))),
                react_1.default.createElement("div", { className: "module-calling__buttons" },
                    react_1.default.createElement(CallingButton_1.CallingButton, { buttonType: videoButtonType, i18n: i18n, onClick: toggleVideo, tooltipDirection: CallingButton_1.TooltipDirection.UP, tooltipDistance: 24 }),
                    react_1.default.createElement(CallingButton_1.CallingButton, { buttonType: audioButtonType, i18n: i18n, onClick: toggleAudio, tooltipDirection: CallingButton_1.TooltipDirection.UP, tooltipDistance: 24 }))),
            react_1.default.createElement("div", { className: "module-calling-lobby__actions" },
                react_1.default.createElement("button", { className: "module-button__gray module-calling-lobby__button", onClick: onCallCanceled, tabIndex: 0, type: "button" }, i18n('cancel')),
                react_1.default.createElement("button", { className: "module-button__green module-calling-lobby__button", onClick: onJoinCall, tabIndex: 0, type: "button" }, isGroupCall ? i18n('calling__join') : i18n('calling__start')))));
    };
});