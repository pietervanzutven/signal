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
    // The max size video frame we'll support (in RGBA)
    const FRAME_BUFFER_SIZE = 1920 * 1080 * 4;
    exports.GroupCallRemoteParticipant = props => {
        const { demuxId, getGroupCallVideoFrameSource, hasRemoteAudio, hasRemoteVideo, } = props;
        const [canvasStyles, setCanvasStyles] = react_1.useState({});
        const remoteVideoRef = react_1.useRef(null);
        const rafIdRef = react_1.useRef(null);
        const frameBufferRef = react_1.useRef(new ArrayBuffer(FRAME_BUFFER_SIZE));
        const videoFrameSource = react_1.useMemo(() => getGroupCallVideoFrameSource(demuxId), [getGroupCallVideoFrameSource, demuxId]);
        const renderVideoFrame = react_1.useCallback(() => {
            const canvasEl = remoteVideoRef.current;
            if (!canvasEl) {
                return;
            }
            const context = canvasEl.getContext('2d');
            if (!context) {
                return;
            }
            const frameDimensions = videoFrameSource.receiveVideoFrame(frameBufferRef.current);
            if (!frameDimensions) {
                return;
            }
            const [frameWidth, frameHeight] = frameDimensions;
            canvasEl.width = frameWidth;
            canvasEl.height = frameHeight;
            context.putImageData(new ImageData(new Uint8ClampedArray(frameBufferRef.current, 0, frameWidth * frameHeight * 4), frameWidth, frameHeight), 0, 0);
            // If our `width` and `height` props don't match the canvas's aspect ratio, we want to
            //   fill the container. This can happen when RingRTC gives us an inaccurate
            //   `videoAspectRatio`, or if the container is an unexpected size.
            if (frameWidth > frameHeight) {
                setCanvasStyles({ width: '100%' });
            }
            else {
                setCanvasStyles({ height: '100%' });
            }
        }, [videoFrameSource]);
        react_1.useEffect(() => {
            if (!hasRemoteVideo) {
                return lodash_1.noop;
            }
            const tick = () => {
                renderVideoFrame();
                rafIdRef.current = requestAnimationFrame(tick);
            };
            rafIdRef.current = requestAnimationFrame(tick);
            return () => {
                if (rafIdRef.current) {
                    cancelAnimationFrame(rafIdRef.current);
                    rafIdRef.current = null;
                }
            };
        }, [hasRemoteVideo, renderVideoFrame, videoFrameSource]);
        let containerStyles;
        // TypeScript isn't smart enough to know that `isInPip` by itself disambiguates the
        //   types, so we have to use `props.isInPip` instead.
        // eslint-disable-next-line react/destructuring-assignment
        if (props.isInPip) {
            containerStyles = canvasStyles;
        }
        else {
            const { top, left, width, height } = props;
            containerStyles = {
                height,
                left,
                position: 'absolute',
                top,
                width,
            };
        }
        return (react_1.default.createElement("div", {
            className: classnames_1.default('module-ongoing-call__group-call-remote-participant', {
                'module-ongoing-call__group-call-remote-participant--audio-muted': !hasRemoteAudio,
            }), style: containerStyles
        }, hasRemoteVideo ? (react_1.default.createElement("canvas", { className: "module-ongoing-call__group-call-remote-participant__remote-video", style: canvasStyles, ref: remoteVideoRef })) : (react_1.default.createElement(CallBackgroundBlur_1.CallBackgroundBlur, null,
            react_1.default.createElement("span", null)))));
    };
});