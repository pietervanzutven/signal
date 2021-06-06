require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const CallingButton_1 = require("./CallingButton");
    const Tooltip_1 = require("./Tooltip");
    const CallBackgroundBlur_1 = require("./CallBackgroundBlur");
    const CallingHeader_1 = require("./CallingHeader");
    const Spinner_1 = require("./Spinner");
    exports.CallingLobby = ({ availableCameras, conversation, hasLocalAudio, hasLocalVideo, i18n, isGroupCall = false, isCallFull = false, me, onCallCanceled, onJoinCall, peekedParticipants, setLocalAudio, setLocalPreview, setLocalVideo, showParticipantsList, toggleParticipants, toggleSettings, }) => {
        const localVideoRef = react_1.default.useRef(null);
        const toggleAudio = react_1.default.useCallback(() => {
            setLocalAudio({ enabled: !hasLocalAudio });
        }, [hasLocalAudio, setLocalAudio]);
        const toggleVideo = react_1.default.useCallback(() => {
            setLocalVideo({ enabled: !hasLocalVideo });
        }, [hasLocalVideo, setLocalVideo]);
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
        const [isCallConnecting, setIsCallConnecting] = react_1.default.useState(false);
        // eslint-disable-next-line no-nested-ternary
        const videoButtonType = hasLocalVideo
            ? CallingButton_1.CallingButtonType.VIDEO_ON
            : availableCameras.length === 0
                ? CallingButton_1.CallingButtonType.VIDEO_DISABLED
                : CallingButton_1.CallingButtonType.VIDEO_OFF;
        const audioButtonType = hasLocalAudio
            ? CallingButton_1.CallingButtonType.AUDIO_ON
            : CallingButton_1.CallingButtonType.AUDIO_OFF;
        // It should be rare to see yourself in this list, but it's possible if (1) you rejoin
        //   quickly, causing the server to return stale state (2) you have joined on another
        //   device.
        const participantNames = peekedParticipants.map(participant => participant.uuid === me.uuid
            ? i18n('you')
            : participant.firstName || participant.title);
        const hasYou = peekedParticipants.some(participant => participant.uuid === me.uuid);
        const canJoin = !isCallFull && !isCallConnecting;
        let joinButtonChildren;
        if (isCallFull) {
            joinButtonChildren = i18n('calling__call-is-full');
        }
        else if (isCallConnecting) {
            joinButtonChildren = react_1.default.createElement(Spinner_1.Spinner, { svgSize: "small" });
        }
        else if (peekedParticipants.length) {
            joinButtonChildren = i18n('calling__join');
        }
        else {
            joinButtonChildren = i18n('calling__start');
        }
        return (react_1.default.createElement("div", { className: "module-calling__container" },
            react_1.default.createElement(CallingHeader_1.CallingHeader, { title: conversation.title, i18n: i18n, isGroupCall: isGroupCall, participantCount: peekedParticipants.length, showParticipantsList: showParticipantsList, toggleParticipants: toggleParticipants, toggleSettings: toggleSettings }),
            react_1.default.createElement("div", { className: "module-calling-lobby__video" },
                hasLocalVideo && availableCameras.length > 0 ? (react_1.default.createElement("video", { className: "module-calling-lobby__video-on__video", ref: localVideoRef, autoPlay: true })) : (react_1.default.createElement(CallBackgroundBlur_1.CallBackgroundBlur, { avatarPath: me.avatarPath, color: me.color },
                    react_1.default.createElement("div", { className: "module-calling-lobby__video-off--icon" }),
                    react_1.default.createElement("span", { className: "module-calling-lobby__video-off--text" }, i18n('calling__your-video-is-off')))),
                react_1.default.createElement("div", { className: "module-calling__buttons" },
                    react_1.default.createElement(CallingButton_1.CallingButton, { buttonType: videoButtonType, i18n: i18n, onClick: toggleVideo, tooltipDirection: Tooltip_1.TooltipPlacement.Top }),
                    react_1.default.createElement(CallingButton_1.CallingButton, { buttonType: audioButtonType, i18n: i18n, onClick: toggleAudio, tooltipDirection: Tooltip_1.TooltipPlacement.Top }))),
            isGroupCall ? (react_1.default.createElement("div", { className: "module-calling-lobby__info" },
                participantNames.length === 0 &&
                i18n('calling__lobby-summary--zero'),
                participantNames.length === 1 &&
                hasYou &&
                i18n('calling__lobby-summary--self'),
                participantNames.length === 1 &&
                !hasYou &&
                i18n('calling__lobby-summary--single', participantNames),
                participantNames.length === 2 &&
                i18n('calling__lobby-summary--double', {
                    first: participantNames[0],
                    second: participantNames[1],
                }),
                participantNames.length === 3 &&
                i18n('calling__lobby-summary--triple', {
                    first: participantNames[0],
                    second: participantNames[1],
                    third: participantNames[2],
                }),
                participantNames.length > 3 &&
                i18n('calling__lobby-summary--many', {
                    first: participantNames[0],
                    second: participantNames[1],
                    others: String(participantNames.length - 2),
                }))) : null,
            react_1.default.createElement("div", { className: "module-calling-lobby__actions" },
                react_1.default.createElement("button", { className: "module-button__gray module-calling-lobby__button", onClick: onCallCanceled, tabIndex: 0, type: "button" }, i18n('cancel')),
                react_1.default.createElement("button", {
                    className: "module-button__green module-calling-lobby__button", disabled: !canJoin, onClick: canJoin
                        ? () => {
                            setIsCallConnecting(true);
                            onJoinCall();
                        }
                        : undefined, tabIndex: 0, type: "button"
                }, joinButtonChildren))));
    };
});