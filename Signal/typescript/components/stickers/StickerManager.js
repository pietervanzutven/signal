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
    const React = __importStar(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const StickerManagerPackRow_1 = require("./StickerManagerPackRow");
    const StickerPreviewModal_1 = require("./StickerPreviewModal");
    exports.StickerManager = React.memo(({ installedPacks, receivedPacks, knownPacks, blessedPacks, downloadStickerPack, installStickerPack, uninstallStickerPack, i18n, }) => {
        const focusRef = React.createRef();
        const [packToPreview, setPackToPreview,] = React.useState(null);
        React.useEffect(() => {
            if (!knownPacks) {
                return;
            }
            knownPacks.forEach(pack => {
                downloadStickerPack(pack.id, pack.key);
            });
            // When this component is created, it's initially not part of the DOM, and then it's
            //   added off-screen and animated in. This ensures that the focus takes.
            setTimeout(() => {
                if (focusRef.current) {
                    focusRef.current.focus();
                }
            });
            // We only want to attempt downloads on initial load
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);
        const clearPackToPreview = React.useCallback(() => {
            setPackToPreview(null);
        }, [setPackToPreview]);
        const previewPack = React.useCallback((pack) => {
            setPackToPreview(pack);
        }, []);
        return (React.createElement(React.Fragment, null,
            packToPreview ? (React.createElement(StickerPreviewModal_1.StickerPreviewModal, { i18n: i18n, pack: packToPreview, onClose: clearPackToPreview, downloadStickerPack: downloadStickerPack, installStickerPack: installStickerPack, uninstallStickerPack: uninstallStickerPack })) : null,
            React.createElement("div", { className: "module-sticker-manager", tabIndex: -1, ref: focusRef }, [
                {
                    i18nKey: 'stickers--StickerManager--InstalledPacks',
                    i18nEmptyKey: 'stickers--StickerManager--InstalledPacks--Empty',
                    packs: installedPacks,
                    hideIfEmpty: false,
                },
                {
                    i18nKey: 'stickers--StickerManager--BlessedPacks',
                    i18nEmptyKey: 'stickers--StickerManager--BlessedPacks--Empty',
                    packs: blessedPacks,
                    hideIfEmpty: true,
                },
                {
                    i18nKey: 'stickers--StickerManager--ReceivedPacks',
                    i18nEmptyKey: 'stickers--StickerManager--ReceivedPacks--Empty',
                    packs: receivedPacks,
                    hideIfEmpty: false,
                },
            ].map(section => {
                if (section.hideIfEmpty && section.packs.length === 0) {
                    return null;
                }
                return (React.createElement(React.Fragment, { key: section.i18nKey },
                    React.createElement("h2", { className: classnames_1.default('module-sticker-manager__text', 'module-sticker-manager__text--heading') }, i18n(section.i18nKey)),
                    section.packs.length > 0 ? (section.packs.map(pack => (React.createElement(StickerManagerPackRow_1.StickerManagerPackRow, { key: pack.id, pack: pack, i18n: i18n, onClickPreview: previewPack, installStickerPack: installStickerPack, uninstallStickerPack: uninstallStickerPack })))) : (React.createElement("div", { className: "module-sticker-manager__empty" }, i18n(section.i18nEmptyKey)))));
            }))));
    });
})();