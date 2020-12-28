(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.emoji = window.ts.components.emoji || {};
    const exports = window.ts.components.emoji.lib = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    // @ts-ignore: untyped json
    const emoji_datasource_1 = __importDefault(window.emoji_datasource);
    const lodash_1 = window.lodash;
    const fuse_js_1 = __importDefault(window.fuse_js);
    exports.skinTones = ['1F3FB', '1F3FC', '1F3FD', '1F3FE', '1F3FF'];
    const data = emoji_datasource_1.default;
    exports.dataByShortName = lodash_1.keyBy(data, 'short_name');
    data.forEach(emoji => {
        const { short_names } = emoji;
        if (short_names) {
            short_names.forEach(name => {
                exports.dataByShortName[name] = emoji;
            });
        }
    });
    exports.dataByCategory = lodash_1.mapValues(lodash_1.groupBy(data, ({ category }) => {
        if (category === 'Activities') {
            return 'activity';
        }
        if (category === 'Animals & Nature') {
            return 'animal';
        }
        if (category === 'Flags') {
            return 'flag';
        }
        if (category === 'Food & Drink') {
            return 'food';
        }
        if (category === 'Objects') {
            return 'object';
        }
        if (category === 'Travel & Places') {
            return 'travel';
        }
        if (category === 'Smileys & People') {
            return 'emoji';
        }
        if (category === 'Symbols') {
            return 'symbol';
        }
        return 'misc';
    }), arr => lodash_1.sortBy(arr, 'sort_order'));
    function getSheetCoordinates(shortName, skinTone) {
        const base = exports.dataByShortName[shortName];
        if (skinTone && base.skin_variations) {
            const variation = lodash_1.isNumber(skinTone) ? exports.skinTones[skinTone - 1] : skinTone;
            const { sheet_x, sheet_y } = base.skin_variations[variation];
            return [sheet_x, sheet_y];
        }
        return [base.sheet_x, base.sheet_y];
    }
    exports.getSheetCoordinates = getSheetCoordinates;
    const fuse = new fuse_js_1.default(data, {
        shouldSort: true,
        threshold: 0.3,
        location: 0,
        distance: 5,
        maxPatternLength: 20,
        minMatchCharLength: 1,
        keys: ['name', 'short_name', 'short_names'],
    });
    function search(query) {
        return fuse.search(query);
    }
    exports.search = search;
    const shortNames = new Set([
        ...lodash_1.map(data, 'short_name'),
        ...lodash_1.compact(lodash_1.flatMap(data, 'short_names')),
    ]);
    function isShortName(name) {
        return shortNames.has(name);
    }
    exports.isShortName = isShortName;
    function unifiedToEmoji(unified) {
        return unified
            .split('-')
            .map(c => String.fromCodePoint(parseInt(c, 16)))
            .join('');
    }
    exports.unifiedToEmoji = unifiedToEmoji;
    function convertShortName(shortName, skinTone = 0) {
        const base = exports.dataByShortName[shortName];
        if (!base) {
            return '';
        }
        if (skinTone && base.skin_variations) {
            const toneKey = exports.skinTones[0];
            const variation = base.skin_variations[toneKey];
            if (variation) {
                return unifiedToEmoji(variation.unified);
            }
        }
        return unifiedToEmoji(base.unified);
    }
    exports.convertShortName = convertShortName;
    function replaceColons(str) {
        return str.replace(/:[a-z0-9-_+]+:(?::skin-tone-[1-4]:)?/gi, m => {
            const [shortName = '', skinTone = '0'] = m
                .replace('skin-tone-', '')
                .split(':')
                .filter(Boolean);
            if (shortName) {
                return convertShortName(shortName, parseInt(skinTone, 10));
            }
            return m;
        });
    }
    exports.replaceColons = replaceColons;
})();