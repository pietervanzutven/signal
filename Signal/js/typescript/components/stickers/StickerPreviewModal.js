(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.stickers = window.ts.components.stickers || {};
    const exports = window.ts.components.stickers.StickerPreviewModal = {};

    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(window.react);
    const react_dom_1 = window.react_dom;
    const StickerPackInstallButton_1 = window.ts.components.stickers.StickerPackInstallButton;
    const ConfirmationDialog_1 = window.ts.components.ConfirmationDialog;
    function focusRef(el) {
        if (el) {
            el.focus();
        }
    }
    exports.StickerPreviewModal = React.memo(
        // tslint:disable-next-line max-func-body-length
        ({ onClose, pack, i18n, installStickerPack, uninstallStickerPack, }) => {
            const [root, setRoot] = React.useState(null);
            const [confirmingUninstall, setConfirmingUninstall] = React.useState(false);
            React.useEffect(() => {
                const div = document.createElement('div');
                document.body.appendChild(div);
                setRoot(div);
                return () => {
                    document.body.removeChild(div);
                    setRoot(null);
                };
            }, []);
            const isInstalled = pack.status === 'installed';
            const handleToggleInstall = React.useCallback(() => {
                if (isInstalled) {
                    setConfirmingUninstall(true);
                }
                else {
                    installStickerPack(pack.id, pack.key);
                    onClose();
                }
            }, [isInstalled, pack, setConfirmingUninstall, installStickerPack, onClose]);
            const handleUninstall = React.useCallback(() => {
                uninstallStickerPack(pack.id, pack.key);
                setConfirmingUninstall(false);
                // onClose is called by the confirmation modal
            }, [uninstallStickerPack, setConfirmingUninstall, pack]);
            React.useEffect(() => {
                const handler = ({ key }) => {
                    if (key === 'Escape') {
                        onClose();
                    }
                };
                document.addEventListener('keyup', handler);
                return () => {
                    document.removeEventListener('keyup', handler);
                };
            }, [onClose]);
            const handleClickToClose = React.useCallback((e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }, [onClose]);
            return root
                ? react_dom_1.createPortal(React.createElement("div", { role: "button", className: "module-sticker-manager__preview-modal__overlay", onClick: handleClickToClose }, confirmingUninstall ? (React.createElement(ConfirmationDialog_1.ConfirmationDialog, { i18n: i18n, onClose: onClose, negativeText: i18n('stickers--StickerManager--Uninstall'), onNegative: handleUninstall }, i18n('stickers--StickerManager--UninstallWarning'))) : (React.createElement("div", { className: "module-sticker-manager__preview-modal__container" },
                    React.createElement("header", { className: "module-sticker-manager__preview-modal__container__header" },
                        React.createElement("h2", { className: "module-sticker-manager__preview-modal__container__header__text" }, i18n('stickers--StickerPreview--Title')),
                        React.createElement("button", { onClick: onClose, className: "module-sticker-manager__preview-modal__container__header__close-button" })),
                    React.createElement("div", { className: "module-sticker-manager__preview-modal__container__sticker-grid" }, pack.stickers.map(({ id, url }) => (React.createElement("div", { key: id, className: "module-sticker-manager__preview-modal__container__sticker-grid__cell" },
                        React.createElement("img", { className: "module-sticker-manager__preview-modal__container__sticker-grid__cell__image", src: url, alt: pack.title }))))),
                    React.createElement("div", { className: "module-sticker-manager__preview-modal__container__meta-overlay" },
                        React.createElement("div", { className: "module-sticker-manager__preview-modal__container__meta-overlay__info" },
                            React.createElement("h3", { className: "module-sticker-manager__preview-modal__container__meta-overlay__info__title" },
                                pack.title,
                                pack.isBlessed ? (React.createElement("span", { className: "module-sticker-manager__preview-modal__container__meta-overlay__info__blessed-icon" })) : null),
                            React.createElement("h4", { className: "module-sticker-manager__preview-modal__container__meta-overlay__info__author" }, pack.author)),
                        React.createElement("div", { className: "module-sticker-manager__preview-modal__container__meta-overlay__install" },
                            React.createElement(StickerPackInstallButton_1.StickerPackInstallButton, { ref: focusRef, installed: isInstalled, i18n: i18n, onClick: handleToggleInstall, blue: true })))))), root)
                : null;
        });
})();