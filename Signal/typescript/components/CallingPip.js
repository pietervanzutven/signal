require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const CallingPipRemoteVideo_1 = require("./CallingPipRemoteVideo");
    const PIP_HEIGHT = 156;
    const PIP_WIDTH = 120;
    const PIP_DEFAULT_Y = 56;
    const PIP_PADDING = 8;
    exports.CallingPip = ({ activeCall, getGroupCallVideoFrameSource, hangUp, hasLocalVideo, i18n, setLocalPreview, setRendererCanvas, togglePip, }) => {
        const videoContainerRef = react_1.default.useRef(null);
        const localVideoRef = react_1.default.useRef(null);
        const [dragState, setDragState] = react_1.default.useState({
            offsetX: 0,
            offsetY: 0,
            isDragging: false,
        });
        const [dragContainerStyle, setDragContainerStyle] = react_1.default.useState({
            translateX: window.innerWidth - PIP_WIDTH - PIP_PADDING,
            translateY: PIP_DEFAULT_Y,
        });
        react_1.default.useEffect(() => {
            setLocalPreview({ element: localVideoRef });
        }, [setLocalPreview]);
        const handleMouseMove = react_1.default.useCallback((ev) => {
            if (dragState.isDragging) {
                setDragContainerStyle({
                    translateX: ev.clientX - dragState.offsetX,
                    translateY: ev.clientY - dragState.offsetY,
                });
            }
        }, [dragState]);
        const handleMouseUp = react_1.default.useCallback(() => {
            if (dragState.isDragging) {
                const { translateX, translateY } = dragContainerStyle;
                const { innerHeight, innerWidth } = window;
                const proximityRatio = {
                    top: translateY / innerHeight,
                    right: (innerWidth - translateX) / innerWidth,
                    bottom: (innerHeight - translateY) / innerHeight,
                    left: translateX / innerWidth,
                };
                const snapTo = Object.keys(proximityRatio).reduce((minKey, key) => {
                    return proximityRatio[key] < proximityRatio[minKey] ? key : minKey;
                });
                setDragState(Object.assign(Object.assign({}, dragState), { isDragging: false }));
                let nextX = Math.max(PIP_PADDING, Math.min(translateX, innerWidth - PIP_WIDTH - PIP_PADDING));
                let nextY = Math.max(PIP_DEFAULT_Y, Math.min(translateY, innerHeight - PIP_HEIGHT - PIP_PADDING));
                if (snapTo === 'top') {
                    nextY = PIP_DEFAULT_Y;
                }
                if (snapTo === 'right') {
                    nextX = innerWidth - PIP_WIDTH - PIP_PADDING;
                }
                if (snapTo === 'bottom') {
                    nextY = innerHeight - PIP_HEIGHT - PIP_PADDING;
                }
                if (snapTo === 'left') {
                    nextX = PIP_PADDING;
                }
                setDragContainerStyle({
                    translateX: nextX,
                    translateY: nextY,
                });
            }
        }, [dragState, dragContainerStyle]);
        react_1.default.useEffect(() => {
            if (dragState.isDragging) {
                document.addEventListener('mousemove', handleMouseMove, false);
                document.addEventListener('mouseup', handleMouseUp, false);
            }
            else {
                document.removeEventListener('mouseup', handleMouseUp, false);
                document.removeEventListener('mousemove', handleMouseMove, false);
            }
            return () => {
                document.removeEventListener('mouseup', handleMouseUp, false);
                document.removeEventListener('mousemove', handleMouseMove, false);
            };
        }, [dragState, handleMouseMove, handleMouseUp]);
        return (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            react_1.default.createElement("div", {
                className: "module-calling-pip", onMouseDown: ev => {
                    const node = videoContainerRef.current;
                    if (!node) {
                        return;
                    }
                    const rect = node.getBoundingClientRect();
                    const offsetX = ev.clientX - rect.left;
                    const offsetY = ev.clientY - rect.top;
                    setDragState({
                        isDragging: true,
                        offsetX,
                        offsetY,
                    });
                }, ref: videoContainerRef, style: {
                    cursor: dragState.isDragging ? '-webkit-grabbing' : '-webkit-grab',
                    transform: `translate3d(${dragContainerStyle.translateX}px,${dragContainerStyle.translateY}px, 0)`,
                    transition: dragState.isDragging ? 'none' : 'transform ease-out 300ms',
                }
            },
                react_1.default.createElement(CallingPipRemoteVideo_1.CallingPipRemoteVideo, { activeCall: activeCall, getGroupCallVideoFrameSource: getGroupCallVideoFrameSource, i18n: i18n, setRendererCanvas: setRendererCanvas }),
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
});