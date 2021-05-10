require(exports => {
    "use strict";
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(require("react"));
    const redux_1 = require("redux");
    const react_redux_1 = require("react-redux");
    // Restore focus on teardown
    exports.useRestoreFocus = (
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
    exports.useBoundActions = (actions) => {
        const dispatch = react_redux_1.useDispatch();
        return React.useMemo(() => {
            return redux_1.bindActionCreators(actions, dispatch);
        }, [actions, dispatch]);
    };
});