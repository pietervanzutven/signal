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
    const renderLinks = ({ text: textWithLinks, key }) => (react_1.default.createElement(Linkify_1.Linkify, { key: key, text: textWithLinks, renderNonLink: renderNewLines }));
    /**
     * This component makes it very easy to use all three of our message formatting
     * components: `Emojify`, `Linkify`, and `AddNewLines`. Because each of them is fully
     * configurable with their `renderXXX` props, this component will assemble all three of
     * them for you.
     */
    class MessageBody extends react_1.default.Component {
        render() {
            const { text, disableJumbomoji, disableLinks } = this.props;
            const sizeClass = disableJumbomoji ? '' : emoji_1.getSizeClass(text);
            return (react_1.default.createElement(Emojify_1.Emojify, { text: text, sizeClass: sizeClass, renderNonEmoji: disableLinks ? renderNewLines : renderLinks }));
        }
    }
    exports.MessageBody = MessageBody;
})();