(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.ContactName = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const Emojify_1 = window.ts.components.conversation.Emojify;
    class ContactName extends react_1.default.Component {
        render() {
            const { phoneNumber, name, profileName } = this.props;
            const title = name ? name : phoneNumber;
            const profileElement = profileName && !name ? (react_1.default.createElement("span", { className: "profile-name" },
                "~",
                react_1.default.createElement(Emojify_1.Emojify, { text: profileName }))) : null;
            return (react_1.default.createElement("span", null,
                react_1.default.createElement(Emojify_1.Emojify, { text: title }),
                " ",
                profileElement));
        }
    }
    exports.ContactName = ContactName;
})();