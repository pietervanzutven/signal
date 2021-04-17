(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.smart = window.ts.state.smart || {};
    const exports = window.ts.state.smart.EmojiPicker = {};

    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(window.react);
    const react_redux_1 = window.react_redux;
    const lodash_1 = window.lodash;
    const items_1 = window.ts.state.ducks.items;
    const emojis_1 = window.ts.state.ducks.emojis;
    const EmojiPicker_1 = window.ts.components.emoji.EmojiPicker;
    const user_1 = window.ts.state.selectors.user;
    exports.SmartEmojiPicker = React.forwardRef(({ onPickEmoji, onClose, style, disableSkinTones }, ref) => {
        const i18n = react_redux_1.useSelector(user_1.getIntl);
        const skinTone = react_redux_1.useSelector(state => lodash_1.get(state, ['items', 'skinTone'], 0));
        const recentEmojis = items_1.useRecentEmojis();
        const { putItem } = items_1.useActions();
        const onSetSkinTone = React.useCallback(tone => {
            putItem('skinTone', tone);
        }, [putItem]);
        const { onUseEmoji } = emojis_1.useActions();
        const handlePickEmoji = React.useCallback(data => {
            onUseEmoji({ shortName: data.shortName });
            onPickEmoji(data);
        }, [onUseEmoji, onPickEmoji]);
        return (React.createElement(EmojiPicker_1.EmojiPicker, { ref: ref, i18n: i18n, skinTone: skinTone, onSetSkinTone: onSetSkinTone, onPickEmoji: handlePickEmoji, recentEmojis: recentEmojis, onClose: onClose, style: style, disableSkinTones: disableSkinTones }));
    });
})();