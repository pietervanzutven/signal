(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.ConversationTitle = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const Emojify_1 = window.ts.components.conversation.Emojify;
    class ConversationTitle extends react_1.default.Component {
        render() {
            const { name, phoneNumber, i18n, profileName, isVerified } = this.props;
            return (react_1.default.createElement("span", { className: "conversation-title" },
                name ? (react_1.default.createElement("span", { className: "conversation-name", dir: "auto" },
                    react_1.default.createElement(Emojify_1.Emojify, { text: name }))) : null,
                phoneNumber ? (react_1.default.createElement("span", { className: "conversation-number" }, phoneNumber)) : null,
                ' ',
                profileName ? (react_1.default.createElement("span", { className: "profileName" },
                    react_1.default.createElement(Emojify_1.Emojify, { text: profileName }))) : null,
                isVerified ? (react_1.default.createElement("span", { className: "verified" },
                    react_1.default.createElement("span", { className: "verified-icon" }),
                    i18n('verified'))) : null));
        }
    }
    exports.ConversationTitle = ConversationTitle;
})();