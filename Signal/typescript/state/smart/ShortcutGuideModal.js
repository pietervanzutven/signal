(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.smart = window.ts.state.smart || {};
    const exports = window.ts.state.smart.ShortcutGuideModal = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = window.react_redux;
    const actions_1 = window.ts.state.actions;
    const ShortcutGuideModal_1 = window.ts.components.ShortcutGuideModal;
    const lib_1 = window.ts.components.stickers.lib;
    const user_1 = window.ts.state.selectors.user;
    const stickers_1 = window.ts.state.selectors.stickers;
    const mapStateToProps = (state, props) => {
        const { close } = props;
        const blessedPacks = stickers_1.getBlessedStickerPacks(state);
        const installedPacks = stickers_1.getInstalledStickerPacks(state);
        const knownPacks = stickers_1.getKnownStickerPacks(state);
        const receivedPacks = stickers_1.getReceivedStickerPacks(state);
        const hasInstalledStickers = lib_1.countStickers({
            knownPacks,
            blessedPacks,
            installedPacks,
            receivedPacks,
        }) > 0;
        const platform = user_1.getPlatform(state);
        return {
            close,
            hasInstalledStickers,
            platform,
            i18n: user_1.getIntl(state),
        };
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartShortcutGuideModal = smart(ShortcutGuideModal_1.ShortcutGuideModal);
})();