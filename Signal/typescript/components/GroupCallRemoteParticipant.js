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
    exports.GroupCallRemoteParticipant = ({ createCanvasVideoRenderer, demuxId, getGroupCallVideoFrameSource, hasRemoteAudio, hasRemoteVideo, height, left, top, width, }) => {
        const remoteVideoRef = react_1.useRef(null);
        const canvasVideoRendererRef = react_1.useRef(createCanvasVideoRenderer());
        react_1.useEffect(() => {
            const canvasVideoRenderer = canvasVideoRendererRef.current;
            if (hasRemoteVideo) {
                canvasVideoRenderer.setCanvas(remoteVideoRef);
                canvasVideoRenderer.enable(getGroupCallVideoFrameSource(demuxId));
                return () => {
                    canvasVideoRenderer.disable();
                };
            }
            canvasVideoRenderer.disable();
            return lodash_1.noop;
        }, [hasRemoteVideo, getGroupCallVideoFrameSource, demuxId]);
        // If our `width` and `height` props don't match the canvas's aspect ratio, we want to
        //   fill the container. This can happen when RingRTC gives us an inaccurate
        //   `videoAspectRatio`.
        const canvasStyles = {};
        const canvasEl = remoteVideoRef.current;
        if (hasRemoteVideo && canvasEl) {
            if (canvasEl.width > canvasEl.height) {
                canvasStyles.width = '100%';
            }
            else {
                canvasStyles.height = '100%';
            }
        }
        return (react_1.default.createElement("div", {
            className: classnames_1.default('module-ongoing-call__group-call-remote-participant', {
                'module-ongoing-call__group-call-remote-participant--audio-muted': !hasRemoteAudio,
            }), style: {
                position: 'absolute',
                width,
                height,
                top,
                left,
            }
        }, hasRemoteVideo ? (react_1.default.createElement("canvas", { className: "module-ongoing-call__group-call-remote-participant__remote-video", style: canvasStyles, ref: remoteVideoRef })) : (react_1.default.createElement(CallBackgroundBlur_1.CallBackgroundBlur, null,
            react_1.default.createElement("span", null)))));
    };
});