(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.smart = window.ts.state.smart || {};
    const exports = window.ts.state.smart.StickerButton = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = window.react_redux;
    const lodash_1 = window.lodash;
    const actions_1 = window.ts.state.actions;
    const StickerButton_1 = window.ts.components.stickers.StickerButton;
    const user_1 = window.ts.state.selectors.user;
    const stickers_1 = window.ts.state.selectors.stickers;
    const mapStateToProps = (state) => {
        const receivedPacks = stickers_1.getReceivedStickerPacks(state);
        const installedPacks = stickers_1.getInstalledStickerPacks(state);
        const blessedPacks = stickers_1.getBlessedStickerPacks(state);
        const knownPacks = stickers_1.getKnownStickerPacks(state);
        const recentStickers = stickers_1.getRecentStickers(state);
        const installedPack = stickers_1.getRecentlyInstalledStickerPack(state);
        const showIntroduction = lodash_1.get(state.items, ['showStickersIntroduction'], false);
        const showPickerHint = lodash_1.get(state.items, ['showStickerPickerHint'], false) &&
            receivedPacks.length > 0;
        return {
            receivedPacks,
            installedPack,
            blessedPacks,
            knownPacks,
            installedPacks,
            recentStickers,
            showIntroduction,
            showPickerHint,
            i18n: user_1.getIntl(state),
        };
    };
    const smart = react_redux_1.connect(mapStateToProps, Object.assign({}, actions_1.mapDispatchToProps, { clearShowIntroduction: () => actions_1.mapDispatchToProps.removeItem('showStickersIntroduction'), clearShowPickerHint: () => actions_1.mapDispatchToProps.removeItem('showStickerPickerHint') }));
    exports.SmartStickerButton = smart(StickerButton_1.StickerButton);
})();