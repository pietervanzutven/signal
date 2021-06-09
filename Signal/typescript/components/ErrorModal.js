require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(require("react"));
    const ConfirmationModal_1 = require("./ConfirmationModal");
    function focusRef(el) {
        if (el) {
            el.focus();
        }
    }
    exports.ErrorModal = (props) => {
        const { buttonText, description, i18n, onClose, title } = props;
        return (React.createElement(ConfirmationModal_1.ConfirmationModal, { actions: [], title: title || i18n('ErrorModal--title'), i18n: i18n, onClose: onClose },
            React.createElement("div", { className: "module-error-modal__description" }, description || i18n('ErrorModal--description')),
            React.createElement("div", { className: "module-error-modal__button-container" },
                React.createElement("button", { type: "button", className: "module-confirmation-dialog__container__buttons__button", onClick: onClose, ref: focusRef }, buttonText || i18n('Confirmation--confirm')))));
    };
});