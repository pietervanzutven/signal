(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.StartNewConversation = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const Avatar_1 = require("./Avatar");
    class StartNewConversation extends react_1.default.PureComponent {
        render() {
            const { phoneNumber, i18n, onClick } = this.props;
            return (react_1.default.createElement("button", { type: "button", className: "module-start-new-conversation", onClick: onClick },
                react_1.default.createElement(Avatar_1.Avatar, { color: "grey", conversationType: "direct", i18n: i18n, title: phoneNumber, size: 52 }),
                react_1.default.createElement("div", { className: "module-start-new-conversation__content" },
                    react_1.default.createElement("div", { className: "module-start-new-conversation__number" }, phoneNumber),
                    react_1.default.createElement("div", { className: "module-start-new-conversation__text" }, i18n('startConversation')))));
        }
    }
    exports.StartNewConversation = StartNewConversation;
})();