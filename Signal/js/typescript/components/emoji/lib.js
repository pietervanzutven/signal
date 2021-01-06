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
    const p_queue_1 = __importDefault(window.p_queue);
    exports.skinTones = ['1F3FB', '1F3FC', '1F3FD', '1F3FE', '1F3FF'];
    const data = emoji_datasource_1.default.filter(emoji => emoji.has_img_apple);
    const makeImagePath = (src) => {
        return `node_modules/emoji-datasource-apple/img/apple/64/${src}`;
    };
    const imageQueue = new p_queue_1.default({ concurrency: 10 });
    const images = new Set();
    exports.preloadImages = async () => {
        // Preload images
        const preload = async (src) => new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
            images.add(img);
            // tslint:disable-next-line  no-string-based-set-timeout
            setTimeout(reject, 5000);
        });
        // tslint:disable-next-line no-console
        console.log('Preloading emoji images');
        const start = Date.now();
        data.forEach(emoji => {
            // tslint:disable-next-line no-floating-promises promise-function-async
            imageQueue.add(() => preload(makeImagePath(emoji.image)));
            if (emoji.skin_variations) {
                Object.values(emoji.skin_variations).forEach(variation => {
                    // tslint:disable-next-line no-floating-promises promise-function-async
                    imageQueue.add(() => preload(makeImagePath(variation.image)));
                });
            }
        });
        await imageQueue.onEmpty();
        const end = Date.now();
        // tslint:disable-next-line no-console
        console.log(`Done preloading emoji images in ${end - start}ms`);
    };
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
    function getEmojiData(shortName, skinTone) {
        const base = exports.dataByShortName[shortName];
        if (skinTone && base.skin_variations) {
            const variation = lodash_1.isNumber(skinTone) ? exports.skinTones[skinTone - 1] : skinTone;
            return base.skin_variations[variation];
        }
        return base;
    }
    exports.getEmojiData = getEmojiData;
    function getImagePath(shortName, skinTone) {
        const { image } = getEmojiData(shortName, skinTone);
        return makeImagePath(image);
    }
    exports.getImagePath = getImagePath;
    const fuse = new fuse_js_1.default(data, {
        shouldSort: true,
        threshold: 0.2,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        tokenize: true,
        tokenSeparator: /[-_\s]+/,
        keys: ['name', 'short_name', 'short_names'],
    });
    function search(query, count = 0) {
        const results = fuse.search(query.substr(0, 32));
        if (count) {
            return lodash_1.take(results, count);
        }
        return results;
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
    function hasVariation(shortName, skinTone = 0) {
        if (skinTone === 0) {
            return false;
        }
        const base = exports.dataByShortName[shortName];
        if (!base) {
            return false;
        }
        if (skinTone > 0 && base.skin_variations) {
            const toneKey = exports.skinTones[skinTone - 1];
            return Boolean(base.skin_variations[toneKey]);
        }
        return false;
    }
    exports.hasVariation = hasVariation;
    function convertShortName(shortName, skinTone = 0) {
        const base = exports.dataByShortName[shortName];
        if (!base) {
            return '';
        }
        if (skinTone > 0 && base.skin_variations) {
            const toneKey = exports.skinTones[skinTone - 1];
            const variation = base.skin_variations[toneKey];
            if (variation) {
                return unifiedToEmoji(variation.unified);
            }
        }
        return unifiedToEmoji(base.unified);
    }
    exports.convertShortName = convertShortName;
    function replaceColons(str) {
        return str.replace(/:[a-z0-9-_+]+:(?::skin-tone-[1-5]:)?/gi, m => {
            const [shortName = '', skinTone = '0'] = m
                .replace('skin-tone-', '')
                .toLowerCase()
                .split(':')
                .filter(Boolean);
            if (shortName && isShortName(shortName)) {
                return convertShortName(shortName, parseInt(skinTone, 10));
            }
            return m;
        });
    }
    exports.replaceColons = replaceColons;
})();