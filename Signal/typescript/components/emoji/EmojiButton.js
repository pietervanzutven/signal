(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.emoji = window.ts.components.emoji || {};
    const exports = window.ts.components.emoji.EmojiButton = {};

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
    const EmojiPicker_1 = require("./EmojiPicker");
    exports.EmojiButton = React.memo(({ i18n, doSend, onPickEmoji, skinTone, onSetSkinTone, recentEmojis, }) => {
        const [open, setOpen] = React.useState(false);
        const [popperRoot, setPopperRoot] = React.useState(null);
        const handleClickButton = React.useCallback(() => {
            if (popperRoot) {
                setOpen(false);
            }
            else {
                setOpen(true);
            }
        }, [popperRoot, setOpen]);
        const handleClose = React.useCallback(() => {
            setOpen(false);
        }, [setOpen]);
        // Create popper root and handle outside clicks
        React.useEffect(() => {
            if (open) {
                const root = document.createElement('div');
                setPopperRoot(root);
                document.body.appendChild(root);
                const handleOutsideClick = ({ target }) => {
                    if (!root.contains(target)) {
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
        // Install keyboard shortcut to open emoji picker
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
                if (commandOrCtrl && shiftKey && (key === 'j' || key === 'J')) {
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
        return (React.createElement(react_popper_1.Manager, null,
            React.createElement(react_popper_1.Reference, null, ({ ref }) => (React.createElement("button", {
                type: "button", ref: ref, onClick: handleClickButton, className: classnames_1.default({
                    'module-emoji-button__button': true,
                    'module-emoji-button__button--active': open,
                }), "aria-label": i18n('EmojiButton__label')
            }))),
            open && popperRoot
                ? react_dom_1.createPortal(React.createElement(react_popper_1.Popper, { placement: "top-start" }, ({ ref, style }) => (React.createElement(EmojiPicker_1.EmojiPicker, { ref: ref, i18n: i18n, style: style, onPickEmoji: onPickEmoji, doSend: doSend, onClose: handleClose, skinTone: skinTone, onSetSkinTone: onSetSkinTone, recentEmojis: recentEmojis }))), popperRoot)
                : null));
    });
})();