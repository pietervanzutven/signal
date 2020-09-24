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
    const is_1 = __importDefault(window.sindresorhus.is);
    const emoji_1 = window.ts.util.emoji;
    const AddNewLines_1 = window.ts.components.conversation.AddNewLines;
    // Some of this logic taken from emoji-js/replacement
    function getImageTag({ match, sizeClass, key, }) {
        const result = emoji_1.getReplacementData(match[0], match[1], match[2]);
        if (is_1.default.string(result)) {
            return react_1.default.createElement("span", { key: key }, match[0]);
        }
        const img = emoji_1.findImage(result.value, result.variation);
        const title = emoji_1.getTitle(result.value);
        return (react_1.default.createElement("img", { key: key, src: img.path, className: classnames_1.default('emoji', sizeClass), "data-codepoints": img.full_idx, title: `:${title}:` }));
    }
    class Emojify extends react_1.default.Component {
        render() {
            const { text, sizeClass } = this.props;
            const results = [];
            const regex = emoji_1.getRegex();
            let match = regex.exec(text);
            let last = 0;
            let count = 1;
            if (!match) {
                return react_1.default.createElement(AddNewLines_1.AddNewLines, { text: text });
            }
            while (match) {
                if (last < match.index) {
                    const textWithNoEmoji = text.slice(last, match.index);
                    results.push(react_1.default.createElement(AddNewLines_1.AddNewLines, { key: count++, text: textWithNoEmoji }));
                }
                results.push(getImageTag({ match, sizeClass, key: count++ }));
                last = regex.lastIndex;
                match = regex.exec(text);
            }
            if (last < text.length) {
                results.push(react_1.default.createElement(AddNewLines_1.AddNewLines, { key: count++, text: text.slice(last) }));
            }
            return react_1.default.createElement("span", null, results);
        }
    }
    exports.Emojify = Emojify;
})();