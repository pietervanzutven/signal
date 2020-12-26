(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.ConfirmationModal = {};

    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(window.react);
    const react_dom_1 = window.react_dom;
    const ConfirmationDialog_1 = window.ts.components.ConfirmationDialog;
    exports.ConfirmationModal = React.memo(
        // tslint:disable-next-line max-func-body-length
        ({ i18n, onClose, children, onAffirmative, onNegative, affirmativeText, negativeText, }) => {
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
                const handler = ({ key }) => {
                    if (key === 'Escape') {
                        onClose();
                    }
                };
                document.addEventListener('keyup', handler);
                return () => {
                    document.removeEventListener('keyup', handler);
                };
            }, [onClose]);
            const handleCancel = React.useCallback((e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }, [onClose]);
            return root
                ? react_dom_1.createPortal(React.createElement("div", { role: "button", className: "module-confirmation-dialog__overlay", onClick: handleCancel },
                    React.createElement(ConfirmationDialog_1.ConfirmationDialog, { i18n: i18n, onClose: onClose, onAffirmative: onAffirmative, onNegative: onNegative, affirmativeText: affirmativeText, negativeText: negativeText }, children)), root)
                : null;
        });
})();