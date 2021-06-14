require(exports => {
    "use strict";
    // Copyright 2021 Signal Messenger, LLC
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
    exports.GroupCallOverflowArea = exports.OVERFLOW_PARTICIPANT_WIDTH = void 0;
    const react_1 = __importStar(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const GroupCallRemoteParticipant_1 = require("./GroupCallRemoteParticipant");
    const OVERFLOW_SCROLLED_TO_EDGE_THRESHOLD = 20;
    const OVERFLOW_SCROLL_BUTTON_RATIO = 0.75;
    // This should be an integer, as sub-pixel widths can cause performance issues.
    exports.OVERFLOW_PARTICIPANT_WIDTH = 140;
    const GroupCallOverflowArea = ({ getFrameBuffer, getGroupCallVideoFrameSource, i18n, overflowedParticipants, }) => {
        const overflowRef = react_1.useRef(null);
        const [overflowScrollTop, setOverflowScrollTop] = react_1.useState(0);
        // This assumes that these values will change along with re-renders. If that's not true,
        //   we should add these values to the component's state.
        let visibleHeight;
        let scrollMax;
        if (overflowRef.current) {
            visibleHeight = overflowRef.current.clientHeight;
            scrollMax = overflowRef.current.scrollHeight - visibleHeight;
        }
        else {
            visibleHeight = 0;
            scrollMax = 0;
        }
        const hasOverflowedParticipants = Boolean(overflowedParticipants.length);
        react_1.useEffect(() => {
            // If there aren't any overflowed participants, we want to clear the scroll position
            //   so we don't hold onto stale values.
            if (!hasOverflowedParticipants) {
                setOverflowScrollTop(0);
            }
        }, [hasOverflowedParticipants]);
        if (!hasOverflowedParticipants) {
            return null;
        }
        const isScrolledToTop = overflowScrollTop < OVERFLOW_SCROLLED_TO_EDGE_THRESHOLD;
        const isScrolledToBottom = overflowScrollTop > scrollMax - OVERFLOW_SCROLLED_TO_EDGE_THRESHOLD;
        return (react_1.default.createElement("div", {
            className: "module-ongoing-call__participants__overflow", style: {
                // This width could live in CSS but we put it here to avoid having to keep two
                //   values in sync.
                width: exports.OVERFLOW_PARTICIPANT_WIDTH,
            }
        },
            react_1.default.createElement(OverflowAreaScrollMarker, {
                i18n: i18n, isHidden: isScrolledToTop, onClick: () => {
                    const el = overflowRef.current;
                    if (!el) {
                        return;
                    }
                    el.scrollTo({
                        top: Math.max(el.scrollTop - visibleHeight * OVERFLOW_SCROLL_BUTTON_RATIO, 0),
                        left: 0,
                        behavior: 'smooth',
                    });
                }, placement: "top"
            }),
            react_1.default.createElement("div", {
                className: "module-ongoing-call__participants__overflow__inner", ref: overflowRef, onScroll: () => {
                    // Ideally this would use `event.target.scrollTop`, but that does not seem to be
                    //   available, so we use the ref.
                    const el = overflowRef.current;
                    if (!el) {
                        return;
                    }
                    setOverflowScrollTop(el.scrollTop);
                }
            }, overflowedParticipants.map(remoteParticipant => (react_1.default.createElement(GroupCallRemoteParticipant_1.GroupCallRemoteParticipant, { key: remoteParticipant.demuxId, getFrameBuffer: getFrameBuffer, getGroupCallVideoFrameSource: getGroupCallVideoFrameSource, i18n: i18n, width: exports.OVERFLOW_PARTICIPANT_WIDTH, height: Math.floor(exports.OVERFLOW_PARTICIPANT_WIDTH / remoteParticipant.videoAspectRatio), remoteParticipant: remoteParticipant })))),
            react_1.default.createElement(OverflowAreaScrollMarker, {
                i18n: i18n, isHidden: isScrolledToBottom, onClick: () => {
                    const el = overflowRef.current;
                    if (!el) {
                        return;
                    }
                    el.scrollTo({
                        top: Math.min(el.scrollTop + visibleHeight * OVERFLOW_SCROLL_BUTTON_RATIO, scrollMax),
                        left: 0,
                        behavior: 'smooth',
                    });
                }, placement: "bottom"
            })));
    };
    exports.GroupCallOverflowArea = GroupCallOverflowArea;
    function OverflowAreaScrollMarker({ i18n, isHidden, onClick, placement, }) {
        const baseClassName = 'module-ongoing-call__participants__overflow__scroll-marker';
        return (react_1.default.createElement("div", {
            className: classnames_1.default(baseClassName, `${baseClassName}--${placement}`, {
                [`${baseClassName}--hidden`]: isHidden,
            })
        },
            react_1.default.createElement("button", { type: "button", className: `${baseClassName}__button`, onClick: onClick, "aria-label": i18n(`calling__overflow__scroll-${placement === 'top' ? 'up' : 'down'}`) })));
    }
});