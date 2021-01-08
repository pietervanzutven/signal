(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.smart = window.ts.state.smart || {};
    const exports = window.ts.state.smart.CompositionArea = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = window.react_redux;
    const reselect_1 = window.reselect;
    const lodash_1 = window.lodash;
    const actions_1 = window.ts.state.actions;
    const CompositionArea_1 = window.ts.components.CompositionArea;
    const lib_1 = window.ts.components.emoji.lib;
    const user_1 = window.ts.state.selectors.user;
    const conversations_1 = window.ts.state.selectors.conversations;
    const stickers_1 = window.ts.state.selectors.stickers;
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
        const recentStickers = stickers_1.getRecentStickers(state);
        const installedPack = stickers_1.getRecentlyInstalledStickerPack(state);
        const showIntroduction = lodash_1.get(state.items, ['showStickersIntroduction'], false);
        const showPickerHint = lodash_1.get(state.items, ['showStickerPickerHint'], false) &&
            receivedPacks.length > 0;
        const recentEmojis = selectRecentEmojis(state);
        return {
            // Base
            i18n: user_1.getIntl(state),
            startingText: draftText,
            // Emojis
            recentEmojis,
            skinTone: lodash_1.get(state, ['items', 'skinTone'], 0),
            // Stickers
            receivedPacks,
            installedPack,
            blessedPacks,
            knownPacks,
            installedPacks,
            recentStickers,
            showIntroduction,
            showPickerHint,
        };
    };
    const dispatchPropsMap = Object.assign({}, actions_1.mapDispatchToProps, { onSetSkinTone: (tone) => actions_1.mapDispatchToProps.putItem('skinTone', tone), clearShowIntroduction: () => actions_1.mapDispatchToProps.removeItem('showStickersIntroduction'), clearShowPickerHint: () => actions_1.mapDispatchToProps.removeItem('showStickerPickerHint'), onPickEmoji: actions_1.mapDispatchToProps.useEmoji });
    const smart = react_redux_1.connect(mapStateToProps, dispatchPropsMap);
    exports.SmartCompositionArea = smart(CompositionArea_1.CompositionArea);
})();