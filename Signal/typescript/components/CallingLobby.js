require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const react_measure_1 = __importDefault(require("react-measure"));
    const lodash_1 = require("lodash");
    const CallingButton_1 = require("./CallingButton");
    const Tooltip_1 = require("./Tooltip");
    const CallBackgroundBlur_1 = require("./CallBackgroundBlur");
    const CallingHeader_1 = require("./CallingHeader");
    const Spinner_1 = require("./Spinner");
    const constants_1 = require("../calling/constants");
    // We request dimensions but may not get them depending on the user's webcam. This is our
    //   fallback while we don't know.
    const VIDEO_ASPECT_RATIO_FALLBACK = constants_1.REQUESTED_VIDEO_WIDTH / constants_1.REQUESTED_VIDEO_HEIGHT;
    exports.CallingLobby = ({ availableCameras, conversation, hasLocalAudio, hasLocalVideo, i18n, isGroupCall = false, isCallFull = false, me, onCallCanceled, onJoinCall, peekedParticipants, setLocalAudio, setLocalPreview, setLocalVideo, showParticipantsList, toggleParticipants, toggleSettings, }) => {
        const [localPreviewContainerWidth, setLocalPreviewContainerWidth,] = react_1.default.useState(null);
        const [localPreviewContainerHeight, setLocalPreviewContainerHeight,] = react_1.default.useState(null);
        const [localVideoAspectRatio, setLocalVideoAspectRatio] = react_1.default.useState(VIDEO_ASPECT_RATIO_FALLBACK);
        const localVideoRef = react_1.default.useRef(null);
        const toggleAudio = react_1.default.useCallback(() => {
            setLocalAudio({ enabled: !hasLocalAudio });
        }, [hasLocalAudio, setLocalAudio]);
        const toggleVideo = react_1.default.useCallback(() => {
            setLocalVideo({ enabled: !hasLocalVideo });
        }, [hasLocalVideo, setLocalVideo]);
        const hasEverMeasured = localPreviewContainerWidth !== null && localPreviewContainerHeight !== null;
        const setLocalPreviewContainerDimensions = react_1.default.useMemo(() => {
            const set = (bounds) => {
                setLocalPreviewContainerWidth(bounds.width);
                setLocalPreviewContainerHeight(bounds.height);
            };
            if (hasEverMeasured) {
                return lodash_1.debounce(set, 100, { maxWait: 3000 });
            }
            return set;
        }, [
            hasEverMeasured,
            setLocalPreviewContainerWidth,
            setLocalPreviewContainerHeight,
        ]);
        react_1.default.useEffect(() => {
            setLocalPreview({ element: localVideoRef });
            return () => {
                setLocalPreview({ element: undefined });
            };
        }, [setLocalPreview]);
        // This isn't perfect because it doesn't react to changes in the webcam's aspect ratio.
        //   For example, if you changed from Webcam A to Webcam B and Webcam B had a different
        //   aspect ratio, we wouldn't update.
        //
        // Unfortunately, RingRTC (1) doesn't update these dimensions with the "real" camera
        //   dimensions (2) doesn't give us any hooks or callbacks. For now, this works okay.
        //   We have `object-fit: contain` in the CSS in case we're wrong; not ideal, but
        //   usable.
        react_1.default.useEffect(() => {
            const videoEl = localVideoRef.current;
            if (hasLocalVideo && videoEl && videoEl.width && videoEl.height) {
                setLocalVideoAspectRatio(videoEl.width / videoEl.height);
            }
        }, [hasLocalVideo, setLocalVideoAspectRatio]);
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
        let localPreviewStyles;
        // It'd be nice to use `hasEverMeasured` here, too, but TypeScript isn't smart enough
        //   to understand the logic here.
        if (localPreviewContainerWidth !== null &&
            localPreviewContainerHeight !== null) {
            const containerAspectRatio = localPreviewContainerWidth / localPreviewContainerHeight;
            localPreviewStyles =
                containerAspectRatio < localVideoAspectRatio
                    ? {
                        width: '100%',
                        height: Math.floor(localPreviewContainerWidth / localVideoAspectRatio),
                    }
                    : {
                        width: Math.floor(localPreviewContainerHeight * localVideoAspectRatio),
                        height: '100%',
                    };
        }
        else {
            localPreviewStyles = { display: 'none' };
        }
        return (react_1.default.createElement("div", { className: "module-calling__container" },
            react_1.default.createElement(CallingHeader_1.CallingHeader, { title: conversation.title, i18n: i18n, isGroupCall: isGroupCall, participantCount: peekedParticipants.length, showParticipantsList: showParticipantsList, toggleParticipants: toggleParticipants, toggleSettings: toggleSettings }),
            react_1.default.createElement(react_measure_1.default, {
                bounds: true, onResize: ({ bounds }) => {
                    if (!bounds) {
                        window.log.error('We should be measuring bounds');
                        return;
                    }
                    setLocalPreviewContainerDimensions(bounds);
                }
            }, ({ measureRef }) => (react_1.default.createElement("div", { ref: measureRef, className: "module-calling-lobby__local-preview-container" },
                react_1.default.createElement("div", { className: "module-calling-lobby__local-preview", style: localPreviewStyles },
                    hasLocalVideo && availableCameras.length > 0 ? (react_1.default.createElement("video", { className: "module-calling-lobby__local-preview__video-on", ref: localVideoRef, autoPlay: true })) : (react_1.default.createElement(CallBackgroundBlur_1.CallBackgroundBlur, { avatarPath: me.avatarPath, color: me.color },
                        react_1.default.createElement("div", { className: "module-calling-lobby__local-preview__video-off__icon" }),
                        react_1.default.createElement("span", { className: "module-calling-lobby__local-preview__video-off__text" }, i18n('calling__your-video-is-off')))),
                    react_1.default.createElement("div", { className: "module-calling__buttons" },
                        react_1.default.createElement(CallingButton_1.CallingButton, { buttonType: videoButtonType, i18n: i18n, onClick: toggleVideo, tooltipDirection: Tooltip_1.TooltipPlacement.Top }),
                        react_1.default.createElement(CallingButton_1.CallingButton, { buttonType: audioButtonType, i18n: i18n, onClick: toggleAudio, tooltipDirection: Tooltip_1.TooltipPlacement.Top })))))),
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