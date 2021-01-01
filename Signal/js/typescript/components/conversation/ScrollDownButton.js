(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.ScrollDownButton = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    class ScrollDownButton extends react_1.default.Component {
        render() {
            const { conversationId, count, i18n, scrollDown } = this.props;
            let altText = i18n('scrollDown');
            if (count > 1) {
                altText = i18n('messagesBelow');
            }
            else if (count === 1) {
                altText = i18n('messageBelow');
            }
            return (react_1.default.createElement("div", { className: "module-scroll-down" },
                react_1.default.createElement("button", {
                    className: classnames_1.default('module-scroll-down__button', count > 0 ? 'module-scroll-down__button--new-messages' : null), onClick: () => {
                        scrollDown(conversationId);
                    }, title: altText
                },
                    react_1.default.createElement("div", { className: "module-scroll-down__icon" }))));
        }
    }
    exports.ScrollDownButton = ScrollDownButton;
})();