require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CallingPip = void 0;
    const react_1 = __importDefault(require("react"));
    const lodash_1 = require("lodash");
    const CallingPipRemoteVideo_1 = require("./CallingPipRemoteVideo");
    const missingCaseError_1 = require("../util/missingCaseError");
    var PositionMode;
    (function (PositionMode) {
        PositionMode[PositionMode["BeingDragged"] = 0] = "BeingDragged";
        PositionMode[PositionMode["SnapToBottom"] = 1] = "SnapToBottom";
        PositionMode[PositionMode["SnapToLeft"] = 2] = "SnapToLeft";
        PositionMode[PositionMode["SnapToRight"] = 3] = "SnapToRight";
        PositionMode[PositionMode["SnapToTop"] = 4] = "SnapToTop";
    })(PositionMode || (PositionMode = {}));
    const PIP_HEIGHT = 156;
    const PIP_WIDTH = 120;
    const PIP_TOP_MARGIN = 56;
    const PIP_PADDING = 8;
    const CallingPip = ({ activeCall, getGroupCallVideoFrameSource, hangUp, hasLocalVideo, i18n, setGroupCallVideoRequest, setLocalPreview, setRendererCanvas, togglePip, }) => {
        const videoContainerRef = react_1.default.useRef(null);
        const localVideoRef = react_1.default.useRef(null);
        const [windowWidth, setWindowWidth] = react_1.default.useState(window.innerWidth);
        const [windowHeight, setWindowHeight] = react_1.default.useState(window.innerHeight);
        const [positionState, setPositionState] = react_1.default.useState({
            mode: PositionMode.SnapToRight,
            offsetY: 0,
        });
        react_1.default.useEffect(() => {
            setLocalPreview({ element: localVideoRef });
        }, [setLocalPreview]);
        const handleMouseMove = react_1.default.useCallback((ev) => {
            if (positionState.mode === PositionMode.BeingDragged) {
                setPositionState(oldState => (Object.assign(Object.assign({}, oldState), { mouseX: ev.screenX, mouseY: ev.screenY })));
            }
        }, [positionState]);
        const handleMouseUp = react_1.default.useCallback(() => {
            if (positionState.mode === PositionMode.BeingDragged) {
                const { mouseX, mouseY, dragOffsetX, dragOffsetY } = positionState;
                const { innerHeight, innerWidth } = window;
                const offsetX = mouseX - dragOffsetX;
                const offsetY = mouseY - dragOffsetY;
                const snapCandidates = [
                    {
                        mode: PositionMode.SnapToLeft,
                        distanceToEdge: offsetX,
                    },
                    {
                        mode: PositionMode.SnapToRight,
                        distanceToEdge: innerWidth - (offsetX + PIP_WIDTH),
                    },
                    {
                        mode: PositionMode.SnapToTop,
                        distanceToEdge: offsetY - PIP_TOP_MARGIN,
                    },
                    {
                        mode: PositionMode.SnapToBottom,
                        distanceToEdge: innerHeight - (offsetY + PIP_HEIGHT),
                    },
                ];
                // This fallback is mostly for TypeScript, because `minBy` says it can return
                //   `undefined`.
                const snapTo = lodash_1.minBy(snapCandidates, candidate => candidate.distanceToEdge) ||
                    snapCandidates[0];
                switch (snapTo.mode) {
                    case PositionMode.SnapToLeft:
                    case PositionMode.SnapToRight:
                        setPositionState({
                            mode: snapTo.mode,
                            offsetY,
                        });
                        break;
                    case PositionMode.SnapToTop:
                    case PositionMode.SnapToBottom:
                        setPositionState({
                            mode: snapTo.mode,
                            offsetX,
                        });
                        break;
                    default:
                        throw missingCaseError_1.missingCaseError(snapTo.mode);
                }
            }
        }, [positionState, setPositionState]);
        react_1.default.useEffect(() => {
            if (positionState.mode === PositionMode.BeingDragged) {
                document.addEventListener('mousemove', handleMouseMove, false);
                document.addEventListener('mouseup', handleMouseUp, false);
                return () => {
                    document.removeEventListener('mouseup', handleMouseUp, false);
                    document.removeEventListener('mousemove', handleMouseMove, false);
                };
            }
            return lodash_1.noop;
        }, [positionState.mode, handleMouseMove, handleMouseUp]);
        react_1.default.useEffect(() => {
            const handleWindowResize = lodash_1.debounce(() => {
                setWindowWidth(window.innerWidth);
                setWindowHeight(window.innerHeight);
            }, 100, {
                maxWait: 3000,
            });
            window.addEventListener('resize', handleWindowResize, false);
            return () => {
                window.removeEventListener('resize', handleWindowResize, false);
            };
        }, []);
        const [translateX, translateY] = react_1.default.useMemo(() => {
            switch (positionState.mode) {
                case PositionMode.BeingDragged:
                    return [
                        positionState.mouseX - positionState.dragOffsetX,
                        positionState.mouseY - positionState.dragOffsetY,
                    ];
                case PositionMode.SnapToLeft:
                    return [
                        PIP_PADDING,
                        Math.min(PIP_TOP_MARGIN + positionState.offsetY, windowHeight - PIP_PADDING - PIP_HEIGHT),
                    ];
                case PositionMode.SnapToRight:
                    return [
                        windowWidth - PIP_PADDING - PIP_WIDTH,
                        Math.min(PIP_TOP_MARGIN + positionState.offsetY, windowHeight - PIP_PADDING - PIP_HEIGHT),
                    ];
                case PositionMode.SnapToTop:
                    return [
                        Math.min(positionState.offsetX, windowWidth - PIP_PADDING - PIP_WIDTH),
                        PIP_TOP_MARGIN + PIP_PADDING,
                    ];
                case PositionMode.SnapToBottom:
                    return [
                        Math.min(positionState.offsetX, windowWidth - PIP_PADDING - PIP_WIDTH),
                        windowHeight - PIP_PADDING - PIP_HEIGHT,
                    ];
                default:
                    throw missingCaseError_1.missingCaseError(positionState);
            }
        }, [windowWidth, windowHeight, positionState]);
        return (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            react_1.default.createElement("div", {
                className: "module-calling-pip", onMouseDown: ev => {
                    const node = videoContainerRef.current;
                    if (!node) {
                        return;
                    }
                    const rect = node.getBoundingClientRect();
                    const dragOffsetX = ev.screenX - rect.left;
                    const dragOffsetY = ev.screenY - rect.top;
                    setPositionState({
                        mode: PositionMode.BeingDragged,
                        mouseX: ev.screenX,
                        mouseY: ev.screenY,
                        dragOffsetX,
                        dragOffsetY,
                    });
                }, ref: videoContainerRef, style: {
                    cursor: positionState.mode === PositionMode.BeingDragged
                        ? '-webkit-grabbing'
                        : '-webkit-grab',
                    transform: `translate3d(${translateX}px,${translateY}px, 0)`,
                    transition: positionState.mode === PositionMode.BeingDragged
                        ? 'none'
                        : 'transform ease-out 300ms',
                }
            },
                react_1.default.createElement(CallingPipRemoteVideo_1.CallingPipRemoteVideo, { activeCall: activeCall, getGroupCallVideoFrameSource: getGroupCallVideoFrameSource, i18n: i18n, setRendererCanvas: setRendererCanvas, setGroupCallVideoRequest: setGroupCallVideoRequest }),
                hasLocalVideo ? (react_1.default.createElement("video", { className: "module-calling-pip__video--local", ref: localVideoRef, autoPlay: true })) : null,
                react_1.default.createElement("div", { className: "module-calling-pip__actions" },
                    react_1.default.createElement("button", {
                        "aria-label": i18n('calling__hangup'), className: "module-calling-pip__button--hangup", onClick: () => {
                            hangUp({ conversationId: activeCall.conversation.id });
                        }, type: "button"
                    }),
                    react_1.default.createElement("button", { "aria-label": i18n('calling__pip--off'), className: "module-calling-pip__button--pip", onClick: togglePip, type: "button" },
                        react_1.default.createElement("div", null)))));
    };
    exports.CallingPip = CallingPip;
});