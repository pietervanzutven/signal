(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.util = window.ts.util || {};
    const exports = window.ts.util.emoji = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    // @ts-ignore
    const emoji_js_1 = __importDefault(window.emoji_js);
    const instance = new emoji_js_1.default();
    instance.init_unified();
    instance.init_colons();
    instance.img_sets.apple.path =
        'node_modules/emoji-datasource-apple/img/apple/64/';
    instance.include_title = true;
    instance.replace_mode = 'img';
    instance.supports_css = false; // needed to avoid spans with background-image
    function getRegex() {
        return instance.rx_unified;
    }
    exports.getRegex = getRegex;
    function getTitle(value) {
        return instance.data[value][3][0];
    }
    exports.getTitle = getTitle;
    function findImage(value, variation) {
        return instance.find_image(value, variation);
    }
    exports.findImage = findImage;
    function replaceColons(str) {
        return str.replace(instance.rx_colons, m => {
            const name = m.substr(1, m.length - 2);
            const code = instance.map.colons[name];
            if (code) {
                return instance.data[code][0][0];
            }
            return m;
        });
    }
    exports.replaceColons = replaceColons;
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
    const VARIATION_LOOKUP = {
        '\uD83C\uDFFB': '1f3fb',
        '\uD83C\uDFFC': '1f3fc',
        '\uD83C\uDFFD': '1f3fd',
        '\uD83C\uDFFE': '1f3fe',
        '\uD83C\uDFFF': '1f3ff',
    };
    // Taken from emoji-js/replace_unified
    function getReplacementData(m, p1, p2) {
        const unified = instance.map.unified[p1];
        if (unified) {
            const variation = VARIATION_LOOKUP[p2 || ''];
            if (variation) {
                return {
                    value: unified,
                    variation,
                };
            }
            return {
                value: unified,
            };
        }
        const unifiedVars = instance.map.unified_vars[p1];
        if (unifiedVars) {
            return {
                value: unifiedVars[0],
                variation: unifiedVars[1],
            };
        }
        return m;
    }
    exports.getReplacementData = getReplacementData;
})();