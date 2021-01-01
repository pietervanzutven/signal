(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.stickers = window.ts.components.stickers || {};
    const exports = window.ts.components.stickers.StickerManagerPackRow = {};

    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(window.react);
    const StickerPackInstallButton_1 = window.ts.components.stickers.StickerPackInstallButton;
    const ConfirmationModal_1 = window.ts.components.ConfirmationModal;
    exports.StickerManagerPackRow = React.memo(
        // tslint:disable-next-line max-func-body-length
        ({ installStickerPack, uninstallStickerPack, onClickPreview, pack, i18n, }) => {
            const { id, key, isBlessed } = pack;
            const [uninstalling, setUninstalling] = React.useState(false);
            const clearUninstalling = React.useCallback(() => {
                setUninstalling(false);
            }, [setUninstalling]);
            const handleInstall = React.useCallback((e) => {
                e.stopPropagation();
                if (installStickerPack) {
                    installStickerPack(id, key);
                }
            }, [installStickerPack, pack]);
            const handleUninstall = React.useCallback((e) => {
                e.stopPropagation();
                if (isBlessed && uninstallStickerPack) {
                    uninstallStickerPack(id, key);
                }
                else {
                    setUninstalling(true);
                }
            }, [setUninstalling, id, key, isBlessed]);
            const handleConfirmUninstall = React.useCallback(() => {
                clearUninstalling();
                if (uninstallStickerPack) {
                    uninstallStickerPack(id, key);
                }
            }, [id, key, clearUninstalling]);
            const handleClickPreview = React.useCallback(() => {
                if (onClickPreview) {
                    onClickPreview(pack);
                }
            }, [onClickPreview, pack]);
            return (React.createElement(React.Fragment, null,
                uninstalling ? (React.createElement(ConfirmationModal_1.ConfirmationModal, { i18n: i18n, onClose: clearUninstalling, negativeText: i18n('stickers--StickerManager--Uninstall'), onNegative: handleConfirmUninstall }, i18n('stickers--StickerManager--UninstallWarning'))) : null,
                React.createElement("div", { role: "button", onClick: handleClickPreview, className: "module-sticker-manager__pack-row" },
                    pack.cover ? (React.createElement("img", { src: pack.cover.url, alt: pack.title, className: "module-sticker-manager__pack-row__cover" })) : (React.createElement("div", { className: "module-sticker-manager__pack-row__cover-placeholder" })),
                    React.createElement("div", { className: "module-sticker-manager__pack-row__meta" },
                        React.createElement("div", { className: "module-sticker-manager__pack-row__meta__title" },
                            pack.title,
                            pack.isBlessed ? (React.createElement("span", { className: "module-sticker-manager__pack-row__meta__blessed-icon" })) : null),
                        React.createElement("div", { className: "module-sticker-manager__pack-row__meta__author" }, pack.author)),
                    React.createElement("div", { className: "module-sticker-manager__pack-row__controls" }, pack.status === 'installed' ? (React.createElement(StickerPackInstallButton_1.StickerPackInstallButton, { installed: true, i18n: i18n, onClick: handleUninstall })) : (React.createElement(StickerPackInstallButton_1.StickerPackInstallButton, { installed: false, i18n: i18n, onClick: handleInstall }))))));
        });
})();