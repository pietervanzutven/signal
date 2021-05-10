(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.smart = window.ts.state.smart || {};
    const exports = window.ts.state.smart.StickerPreviewModal = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const StickerPreviewModal_1 = require("../../components/stickers/StickerPreviewModal");
    const user_1 = require("../selectors/user");
    const stickers_1 = require("../selectors/stickers");
    const mapStateToProps = (state, props) => {
        const { packId } = props;
        const stickersPath = user_1.getStickersPath(state);
        const tempPath = user_1.getTempPath(state);
        const packs = stickers_1.getPacks(state);
        const blessedPacks = stickers_1.getBlessedPacks(state);
        const pack = packs[packId];
        return Object.assign(Object.assign({}, props), {
            pack: pack
                ? stickers_1.translatePackFromDB(pack, packs, blessedPacks, stickersPath, tempPath)
                : undefined, i18n: user_1.getIntl(state)
        });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartStickerPreviewModal = smart(StickerPreviewModal_1.StickerPreviewModal);
})();