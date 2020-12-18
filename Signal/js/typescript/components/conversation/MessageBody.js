(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.MessageBody = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const emoji_1 = window.ts.util.emoji;
    const Emojify_1 = window.ts.components.conversation.Emojify;
    const AddNewLines_1 = window.ts.components.conversation.AddNewLines;
    const Linkify_1 = window.ts.components.conversation.Linkify;
    const renderNewLines = ({ text: textWithNewLines, key, }) => react_1.default.createElement(AddNewLines_1.AddNewLines, { key: key, text: textWithNewLines });
    const renderEmoji = ({ i18n, text, key, sizeClass, renderNonEmoji, }) => (react_1.default.createElement(Emojify_1.Emojify, { i18n: i18n, key: key, text: text, sizeClass: sizeClass, renderNonEmoji: renderNonEmoji }));
    /**
     * This component makes it very easy to use all three of our message formatting
     * components: `Emojify`, `Linkify`, and `AddNewLines`. Because each of them is fully
     * configurable with their `renderXXX` props, this component will assemble all three of
     * them for you.
     */
    class MessageBody extends react_1.default.Component {
        addDownloading(jsx) {
            const { i18n, textPending } = this.props;
            return (react_1.default.createElement("span", null,
                jsx,
                textPending ? (react_1.default.createElement("span", { className: "module-message-body__highlight" },
                    ' ',
                    i18n('downloading'))) : null));
        }
        render() {
            const { text, textPending, disableJumbomoji, disableLinks, i18n, } = this.props;
            const sizeClass = disableJumbomoji ? undefined : emoji_1.getSizeClass(text);
            const textWithPending = textPending ? `${text}...` : text;
            if (disableLinks) {
                return this.addDownloading(renderEmoji({
                    i18n,
                    text: textWithPending,
                    sizeClass,
                    key: 0,
                    renderNonEmoji: renderNewLines,
                }));
            }
            return this.addDownloading(react_1.default.createElement(Linkify_1.Linkify, {
                text: textWithPending, renderNonLink: ({ key, text: nonLinkText }) => {
                    return renderEmoji({
                        i18n,
                        text: nonLinkText,
                        sizeClass,
                        key,
                        renderNonEmoji: renderNewLines,
                    });
                }
            }));
        }
    }
    exports.MessageBody = MessageBody;
})();