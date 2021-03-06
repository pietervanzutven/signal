(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.UnsupportedMessage = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const ContactName_1 = require("./ContactName");
    const Intl_1 = require("../Intl");
    exports.UnsupportedMessage = ({ canProcessNow, contact, i18n, downloadNewVersion, }) => {
        const { isMe } = contact;
        const otherStringId = canProcessNow
            ? 'Message--unsupported-message-ask-to-resend'
            : 'Message--unsupported-message';
        const meStringId = canProcessNow
            ? 'Message--from-me-unsupported-message-ask-to-resend'
            : 'Message--from-me-unsupported-message';
        const stringId = isMe ? meStringId : otherStringId;
        return (react_1.default.createElement("div", { className: "module-unsupported-message" },
            react_1.default.createElement("div", { className: classnames_1.default('module-unsupported-message__icon', canProcessNow ? 'module-unsupported-message__icon--can-process' : null) }),
            react_1.default.createElement("div", { className: "module-unsupported-message__text" },
                react_1.default.createElement(Intl_1.Intl, {
                    id: stringId, components: [
                        react_1.default.createElement("span", { key: "external-1", className: "module-unsupported-message__contact" },
                            react_1.default.createElement(ContactName_1.ContactName, { name: contact.name, profileName: contact.profileName, phoneNumber: contact.phoneNumber, title: contact.title, module: "module-unsupported-message__contact", i18n: i18n })),
                    ], i18n: i18n
                })),
            canProcessNow ? null : (react_1.default.createElement("button", {
                type: "button", onClick: () => {
                    downloadNewVersion();
                }, className: "module-unsupported-message__button"
            }, i18n('Message--update-signal')))));
    };
})();