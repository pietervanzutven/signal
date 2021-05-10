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
    const react_1 = __importDefault(require("react"));
    const lib_1 = require("../emoji/lib");
    const AtMentionify_1 = require("./AtMentionify");
    const Emojify_1 = require("./Emojify");
    const AddNewLines_1 = require("./AddNewLines");
    const Linkify_1 = require("./Linkify");
    const renderEmoji = ({ text, key, sizeClass, renderNonEmoji, }) => (react_1.default.createElement(Emojify_1.Emojify, { key: key, text: text, sizeClass: sizeClass, renderNonEmoji: renderNonEmoji }));
    /**
     * This component makes it very easy to use all three of our message formatting
     * components: `Emojify`, `Linkify`, and `AddNewLines`. Because each of them is fully
     * configurable with their `renderXXX` props, this component will assemble all three of
     * them for you.
     */
    class MessageBody extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.renderNewLines = ({ text: textWithNewLines, key, }) => {
                const { bodyRanges, direction, openConversation } = this.props;
                return (react_1.default.createElement(AddNewLines_1.AddNewLines, { key: key, text: textWithNewLines, renderNonNewLine: ({ text }) => (react_1.default.createElement(AtMentionify_1.AtMentionify, { direction: direction, text: text, bodyRanges: bodyRanges, openConversation: openConversation })) }));
            };
        }
        addDownloading(jsx) {
            const { i18n, textPending } = this.props;
            return (react_1.default.createElement("span", null,
                jsx,
                textPending ? (react_1.default.createElement("span", { className: "module-message-body__highlight" },
                    ' ',
                    i18n('downloading'))) : null));
        }
        render() {
            const { bodyRanges, text, textPending, disableJumbomoji, disableLinks, i18n, } = this.props;
            const sizeClass = disableJumbomoji ? undefined : lib_1.getSizeClass(text);
            const textWithPending = AtMentionify_1.AtMentionify.preprocessMentions(textPending ? `${text}...` : text, bodyRanges);
            if (disableLinks) {
                return this.addDownloading(renderEmoji({
                    i18n,
                    text: textWithPending,
                    sizeClass,
                    key: 0,
                    renderNonEmoji: this.renderNewLines,
                }));
            }
            return this.addDownloading(react_1.default.createElement(Linkify_1.Linkify, {
                text: textWithPending, renderNonLink: ({ key, text: nonLinkText }) => {
                    return renderEmoji({
                        i18n,
                        text: nonLinkText,
                        sizeClass,
                        key,
                        renderNonEmoji: this.renderNewLines,
                    });
                }
            }));
        }
    }
    exports.MessageBody = MessageBody;
})();