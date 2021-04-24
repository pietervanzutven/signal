(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.VerificationNotification = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    // import classNames from 'classnames';
    const ContactName_1 = window.ts.components.conversation.ContactName;
    const Intl_1 = window.ts.components.Intl;
    const missingCaseError_1 = require("../../../ts/util/missingCaseError");
    class VerificationNotification extends react_1.default.Component {
        getStringId() {
            const { isLocal, type } = this.props;
            switch (type) {
                case 'markVerified':
                    return isLocal
                        ? 'youMarkedAsVerified'
                        : 'youMarkedAsVerifiedOtherDevice';
                case 'markNotVerified':
                    return isLocal
                        ? 'youMarkedAsNotVerified'
                        : 'youMarkedAsNotVerifiedOtherDevice';
                default:
                    throw missingCaseError_1.missingCaseError(type);
            }
        }
        renderContents() {
            const { contact, i18n } = this.props;
            const id = this.getStringId();
            return (react_1.default.createElement(Intl_1.Intl, {
                id: id, components: [
                    react_1.default.createElement(ContactName_1.ContactName, { key: "external-1", name: contact.name, profileName: contact.profileName, phoneNumber: contact.phoneNumber, module: "module-verification-notification__contact" }),
                ], i18n: i18n
            }));
        }
        render() {
            const { type } = this.props;
            const suffix = type === 'markVerified' ? 'mark-verified' : 'mark-not-verified';
            return (react_1.default.createElement("div", { className: "module-verification-notification" },
                react_1.default.createElement("div", { className: `module-verification-notification__icon--${suffix}` }),
                this.renderContents()));
        }
    }
    exports.VerificationNotification = VerificationNotification;
})();