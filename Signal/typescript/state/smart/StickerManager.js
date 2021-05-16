require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const StickerManager_1 = require("../../components/stickers/StickerManager");
    const user_1 = require("../selectors/user");
    const stickers_1 = require("../selectors/stickers");
    const mapStateToProps = (state) => {
        const blessedPacks = stickers_1.getBlessedStickerPacks(state);
        const receivedPacks = stickers_1.getReceivedStickerPacks(state);
        const installedPacks = stickers_1.getInstalledStickerPacks(state);
        const knownPacks = stickers_1.getKnownStickerPacks(state);
        return {
            blessedPacks,
            receivedPacks,
            installedPacks,
            knownPacks,
            i18n: user_1.getIntl(state),
        };
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartStickerManager = smart(StickerManager_1.StickerManager);
});