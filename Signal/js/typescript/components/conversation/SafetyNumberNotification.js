(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.SafetyNumberNotification = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const ContactName_1 = window.ts.components.conversation.ContactName;
    const Intl_1 = window.ts.components.Intl;
    class SafetyNumberNotification extends react_1.default.Component {
        render() {
            const { contact, isGroup, i18n, showIdentity } = this.props;
            const changeKey = isGroup
                ? 'safetyNumberChangedGroup'
                : 'safetyNumberChanged';
            return (react_1.default.createElement("div", { className: "module-safety-number-notification" },
                react_1.default.createElement("div", { className: "module-safety-number-notification__icon" }),
                react_1.default.createElement("div", { className: "module-safety-number-notification__text" },
                    react_1.default.createElement(Intl_1.Intl, {
                        id: changeKey, components: [
                            react_1.default.createElement("span", { key: "external-1", className: "module-safety-number-notification__contact" },
                                react_1.default.createElement(ContactName_1.ContactName, { name: contact.name, profileName: contact.profileName, phoneNumber: contact.phoneNumber, module: "module-safety-number-notification__contact" })),
                        ], i18n: i18n
                    })),
                react_1.default.createElement("button", {
                    onClick: () => {
                        showIdentity(contact.id);
                    }, className: "module-safety-number-notification__button"
                }, i18n('verifyNewNumber'))));
        }
    }
    exports.SafetyNumberNotification = SafetyNumberNotification;
})();