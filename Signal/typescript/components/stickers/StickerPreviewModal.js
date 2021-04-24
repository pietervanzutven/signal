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
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(window.react);
    const react_dom_1 = window.react_dom;
    const lodash_1 = window.lodash;
    const classnames_1 = __importDefault(window.classnames);
    const StickerPackInstallButton_1 = window.ts.components.stickers.StickerPackInstallButton;
    const ConfirmationDialog_1 = window.ts.components.ConfirmationDialog;
    const Spinner_1 = window.ts.components.Spinner;
    const hooks_1 = require("../../util/hooks");
    function renderBody({ pack, i18n }) {
        if (pack && pack.status === 'error') {
            return (React.createElement("div", { className: "module-sticker-manager__preview-modal__container__error" }, i18n('stickers--StickerPreview--Error')));
        }
        if (!pack || pack.stickerCount === 0 || !lodash_1.isNumber(pack.stickerCount)) {
            return React.createElement(Spinner_1.Spinner, { svgSize: "normal" });
        }
        return (React.createElement("div", { className: "module-sticker-manager__preview-modal__container__sticker-grid" },
            pack.stickers.map(({ id, url }) => (React.createElement("div", { key: id, className: "module-sticker-manager__preview-modal__container__sticker-grid__cell" },
                React.createElement("img", { className: "module-sticker-manager__preview-modal__container__sticker-grid__cell__image", src: url, alt: pack.title })))),
            lodash_1.range(pack.stickerCount - pack.stickers.length).map(i => (React.createElement("div", { key: `placeholder-${i}`, className: classnames_1.default('module-sticker-manager__preview-modal__container__sticker-grid__cell', 'module-sticker-manager__preview-modal__container__sticker-grid__cell--placeholder') })))));
    }
    exports.StickerPreviewModal = React.memo(
        // tslint:disable-next-line max-func-body-length
        (props) => {
            const { onClose, pack, i18n, downloadStickerPack, installStickerPack, uninstallStickerPack, } = props;
            const focusRef = React.useRef(null);
            const [root, setRoot] = React.useState(null);
            const [confirmingUninstall, setConfirmingUninstall] = React.useState(false);
            // Restore focus on teardown
            hooks_1.useRestoreFocus(focusRef, root);
            React.useEffect(() => {
                const div = document.createElement('div');
                document.body.appendChild(div);
                setRoot(div);
                return () => {
                    document.body.removeChild(div);
                };
            }, []);
            React.useEffect(() => {
                if (pack && pack.status === 'known') {
                    downloadStickerPack(pack.id, pack.key);
                }
                if (pack &&
                    pack.status === 'error' &&
                    (pack.attemptedStatus === 'downloaded' ||
                        pack.attemptedStatus === 'installed')) {
                    downloadStickerPack(pack.id, pack.key, {
                        finalStatus: pack.attemptedStatus,
                    });
                }
            }, []);
            const isInstalled = Boolean(pack && pack.status === 'installed');
            const handleToggleInstall = React.useCallback(() => {
                if (!pack) {
                    return;
                }
                if (isInstalled) {
                    setConfirmingUninstall(true);
                }
                else if (pack.status === 'ephemeral') {
                    downloadStickerPack(pack.id, pack.key, { finalStatus: 'installed' });
                    onClose();
                }
                else {
                    installStickerPack(pack.id, pack.key);
                    onClose();
                }
            }, [
                isInstalled,
                pack,
                setConfirmingUninstall,
                installStickerPack,
                onClose,
            ]);
            const handleUninstall = React.useCallback(() => {
                if (!pack) {
                    return;
                }
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
                document.addEventListener('keydown', handler);
                return () => {
                    document.removeEventListener('keydown', handler);
                };
            }, [onClose]);
            const handleClickToClose = React.useCallback((e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }, [onClose]);
            return root
                ? react_dom_1.createPortal(React.createElement("div", {
                    // Not really a button. Just a background which can be clicked to close modal
                    role: "button", className: "module-sticker-manager__preview-modal__overlay", onClick: handleClickToClose
                }, confirmingUninstall ? (React.createElement(ConfirmationDialog_1.ConfirmationDialog, {
                    i18n: i18n, onClose: onClose, actions: [
                        {
                            style: 'negative',
                            text: i18n('stickers--StickerManager--Uninstall'),
                            action: handleUninstall,
                        },
                    ]
                }, i18n('stickers--StickerManager--UninstallWarning'))) : (React.createElement("div", { className: "module-sticker-manager__preview-modal__container" },
                    React.createElement("header", { className: "module-sticker-manager__preview-modal__container__header" },
                        React.createElement("h2", { className: "module-sticker-manager__preview-modal__container__header__text" }, i18n('stickers--StickerPreview--Title')),
                        React.createElement("button", { onClick: onClose, className: "module-sticker-manager__preview-modal__container__header__close-button" })),
                    renderBody(props),
                    pack && pack.status !== 'error' ? (React.createElement("div", { className: "module-sticker-manager__preview-modal__container__meta-overlay" },
                        React.createElement("div", { className: "module-sticker-manager__preview-modal__container__meta-overlay__info" },
                            React.createElement("h3", { className: "module-sticker-manager__preview-modal__container__meta-overlay__info__title" },
                                pack.title,
                                pack.isBlessed ? (React.createElement("span", { className: "module-sticker-manager__preview-modal__container__meta-overlay__info__blessed-icon" })) : null),
                            React.createElement("h4", { className: "module-sticker-manager__preview-modal__container__meta-overlay__info__author" }, pack.author)),
                        React.createElement("div", { className: "module-sticker-manager__preview-modal__container__meta-overlay__install" }, pack.status === 'pending' ? (React.createElement(Spinner_1.Spinner, { svgSize: "small", size: "14px" })) : (React.createElement(StickerPackInstallButton_1.StickerPackInstallButton, { ref: focusRef, installed: isInstalled, i18n: i18n, onClick: handleToggleInstall, blue: true }))))) : null))), root)
                : null;
        });
})();