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
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useIntersectionObserver = exports.usePageVisibility = exports.useBoundActions = exports.useRestoreFocus = void 0;
    const React = __importStar(require("react"));
    const redux_1 = require("redux");
    const react_redux_1 = require("react-redux");
    // Restore focus on teardown
    const useRestoreFocus = (
        // The ref for the element to receive initial focus
        focusRef,
        // Allow for an optional root element that must exist
        root = true) => {
        React.useEffect(() => {
            if (!root) {
                return undefined;
            }
            const lastFocused = document.activeElement;
            if (focusRef.current) {
                focusRef.current.focus();
            }
            return () => {
                // This ensures that the focus is returned to
                // previous element
                setTimeout(() => {
                    if (lastFocused && lastFocused.focus) {
                        lastFocused.focus();
                    }
                });
            };
        }, [focusRef, root]);
    };
    exports.useRestoreFocus = useRestoreFocus;
    const useBoundActions = (actions) => {
        const dispatch = react_redux_1.useDispatch();
        return React.useMemo(() => {
            return redux_1.bindActionCreators(actions, dispatch);
        }, [actions, dispatch]);
    };
    exports.useBoundActions = useBoundActions;
    const usePageVisibility = () => {
        const [result, setResult] = React.useState(!document.hidden);
        React.useEffect(() => {
            const onVisibilityChange = () => {
                setResult(!document.hidden);
            };
            document.addEventListener('visibilitychange', onVisibilityChange, false);
            return () => {
                document.removeEventListener('visibilitychange', onVisibilityChange, false);
            };
        }, []);
        return result;
    };
    exports.usePageVisibility = usePageVisibility;
    /**
     * A light hook wrapper around `IntersectionObserver`.
     *
     * Example usage:
     *
     *     function MyComponent() {
     *       const [intersectionRef, intersectionEntry] = useIntersectionObserver();
     *       const isVisible = intersectionEntry
     *         ? intersectionEntry.isIntersecting
     *         : true;
     *
     *       return (
     *         <div ref={intersectionRef}>
     *           I am {isVisible ? 'on the screen' : 'invisible'}
     *         </div>
     *       );
     *    }
     */
    function useIntersectionObserver() {
        const [intersectionObserverEntry, setIntersectionObserverEntry,] = React.useState(null);
        const unobserveRef = React.useRef(null);
        const setRef = React.useCallback((el) => {
            if (unobserveRef.current) {
                unobserveRef.current();
                unobserveRef.current = null;
            }
            if (!el) {
                return;
            }
            const observer = new IntersectionObserver(entries => {
                if (entries.length !== 1) {
                    window.log.error('IntersectionObserverWrapper was observing the wrong number of elements');
                    return;
                }
                entries.forEach(entry => {
                    setIntersectionObserverEntry(entry);
                });
            });
            unobserveRef.current = observer.unobserve.bind(observer, el);
            observer.observe(el);
        }, []);
        return [setRef, intersectionObserverEntry];
    }
    exports.useIntersectionObserver = useIntersectionObserver;
});