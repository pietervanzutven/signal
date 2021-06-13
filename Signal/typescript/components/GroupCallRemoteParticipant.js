require(exports => {
    "use strict";
    // Copyright 2020-2021 Signal Messenger, LLC
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
    exports.GroupCallRemoteParticipant = void 0;
    const react_1 = __importStar(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const lodash_1 = require("lodash");
    const CallBackgroundBlur_1 = require("./CallBackgroundBlur");
    const Avatar_1 = require("./Avatar");
    const ConfirmationModal_1 = require("./ConfirmationModal");
    const Intl_1 = require("./Intl");
    const ContactName_1 = require("./conversation/ContactName");
    const constants_1 = require("../calling/constants");
    exports.GroupCallRemoteParticipant = react_1.default.memo(props => {
        const { getFrameBuffer, getGroupCallVideoFrameSource, i18n } = props;
        const { avatarPath, color, demuxId, hasRemoteAudio, hasRemoteVideo, isBlocked, profileName, title, } = props.remoteParticipant;
        const [isWide, setIsWide] = react_1.useState(true);
        const [hasHover, setHover] = react_1.useState(false);
        const [showBlockInfo, setShowBlockInfo] = react_1.useState(false);
        const remoteVideoRef = react_1.useRef(null);
        const canvasContextRef = react_1.useRef(null);
        const videoFrameSource = react_1.useMemo(() => getGroupCallVideoFrameSource(demuxId), [getGroupCallVideoFrameSource, demuxId]);
        const renderVideoFrame = react_1.useCallback(() => {
            const canvasEl = remoteVideoRef.current;
            if (!canvasEl) {
                return;
            }
            const canvasContext = canvasContextRef.current;
            if (!canvasContext) {
                return;
            }
            // This frame buffer is shared by all participants, so it may contain pixel data
            //   for other participants, or pixel data from a previous frame. That's why we
            //   return early and use the `frameWidth` and `frameHeight`.
            const frameBuffer = getFrameBuffer();
            const frameDimensions = videoFrameSource.receiveVideoFrame(frameBuffer);
            if (!frameDimensions) {
                return;
            }
            const [frameWidth, frameHeight] = frameDimensions;
            if (frameWidth < 2 ||
                frameHeight < 2 ||
                frameWidth * frameHeight > constants_1.MAX_FRAME_SIZE) {
                return;
            }
            canvasEl.width = frameWidth;
            canvasEl.height = frameHeight;
            canvasContext.putImageData(new ImageData(new Uint8ClampedArray(frameBuffer, 0, frameWidth * frameHeight * 4), frameWidth, frameHeight), 0, 0);
            setIsWide(frameWidth > frameHeight);
        }, [getFrameBuffer, videoFrameSource]);
        react_1.useEffect(() => {
            if (!hasRemoteVideo) {
                return lodash_1.noop;
            }
            let rafId = requestAnimationFrame(tick);
            function tick() {
                renderVideoFrame();
                rafId = requestAnimationFrame(tick);
            }
            return () => {
                cancelAnimationFrame(rafId);
            };
        }, [hasRemoteVideo, renderVideoFrame, videoFrameSource]);
        let canvasStyles;
        let containerStyles;
        // If our `width` and `height` props don't match the canvas's aspect ratio, we want to
        //   fill the container. This can happen when RingRTC gives us an inaccurate
        //   `videoAspectRatio`, or if the container is an unexpected size.
        if (isWide) {
            canvasStyles = { width: '100%' };
        }
        else {
            canvasStyles = { height: '100%' };
        }
        let avatarSize;
        // TypeScript isn't smart enough to know that `isInPip` by itself disambiguates the
        //   types, so we have to use `props.isInPip` instead.
        // eslint-disable-next-line react/destructuring-assignment
        if (props.isInPip) {
            containerStyles = canvasStyles;
            avatarSize = Avatar_1.AvatarSize.FIFTY_TWO;
        }
        else {
            const { top, left, width, height } = props;
            const shorterDimension = Math.min(width, height);
            if (shorterDimension >= 240) {
                avatarSize = Avatar_1.AvatarSize.ONE_HUNDRED_TWELVE;
            }
            else if (shorterDimension >= 180) {
                avatarSize = Avatar_1.AvatarSize.EIGHTY;
            }
            else {
                avatarSize = Avatar_1.AvatarSize.FIFTY_TWO;
            }
            containerStyles = {
                height,
                left,
                position: 'absolute',
                top,
                width,
            };
        }
        const showHover = hasHover && !props.isInPip;
        const canShowVideo = hasRemoteVideo && !isBlocked;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            showBlockInfo && (react_1.default.createElement(ConfirmationModal_1.ConfirmationModal, {
                i18n: i18n, onClose: () => {
                    setShowBlockInfo(false);
                }, title: react_1.default.createElement("div", { className: "module-ongoing-call__group-call-remote-participant__blocked--modal-title" },
                    react_1.default.createElement(Intl_1.Intl, {
                        i18n: i18n, id: "calling__you-have-blocked", components: [
                            react_1.default.createElement(ContactName_1.ContactName, { key: "name", profileName: profileName, title: title, i18n: i18n }),
                        ]
                    })), actions: [
                        {
                            text: i18n('ok'),
                            action: () => {
                                setShowBlockInfo(false);
                            },
                            style: 'affirmative',
                        },
                    ]
            }, i18n('calling__block-info'))),
            react_1.default.createElement("div", { className: "module-ongoing-call__group-call-remote-participant", onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), style: containerStyles },
                showHover && (react_1.default.createElement("div", {
                    className: classnames_1.default('module-ongoing-call__group-call-remote-participant--title', {
                        'module-ongoing-call__group-call-remote-participant--audio-muted': !hasRemoteAudio,
                    })
                },
                    react_1.default.createElement(ContactName_1.ContactName, { module: "module-ongoing-call__group-call-remote-participant--contact-name", profileName: profileName, title: title, i18n: i18n }))),
                canShowVideo ? (react_1.default.createElement("canvas", {
                    className: "module-ongoing-call__group-call-remote-participant__remote-video", style: canvasStyles, ref: canvasEl => {
                        remoteVideoRef.current = canvasEl;
                        if (canvasEl) {
                            canvasContextRef.current = canvasEl.getContext('2d', {
                                alpha: false,
                                desynchronized: true,
                                storage: 'discardable',
                            });
                        }
                        else {
                            canvasContextRef.current = null;
                        }
                    }
                })) : (react_1.default.createElement(CallBackgroundBlur_1.CallBackgroundBlur, { avatarPath: avatarPath, color: color }, isBlocked ? (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement("i", { className: "module-ongoing-call__group-call-remote-participant__blocked" }),
                    react_1.default.createElement("button", {
                        type: "button", className: "module-ongoing-call__group-call-remote-participant__blocked--info", onClick: () => {
                            setShowBlockInfo(true);
                        }
                    }, i18n('moreInfo')))) : (react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color || 'ultramarine', noteToSelf: false, conversationType: "direct", i18n: i18n, profileName: profileName, title: title, size: avatarSize })))))));
    });
});