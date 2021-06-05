require(exports => {
    "use strict";
    // Copyright 2019-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    // Camelcase disabled due to emoji-datasource using snake_case
    /* eslint-disable camelcase */
    const emoji_datasource_1 = __importDefault(require("emoji-datasource"));
    const emoji_regex_1 = __importDefault(require("emoji-regex"));
    const lodash_1 = require("lodash");
    const fuse_js_1 = __importDefault(require("fuse.js"));
    const p_queue_1 = __importDefault(require("p-queue"));
    const is_1 = __importDefault(require("@sindresorhus/is"));
    const getOwn_1 = require("../../util/getOwn");
    exports.skinTones = ['1F3FB', '1F3FC', '1F3FD', '1F3FE', '1F3FF'];
    const data = emoji_datasource_1.default
        .filter(emoji => emoji.has_img_apple)
        .map(emoji =>
            // Why this weird map?
            // the emoji dataset has two separate categories for Emotions and People
            // yet in our UI we display these as a single merged category. In order
            // for the emojis to be sorted properly we're manually incrementing the
            // sort_order for the People & Body emojis so that they fall below the
            // Smiley & Emotions category.
            emoji.category === 'People & Body'
                ? Object.assign(Object.assign({}, emoji), { sort_order: emoji.sort_order + 1000 }) : emoji);
    const ROOT_PATH = lodash_1.get(typeof window !== 'undefined' ? window : null, 'ROOT_PATH', '');
    const makeImagePath = (src) => {
        return `${ROOT_PATH}node_modules/emoji-datasource-apple/img/apple/64/${src}`;
    };
    const imageQueue = new p_queue_1.default({ concurrency: 10, timeout: 1000 * 60 * 2 });
    const images = new Set();
    exports.preloadImages = async () => {
        // Preload images
        const preload = async (src) => new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
            images.add(img);
            setTimeout(reject, 5000);
        });
        window.log.info('Preloading emoji images');
        const start = Date.now();
        data.forEach(emoji => {
            imageQueue.add(() => preload(makeImagePath(emoji.image)));
            if (emoji.skin_variations) {
                Object.values(emoji.skin_variations).forEach(variation => {
                    imageQueue.add(() => preload(makeImagePath(variation.image)));
                });
            }
        });
        await imageQueue.onEmpty();
        const end = Date.now();
        window.log.info(`Done preloading emoji images in ${end - start}ms`);
    };
    const dataByShortName = lodash_1.keyBy(data, 'short_name');
    const imageByEmoji = {};
    const dataByEmoji = {};
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
        if (category === 'Smileys & Emotion') {
            return 'emoji';
        }
        if (category === 'People & Body') {
            return 'emoji';
        }
        if (category === 'Symbols') {
            return 'symbol';
        }
        return 'misc';
    }), arr => lodash_1.sortBy(arr, 'sort_order'));
    function getEmojiData(shortName, skinTone) {
        const base = dataByShortName[shortName];
        if (skinTone && base.skin_variations) {
            const variation = lodash_1.isNumber(skinTone) ? exports.skinTones[skinTone - 1] : skinTone;
            if (base.skin_variations[variation]) {
                return base.skin_variations[variation];
            }
            // For emojis that have two people in them which can have diff skin tones
            // the Map is of SkinTone-SkinTone. If we don't find the correct skin tone
            // in the list of variations then we assume it is one of those double skin
            // emojis and we default to both people having same skin.
            return base.skin_variations[`${variation}-${variation}`];
        }
        return base;
    }
    exports.getEmojiData = getEmojiData;
    function getImagePath(shortName, skinTone) {
        const emojiData = getEmojiData(shortName, skinTone);
        return makeImagePath(emojiData.image);
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
        // We reverse it because fuse returns low-score results first!
        const results = fuse.search(query.substr(0, 32)).reverse();
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
    function convertShortNameToData(shortName, skinTone = 0) {
        const base = dataByShortName[shortName];
        if (!base) {
            return undefined;
        }
        const toneKey = is_1.default.number(skinTone) ? exports.skinTones[skinTone - 1] : skinTone;
        if (skinTone && base.skin_variations) {
            const variation = base.skin_variations[toneKey];
            if (variation) {
                return Object.assign(Object.assign({}, base), variation);
            }
        }
        return base;
    }
    exports.convertShortNameToData = convertShortNameToData;
    function convertShortName(shortName, skinTone = 0) {
        const emojiData = convertShortNameToData(shortName, skinTone);
        if (!emojiData) {
            return '';
        }
        return unifiedToEmoji(emojiData.unified);
    }
    exports.convertShortName = convertShortName;
    function emojiToImage(emoji) {
        return getOwn_1.getOwn(imageByEmoji, emoji);
    }
    exports.emojiToImage = emojiToImage;
    function emojiToData(emoji) {
        return getOwn_1.getOwn(dataByEmoji, emoji);
    }
    exports.emojiToData = emojiToData;
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
    function getSizeClass(str) {
        // Do we have non-emoji characters?
        if (str.replace(emoji_regex_1.default(), '').trim().length > 0) {
            return '';
        }
        const emojiCount = getCountOfAllMatches(str, emoji_regex_1.default());
        if (emojiCount > 8) {
            return '';
        }
        if (emojiCount > 6) {
            return 'small';
        }
        if (emojiCount > 4) {
            return 'medium';
        }
        if (emojiCount > 2) {
            return 'large';
        }
        return 'jumbo';
    }
    exports.getSizeClass = getSizeClass;
    data.forEach(emoji => {
        const { short_name, short_names, skin_variations, image } = emoji;
        if (short_names) {
            short_names.forEach(name => {
                dataByShortName[name] = emoji;
            });
        }
        imageByEmoji[convertShortName(short_name)] = makeImagePath(image);
        dataByEmoji[convertShortName(short_name)] = emoji;
        if (skin_variations) {
            Object.entries(skin_variations).forEach(([tone, variation]) => {
                imageByEmoji[convertShortName(short_name, tone)] = makeImagePath(variation.image);
                dataByEmoji[convertShortName(short_name, tone)] = emoji;
            });
        }
    });
});