(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.Emojify = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const emoji_regex_1 = __importDefault(window.emoji_regex);
    const lib_1 = window.ts.components.emoji.lib;
    // Some of this logic taken from emoji-js/replacement
    function getImageTag({ match, sizeClass, key, }) {
        const img = lib_1.emojiToImage(match[0]);
        if (!img) {
            return match[0];
        }
        return (
            // tslint:disable-next-line react-a11y-img-has-alt
            react_1.default.createElement("img", { key: key, src: img, "aria-label": match[0], className: classnames_1.default('emoji', sizeClass), title: match[0] }));
    }
    class Emojify extends react_1.default.Component {
        render() {
            const { text, sizeClass, renderNonEmoji } = this.props;
            const results = [];
            const regex = emoji_regex_1.default();
            // We have to do this, because renderNonEmoji is not required in our Props object,
            //  but it is always provided via defaultProps.
            if (!renderNonEmoji) {
                return;
            }
            let match = regex.exec(text);
            let last = 0;
            let count = 1;
            if (!match) {
                return renderNonEmoji({ text, key: 0 });
            }
            while (match) {
                if (last < match.index) {
                    const textWithNoEmoji = text.slice(last, match.index);
                    results.push(renderNonEmoji({ text: textWithNoEmoji, key: count++ }));
                }
                results.push(getImageTag({ match, sizeClass, key: count++ }));
                last = regex.lastIndex;
                match = regex.exec(text);
            }
            if (last < text.length) {
                results.push(renderNonEmoji({ text: text.slice(last), key: count++ }));
            }
            return results;
        }
    }
    Emojify.defaultProps = {
        renderNonEmoji: ({ text }) => text,
    };
    exports.Emojify = Emojify;
})();