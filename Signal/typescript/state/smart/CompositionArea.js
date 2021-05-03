(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.smart = window.ts.state.smart || {};
    const exports = window.ts.state.smart.CompositionArea = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const reselect_1 = require("reselect");
    const lodash_1 = require("lodash");
    const actions_1 = require("../actions");
    const CompositionArea_1 = require("../../components/CompositionArea");
    const lib_1 = require("../../components/emoji/lib");
    const user_1 = require("../selectors/user");
    const conversations_1 = require("../selectors/conversations");
    const stickers_1 = require("../selectors/stickers");
    const selectRecentEmojis = reselect_1.createSelector(({ emojis }) => emojis.recents, recents => recents.filter(lib_1.isShortName));
    const mapStateToProps = (state, props) => {
        const { id } = props;
        const conversation = conversations_1.getConversationSelector(state)(id);
        if (!conversation) {
            throw new Error(`Conversation id ${id} not found!`);
        }
        const { draftText } = conversation;
        const receivedPacks = stickers_1.getReceivedStickerPacks(state);
        const installedPacks = stickers_1.getInstalledStickerPacks(state);
        const blessedPacks = stickers_1.getBlessedStickerPacks(state);
        const knownPacks = stickers_1.getKnownStickerPacks(state);
        const installedPack = stickers_1.getRecentlyInstalledStickerPack(state);
        const recentStickers = stickers_1.getRecentStickers(state);
        const showIntroduction = lodash_1.get(state.items, ['showStickersIntroduction'], false);
        const showPickerHint = lodash_1.get(state.items, ['showStickerPickerHint'], false) &&
            receivedPacks.length > 0;
        const recentEmojis = selectRecentEmojis(state);
        return Object.assign(Object.assign({
            // Base
            i18n: user_1.getIntl(state), startingText: draftText,
            // Emojis
            recentEmojis, skinTone: lodash_1.get(state, ['items', 'skinTone'], 0),
            // Stickers
            receivedPacks,
            // 'Installed Pack' tooltip disabled for now
            installedPack: null,
            blessedPacks,
            knownPacks,
            installedPacks,
            recentStickers,
            showIntroduction,
            showPickerHint
        }, conversation), { conversationType: conversation.type });
    };
    const dispatchPropsMap = Object.assign(Object.assign({}, actions_1.mapDispatchToProps), { onSetSkinTone: (tone) => actions_1.mapDispatchToProps.putItem('skinTone', tone), clearShowIntroduction: () => actions_1.mapDispatchToProps.removeItem('showStickersIntroduction'), clearShowPickerHint: () => actions_1.mapDispatchToProps.removeItem('showStickerPickerHint'), onPickEmoji: actions_1.mapDispatchToProps.onUseEmoji });
    const smart = react_redux_1.connect(mapStateToProps, dispatchPropsMap);
    exports.SmartCompositionArea = smart(CompositionArea_1.CompositionArea);
})();