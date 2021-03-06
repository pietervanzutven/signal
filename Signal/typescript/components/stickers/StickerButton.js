(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.stickers = window.ts.components.stickers || {};
    const exports = window.ts.components.stickers.StickerButton = {};

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
    const lodash_1 = require("lodash");
    const react_popper_1 = require("react-popper");
    const react_dom_1 = require("react-dom");
    const StickerPicker_1 = require("./StickerPicker");
    const lib_1 = require("./lib");
    exports.StickerButton = React.memo(({ i18n, clearInstalledStickerPack, onClickAddPack, onPickSticker, recentStickers, receivedPacks, installedPack, installedPacks, blessedPacks, knownPacks, showIntroduction, clearShowIntroduction, showPickerHint, clearShowPickerHint, position = 'top-end', }) => {
        const [open, setOpen] = React.useState(false);
        const [popperRoot, setPopperRoot] = React.useState(null);
        const handleClickButton = React.useCallback(() => {
            // Clear tooltip state
            clearInstalledStickerPack();
            clearShowIntroduction();
            // Handle button click
            if (installedPacks.length === 0) {
                onClickAddPack();
            }
            else if (popperRoot) {
                setOpen(false);
            }
            else {
                setOpen(true);
            }
        }, [
            clearInstalledStickerPack,
            clearShowIntroduction,
            installedPacks,
            onClickAddPack,
            popperRoot,
            setOpen,
        ]);
        const handlePickSticker = React.useCallback((packId, stickerId) => {
            setOpen(false);
            onPickSticker(packId, stickerId);
        }, [setOpen, onPickSticker]);
        const handleClose = React.useCallback(() => {
            setOpen(false);
        }, [setOpen]);
        const handleClickAddPack = React.useCallback(() => {
            setOpen(false);
            if (showPickerHint) {
                clearShowPickerHint();
            }
            onClickAddPack();
        }, [onClickAddPack, showPickerHint, clearShowPickerHint]);
        const handleClearIntroduction = React.useCallback(() => {
            clearInstalledStickerPack();
            clearShowIntroduction();
        }, [clearInstalledStickerPack, clearShowIntroduction]);
        // Create popper root and handle outside clicks
        React.useEffect(() => {
            if (open) {
                const root = document.createElement('div');
                setPopperRoot(root);
                document.body.appendChild(root);
                const handleOutsideClick = ({ target }) => {
                    const targetElement = target;
                    const className = targetElement ? targetElement.className || '' : '';
                    // We need to special-case sticker picker header buttons, because they can
                    //   disappear after being clicked, which breaks the .contains() check below.
                    const isMissingButtonClass = !className ||
                        className.indexOf('module-sticker-picker__header__button') < 0;
                    if (!root.contains(targetElement) && isMissingButtonClass) {
                        setOpen(false);
                    }
                };
                document.addEventListener('click', handleOutsideClick);
                return () => {
                    document.body.removeChild(root);
                    document.removeEventListener('click', handleOutsideClick);
                    setPopperRoot(null);
                };
            }
            return lodash_1.noop;
        }, [open, setOpen, setPopperRoot]);
        // Install keyboard shortcut to open sticker picker
        React.useEffect(() => {
            const handleKeydown = (event) => {
                const { ctrlKey, key, metaKey, shiftKey } = event;
                const commandKey = lodash_1.get(window, 'platform') === 'darwin' && metaKey;
                const controlKey = lodash_1.get(window, 'platform') !== 'darwin' && ctrlKey;
                const commandOrCtrl = commandKey || controlKey;
                // We don't want to open up if the conversation has any panels open
                const panels = document.querySelectorAll('.conversation .panel');
                if (panels && panels.length > 1) {
                    return;
                }
                if (commandOrCtrl && shiftKey && (key === 's' || key === 'S')) {
                    event.stopPropagation();
                    event.preventDefault();
                    setOpen(!open);
                }
            };
            document.addEventListener('keydown', handleKeydown);
            return () => {
                document.removeEventListener('keydown', handleKeydown);
            };
        }, [open, setOpen]);
        // Clear the installed pack after one minute
        React.useEffect(() => {
            if (installedPack) {
                const timerId = setTimeout(clearInstalledStickerPack, 10 * 1000);
                return () => {
                    clearTimeout(timerId);
                };
            }
            return lodash_1.noop;
        }, [installedPack, clearInstalledStickerPack]);
        if (lib_1.countStickers({
            knownPacks,
            blessedPacks,
            installedPacks,
            receivedPacks,
        }) === 0) {
            return null;
        }
        return (React.createElement(react_popper_1.Manager, null,
            React.createElement(react_popper_1.Reference, null, ({ ref }) => (React.createElement("button", {
                type: "button", ref: ref, onClick: handleClickButton, className: classnames_1.default({
                    'module-sticker-button__button': true,
                    'module-sticker-button__button--active': open,
                }), "aria-label": i18n('stickers--StickerPicker--Open')
            }))),
            !open && !showIntroduction && installedPack ? (React.createElement(react_popper_1.Popper, { placement: position, key: installedPack.id }, ({ ref, style, placement, arrowProps }) => (React.createElement("button", { type: "button", ref: ref, style: style, className: "module-sticker-button__tooltip", onClick: clearInstalledStickerPack },
                installedPack.cover ? (React.createElement("img", { className: "module-sticker-button__tooltip__image", src: installedPack.cover.url, alt: installedPack.title })) : (React.createElement("div", { className: "module-sticker-button__tooltip__image-placeholder" })),
                React.createElement("span", { className: "module-sticker-button__tooltip__text" },
                    React.createElement("span", { className: "module-sticker-button__tooltip__text__title" }, installedPack.title),
                    ' ',
                    "installed"),
                React.createElement("div", { ref: arrowProps.ref, style: arrowProps.style, className: classnames_1.default('module-sticker-button__tooltip__triangle', `module-sticker-button__tooltip__triangle--${placement}`) }))))) : null,
            !open && showIntroduction ? (React.createElement(react_popper_1.Popper, { placement: position }, ({ ref, style, placement, arrowProps }) => (React.createElement("button", { type: "button", ref: ref, style: style, className: classnames_1.default('module-sticker-button__tooltip', 'module-sticker-button__tooltip--introduction'), onClick: handleClearIntroduction },
                React.createElement("img", { className: "module-sticker-button__tooltip--introduction__image", srcSet: "images/sticker_splash@1x.png 1x, images/sticker_splash@2x.png 2x", alt: i18n('stickers--StickerManager--Introduction--Image') }),
                React.createElement("div", { className: "module-sticker-button__tooltip--introduction__meta" },
                    React.createElement("div", { className: "module-sticker-button__tooltip--introduction__meta__title" }, i18n('stickers--StickerManager--Introduction--Title')),
                    React.createElement("div", { className: "module-sticker-button__tooltip--introduction__meta__subtitle" }, i18n('stickers--StickerManager--Introduction--Body'))),
                React.createElement("div", { className: "module-sticker-button__tooltip--introduction__close" },
                    React.createElement("button", { type: "button", className: "module-sticker-button__tooltip--introduction__close__button", onClick: handleClearIntroduction, "aria-label": i18n('close') })),
                React.createElement("div", { ref: arrowProps.ref, style: arrowProps.style, className: classnames_1.default('module-sticker-button__tooltip__triangle', 'module-sticker-button__tooltip__triangle--introduction', `module-sticker-button__tooltip__triangle--${placement}`) }))))) : null,
            open && popperRoot
                ? react_dom_1.createPortal(React.createElement(react_popper_1.Popper, { placement: position }, ({ ref, style }) => (React.createElement(StickerPicker_1.StickerPicker, { ref: ref, i18n: i18n, style: style, packs: installedPacks, onClose: handleClose, onClickAddPack: handleClickAddPack, onPickSticker: handlePickSticker, recentStickers: recentStickers, showPickerHint: showPickerHint }))), popperRoot)
                : null));
    });
})();