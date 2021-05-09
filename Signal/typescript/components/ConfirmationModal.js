(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.ConfirmationModal = {};

    var __rest = (this && this.__rest) || function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(require("react"));
    const react_dom_1 = require("react-dom");
    const ConfirmationDialog_1 = require("./ConfirmationDialog");
    exports.ConfirmationModal = React.memo((_a) => {
        var { i18n, onClose, children } = _a, rest = __rest(_a, ["i18n", "onClose", "children"]);
        const [root, setRoot] = React.useState(null);
        React.useEffect(() => {
            const div = document.createElement('div');
            document.body.appendChild(div);
            setRoot(div);
            return () => {
                document.body.removeChild(div);
                setRoot(null);
            };
        }, []);
        React.useEffect(() => {
            const handler = (event) => {
                if (event.key === 'Escape') {
                    onClose();
                    event.preventDefault();
                    event.stopPropagation();
                }
            };
            document.addEventListener('keydown', handler);
            return () => {
                document.removeEventListener('keydown', handler);
            };
        }, [onClose]);
        const handleCancel = React.useCallback((e) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        }, [onClose]);
        const handleKeyCancel = React.useCallback((e) => {
            if (e.target === e.currentTarget && e.keyCode === 27) {
                onClose();
            }
        }, [onClose]);
        return root
            ? react_dom_1.createPortal(React.createElement("div", { role: "presentation", className: "module-confirmation-dialog__overlay", onClick: handleCancel, onKeyUp: handleKeyCancel },
                React.createElement(ConfirmationDialog_1.ConfirmationDialog, Object.assign({ i18n: i18n }, rest, { onClose: onClose }), children)), root)
            : null;
    });
})();