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
    // @ts-ignore
    const emoji_js_1 = __importDefault(window.emoji_js);
    const AddNewLines_1 = window.ts.components.conversation.AddNewLines;
    function getCountOfAllMatches(str, regex) {
        let match = regex.exec(str);
        let count = 0;
        if (!regex.global) {
            return match ? 1 : 0;
        }
        while (match) {
            count += 1;
            match = regex.exec(str);
        }
        return count;
    }
    function hasNormalCharacters(str) {
        const noEmoji = str.replace(instance.rx_unified, '').trim();
        return noEmoji.length > 0;
    }
    function getSizeClass(str) {
        if (hasNormalCharacters(str)) {
            return '';
        }
        const emojiCount = getCountOfAllMatches(str, instance.rx_unified);
        if (emojiCount > 8) {
            return '';
        }
        else if (emojiCount > 6) {
            return 'small';
        }
        else if (emojiCount > 4) {
            return 'medium';
        }
        else if (emojiCount > 2) {
            return 'large';
        }
        else {
            return 'jumbo';
        }
    }
    exports.getSizeClass = getSizeClass;
    // Taken from emoji-js/replace_unified
    function getEmojiReplacementData(m, p1, p2) {
        let val = instance.map.unified[p1];
        if (val) {
            let idx = null;
            if (p2 === '\uD83C\uDFFB') {
                idx = '1f3fb';
            }
            if (p2 === '\uD83C\uDFFC') {
                idx = '1f3fc';
            }
            if (p2 === '\uD83C\uDFFD') {
                idx = '1f3fd';
            }
            if (p2 === '\uD83C\uDFFE') {
                idx = '1f3fe';
            }
            if (p2 === '\uD83C\uDFFF') {
                idx = '1f3ff';
            }
            if (idx) {
                return {
                    idx,
                    actual: p2,
                };
            }
            return {
                idx: val,
            };
        }
        val = instance.map.unified_vars[p1];
        if (val) {
            return {
                idx: val[1],
                actual: '',
            };
        }
        return m;
    }
    // Some of this logic taken from emoji-js/replacement
    function getImageTag({ match, sizeClass, key, }) {
        const result = getEmojiReplacementData(match[0], match[1], match[2]);
        if (is_1.default.string(result)) {
            return react_1.default.createElement("span", { key: key }, match[0]);
        }
        const img = instance.find_image(result.idx);
        const title = instance.data[result.idx][3][0];
        return (react_1.default.createElement("img", { key: key, src: img.path, className: classnames_1.default('emoji', sizeClass), "data-codepoints": img.full_idx, title: `:${title}:` }));
    }
    const instance = new emoji_js_1.default();
    instance.init_unified();
    instance.init_colons();
    instance.img_sets.apple.path =
        'node_modules/emoji-datasource-apple/img/apple/64/';
    instance.include_title = true;
    instance.replace_mode = 'img';
    instance.supports_css = false; // needed to avoid spans with background-image
    class Emojify extends react_1.default.Component {
        render() {
            const { text, sizeClass } = this.props;
            const results = [];
            let match = instance.rx_unified.exec(text);
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
                last = instance.rx_unified.lastIndex;
                match = instance.rx_unified.exec(text);
            }
            if (last < text.length) {
                results.push(react_1.default.createElement(AddNewLines_1.AddNewLines, { key: count++, text: text.slice(last) }));
            }
            return react_1.default.createElement("span", null, results);
        }
    }
    exports.Emojify = Emojify;
})();