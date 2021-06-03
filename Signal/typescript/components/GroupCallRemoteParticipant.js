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
    const classnames_1 = __importDefault(require("classnames"));
    const lodash_1 = require("lodash");
    const CallBackgroundBlur_1 = require("./CallBackgroundBlur");
    const Avatar_1 = require("./Avatar");
    const ContactName_1 = require("./conversation/ContactName");
    // The max size video frame we'll support (in RGBA)
    const FRAME_BUFFER_SIZE = 1920 * 1080 * 4;
    exports.GroupCallRemoteParticipant = react_1.default.memo(props => {
        const { getGroupCallVideoFrameSource } = props;
        const { avatarPath, color, profileName, title, demuxId, hasRemoteAudio, hasRemoteVideo, } = props.remoteParticipant;
        const [isWide, setIsWide] = react_1.useState(true);
        const [hasHover, setHover] = react_1.useState(false);
        const remoteVideoRef = react_1.useRef(null);
        const canvasContextRef = react_1.useRef(null);
        const frameBufferRef = react_1.useRef(new ArrayBuffer(FRAME_BUFFER_SIZE));
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
            const frameDimensions = videoFrameSource.receiveVideoFrame(frameBufferRef.current);
            if (!frameDimensions) {
                return;
            }
            const [frameWidth, frameHeight] = frameDimensions;
            if (frameWidth < 2 || frameHeight < 2) {
                return;
            }
            canvasEl.width = frameWidth;
            canvasEl.height = frameHeight;
            canvasContext.putImageData(new ImageData(new Uint8ClampedArray(frameBufferRef.current, 0, frameWidth * frameHeight * 4), frameWidth, frameHeight), 0, 0);
            setIsWide(frameWidth > frameHeight);
        }, [videoFrameSource]);
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
        return (react_1.default.createElement("div", { className: "module-ongoing-call__group-call-remote-participant", onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), style: containerStyles },
            showHover && (react_1.default.createElement("div", {
                className: classnames_1.default('module-ongoing-call__group-call-remote-participant--title', {
                    'module-ongoing-call__group-call-remote-participant--audio-muted': !hasRemoteAudio,
                })
            },
                react_1.default.createElement(ContactName_1.ContactName, { module: "module-ongoing-call__group-call-remote-participant--contact-name", profileName: profileName, title: title, i18n: props.i18n }))),
            hasRemoteVideo ? (react_1.default.createElement("canvas", {
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
            })) : (react_1.default.createElement(CallBackgroundBlur_1.CallBackgroundBlur, { avatarPath: avatarPath, color: color },
                react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color || 'ultramarine', noteToSelf: false, conversationType: "direct", i18n: props.i18n, profileName: profileName, title: title, size: avatarSize })))));
    });
});