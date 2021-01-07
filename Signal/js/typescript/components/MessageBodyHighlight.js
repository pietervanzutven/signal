(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.MessageBodyHighlight = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const MessageBody_1 = window.ts.components.conversation.MessageBody;
    const Emojify_1 = window.ts.components.conversation.Emojify;
    const AddNewLines_1 = window.ts.components.conversation.AddNewLines;
    const renderNewLines = ({ text, key }) => (react_1.default.createElement(AddNewLines_1.AddNewLines, { key: key, text: text }));
    const renderEmoji = ({ text, key, sizeClass, renderNonEmoji, }) => (react_1.default.createElement(Emojify_1.Emojify, { key: key, text: text, sizeClass: sizeClass, renderNonEmoji: renderNonEmoji }));
    class MessageBodyHighlight extends react_1.default.Component {
        render() {
            const { text, i18n } = this.props;
            const results = [];
            const FIND_BEGIN_END = /<<left>>(.+?)<<right>>/g;
            let match = FIND_BEGIN_END.exec(text);
            let last = 0;
            let count = 1;
            if (!match) {
                return (react_1.default.createElement(MessageBody_1.MessageBody, { disableJumbomoji: true, disableLinks: true, text: text, i18n: i18n }));
            }
            const sizeClass = '';
            while (match) {
                if (last < match.index) {
                    const beforeText = text.slice(last, match.index);
                    results.push(renderEmoji({
                        text: beforeText,
                        sizeClass,
                        key: count++,
                        i18n,
                        renderNonEmoji: renderNewLines,
                    }));
                }
                const [, toHighlight] = match;
                results.push(react_1.default.createElement("span", { className: "module-message-body__highlight", key: count++ }, renderEmoji({
                    text: toHighlight,
                    sizeClass,
                    key: count++,
                    i18n,
                    renderNonEmoji: renderNewLines,
                })));
                // @ts-ignore
                last = FIND_BEGIN_END.lastIndex;
                match = FIND_BEGIN_END.exec(text);
            }
            if (last < text.length) {
                results.push(renderEmoji({
                    text: text.slice(last),
                    sizeClass,
                    key: count++,
                    i18n,
                    renderNonEmoji: renderNewLines,
                }));
            }
            return results;
        }
    }
    exports.MessageBodyHighlight = MessageBodyHighlight;
})();