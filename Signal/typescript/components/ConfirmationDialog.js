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
    exports.ConfirmationDialog = React.memo(({ i18n, onClose, children, title, actions }) => {
        React.useEffect(() => {
            const handler = ({ key }) => {
                if (key === 'Escape') {
                    onClose();
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
        const handleAction = React.useCallback((e) => {
            onClose();
            if (e.currentTarget.dataset.action) {
                const actionIndex = parseInt(e.currentTarget.dataset.action, 10);
                const { action } = actions[actionIndex];
                action();
            }
        }, [onClose, actions]);
        return (React.createElement("div", { className: "module-confirmation-dialog__container" },
            title ? (React.createElement("h1", { className: "module-confirmation-dialog__container__title" }, title)) : null,
            React.createElement("div", { className: "module-confirmation-dialog__container__content" }, children),
            React.createElement("div", { className: "module-confirmation-dialog__container__buttons" },
                React.createElement("button", { onClick: handleCancel, ref: focusRef, className: "module-confirmation-dialog__container__buttons__button" }, i18n('confirmation-dialog--Cancel')),
                actions.map((action, i) => (React.createElement("button", {
                    key: i, onClick: handleAction, "data-action": i, className: classnames_1.default('module-confirmation-dialog__container__buttons__button', action.style === 'affirmative'
                        ? 'module-confirmation-dialog__container__buttons__button--affirmative'
                        : null, action.style === 'negative'
                        ? 'module-confirmation-dialog__container__buttons__button--negative'
                        : null)
                }, action.text))))));
    });
})();