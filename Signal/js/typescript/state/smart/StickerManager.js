(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.smart = window.ts.state.smart || {};
    const exports = window.ts.state.smart.StickerManager = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = window.react_redux;
    const actions_1 = window.ts.state.actions;
    const StickerManager_1 = window.ts.components.stickers.StickerManager;
    const user_1 = window.ts.state.selectors.user;
    const stickers_1 = window.ts.state.selectors.stickers;
    const mapStateToProps = (state) => {
        const blessedPacks = stickers_1.getBlessedStickerPacks(state);
        const receivedPacks = stickers_1.getReceivedStickerPacks(state);
        const installedPacks = stickers_1.getInstalledStickerPacks(state);
        return {
            blessedPacks,
            receivedPacks,
            installedPacks,
            i18n: user_1.getIntl(state),
        };
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartStickerManager = smart(StickerManager_1.StickerManager);
})();