(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.ConfirmationDialog = {};

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
    const React = __importStar(window.react);
    const classnames_1 = __importDefault(window.classnames);
    function focusRef(el) {
        if (el) {
            el.focus();
        }
    }
    exports.ConfirmationDialog = React.memo(({ i18n, onClose, children, onAffirmative, onNegative, affirmativeText, negativeText, }) => {
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
        const handleNegative = React.useCallback(() => {
            onClose();
            if (onNegative) {
                onNegative();
            }
        }, [onClose, onNegative]);
        const handleAffirmative = React.useCallback(() => {
            onClose();
            if (onAffirmative) {
                onAffirmative();
            }
        }, [onClose, onAffirmative]);
        return (React.createElement("div", { className: "module-confirmation-dialog__container" },
            React.createElement("div", { className: "module-confirmation-dialog__container__content" }, children),
            React.createElement("div", { className: "module-confirmation-dialog__container__buttons" },
                React.createElement("button", { onClick: handleCancel, ref: focusRef, className: "module-confirmation-dialog__container__buttons__button" }, i18n('confirmation-dialog--Cancel')),
                onNegative && negativeText ? (React.createElement("button", { onClick: handleNegative, className: classnames_1.default('module-confirmation-dialog__container__buttons__button', 'module-confirmation-dialog__container__buttons__button--negative') }, negativeText)) : null,
                onAffirmative && affirmativeText ? (React.createElement("button", { onClick: handleAffirmative, className: classnames_1.default('module-confirmation-dialog__container__buttons__button', 'module-confirmation-dialog__container__buttons__button--affirmative') }, affirmativeText)) : null)));
    });
})();