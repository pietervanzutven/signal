(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.Linkify = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const linkify_it_1 = __importDefault(window.linkify_it.linkify_it);
    const linkify = linkify_it_1.default();
    const SUPPORTED_PROTOCOLS = /^(http|https):/i;
    class Linkify extends react_1.default.Component {
        render() {
            const { text, renderNonLink } = this.props;
            const matchData = linkify.match(text) || [];
            const results = [];
            let last = 0;
            let count = 1;
            // We have to do this, because renderNonLink is not required in our Props object,
            //  but it is always provided via defaultProps.
            if (!renderNonLink) {
                return;
            }
            if (matchData.length === 0) {
                return renderNonLink({ text, key: 0 });
            }
            matchData.forEach((match) => {
                if (last < match.index) {
                    const textWithNoLink = text.slice(last, match.index);
                    results.push(renderNonLink({ text: textWithNoLink, key: count++ }));
                }
                const { url, text: originalText } = match;
                if (SUPPORTED_PROTOCOLS.test(url)) {
                    results.push(react_1.default.createElement("a", { key: count++, href: url }, originalText));
                }
                else {
                    results.push(renderNonLink({ text: originalText, key: count++ }));
                }
                last = match.lastIndex;
            });
            if (last < text.length) {
                results.push(renderNonLink({ text: text.slice(last), key: count++ }));
            }
            return results;
        }
    }
    Linkify.defaultProps = {
        renderNonLink: ({ text, key }) => react_1.default.createElement("span", { key: key }, text),
    };
    exports.Linkify = Linkify;
})();