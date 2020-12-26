(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.stickers = window.ts.components.stickers || {};
    const exports = window.ts.components.stickers.StickerManager = {};

    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const StickerManagerPackRow_1 = window.ts.components.stickers.StickerManagerPackRow;
    const StickerPreviewModal_1 = window.ts.components.stickers.StickerPreviewModal;
    exports.StickerManager = React.memo(({ installedPacks, receivedPacks, blessedPacks, installStickerPack, uninstallStickerPack, i18n, }) => {
        const [packToPreview, setPackToPreview,] = React.useState(null);
        const clearPackToPreview = React.useCallback(() => {
            setPackToPreview(null);
        }, [setPackToPreview]);
        const previewPack = React.useCallback((pack) => {
            setPackToPreview(pack);
        }, [clearPackToPreview]);
        return (React.createElement(React.Fragment, null,
            packToPreview ? (React.createElement(StickerPreviewModal_1.StickerPreviewModal, { i18n: i18n, pack: packToPreview, onClose: clearPackToPreview, installStickerPack: installStickerPack, uninstallStickerPack: uninstallStickerPack })) : null,
            React.createElement("div", { className: "module-sticker-manager" }, [
                {
                    i18nKey: 'stickers--StickerManager--InstalledPacks',
                    i18nEmptyKey: 'stickers--StickerManager--InstalledPacks--Empty',
                    packs: installedPacks,
                },
                {
                    i18nKey: 'stickers--StickerManager--BlessedPacks',
                    i18nEmptyKey: 'stickers--StickerManager--BlessedPacks--Empty',
                    packs: blessedPacks,
                },
                {
                    i18nKey: 'stickers--StickerManager--ReceivedPacks',
                    i18nEmptyKey: 'stickers--StickerManager--ReceivedPacks--Empty',
                    packs: receivedPacks,
                },
            ].map(section => (React.createElement(React.Fragment, { key: section.i18nKey },
                React.createElement("h2", { className: classnames_1.default('module-sticker-manager__text', 'module-sticker-manager__text--heading') }, i18n(section.i18nKey)),
                section.packs.length > 0 ? (section.packs.map(pack => (React.createElement(StickerManagerPackRow_1.StickerManagerPackRow, { key: pack.id, pack: pack, i18n: i18n, onClickPreview: previewPack, installStickerPack: installStickerPack, uninstallStickerPack: uninstallStickerPack })))) : (React.createElement("div", { className: "module-sticker-manager__empty" }, i18n(section.i18nEmptyKey)))))))));
    });
})();