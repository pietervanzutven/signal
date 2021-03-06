(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.TypingBubble = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const TypingAnimation_1 = require("./TypingAnimation");
    const Avatar_1 = require("../Avatar");
    class TypingBubble extends react_1.default.PureComponent {
        renderAvatar() {
            const { avatarPath, color, name, phoneNumber, profileName, title, conversationType, i18n, } = this.props;
            if (conversationType !== 'group') {
                return null;
            }
            return (react_1.default.createElement("div", { className: "module-message__author-avatar" },
                react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color, conversationType: "direct", i18n: i18n, name: name, phoneNumber: phoneNumber, profileName: profileName, title: title, size: 28 })));
        }
        render() {
            const { i18n, color, conversationType } = this.props;
            const isGroup = conversationType === 'group';
            return (react_1.default.createElement("div", { className: classnames_1.default('module-message', 'module-message--incoming', isGroup ? 'module-message--group' : null) },
                react_1.default.createElement("div", { className: classnames_1.default('module-message__container', 'module-message__container--incoming', `module-message__container--incoming-${color}`) },
                    react_1.default.createElement("div", { className: "module-message__typing-container" },
                        react_1.default.createElement(TypingAnimation_1.TypingAnimation, { color: "light", i18n: i18n })),
                    this.renderAvatar())));
        }
    }
    exports.TypingBubble = TypingBubble;
})();