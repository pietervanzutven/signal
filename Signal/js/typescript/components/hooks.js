(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.hooks = {};

    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(window.react);
    // Restore focus on teardown
    exports.useRestoreFocus = (
        // The ref for the element to receive initial focus
        focusRef,
        // Allow for an optional root element that must exist
        root = true) => {
        React.useEffect(() => {
            if (!root) {
                return;
            }
            const lastFocused = document.activeElement;
            if (focusRef.current) {
                focusRef.current.focus();
            }
            return () => {
                if (lastFocused && lastFocused.focus) {
                    lastFocused.focus();
                }
            };
        }, [focusRef, root]);
    };
})();