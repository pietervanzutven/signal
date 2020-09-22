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
    const linkify_it_1 = __importDefault(window.linkify_it.linkify_it);
    const Emojify_1 = window.ts.components.conversation.Emojify;
    const linkify = linkify_it_1.default();
    const SUPPORTED_PROTOCOLS = /^(http|https):/i;
    class MessageBody extends react_1.default.Component {
        render() {
            const { text, disableJumbomoji, disableLinks } = this.props;
            const matchData = linkify.match(text) || [];
            const results = [];
            let last = 0;
            let count = 1;
            // We only use this sizeClass if there was no link detected, because jumbo emoji
            //   only fire when there's no other text in the message.
            const sizeClass = disableJumbomoji ? '' : Emojify_1.getSizeClass(text);
            if (disableLinks || matchData.length === 0) {
                return react_1.default.createElement(Emojify_1.Emojify, { text: text, sizeClass: sizeClass });
            }
            matchData.forEach((match) => {
                if (last < match.index) {
                    const textWithNoLink = text.slice(last, match.index);
                    results.push(react_1.default.createElement(Emojify_1.Emojify, { key: count++, text: textWithNoLink }));
                }
                const { url, text: originalText } = match;
                if (SUPPORTED_PROTOCOLS.test(url)) {
                    results.push(react_1.default.createElement("a", { key: count++, href: url }, originalText));
                }
                else {
                    results.push(react_1.default.createElement(Emojify_1.Emojify, { key: count++, text: originalText }));
                }
                last = match.lastIndex;
            });
            if (last < text.length) {
                results.push(react_1.default.createElement(Emojify_1.Emojify, { key: count++, text: text.slice(last) }));
            }
            return react_1.default.createElement("span", null, results);
        }
    }
    exports.MessageBody = MessageBody;
})();