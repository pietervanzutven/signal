(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.ReactionPicker = {};

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
    const Emoji_1 = window.ts.components.emoji.Emoji;
    const lib_1 = window.ts.components.emoji.lib;
    const hooks_1 = window.ts.util.hooks;
    const emojis = ['❤️', '👍', '👎', '😂', '😮', '😢', '😡'];
    const getEmojis = () => emojis.slice(0, window.REACT_ANY_EMOJI ? emojis.length - 1 : emojis.length);
    exports.ReactionPicker = React.forwardRef(({ i18n, selected, onClose, onPick, renderEmojiPicker, style }, ref) => {
        const [pickingOther, setPickingOther] = React.useState(false);
        const focusRef = React.useRef(null);
        // Handle escape key
        React.useEffect(() => {
            const handler = (e) => {
                if (onClose && e.key === 'Escape') {
                    onClose();
                }
            };
            document.addEventListener('keydown', handler);
            return () => {
                document.removeEventListener('keydown', handler);
            };
        }, [onClose]);
        // Handle EmojiPicker::onPickEmoji
        const onPickEmoji = React.useCallback(({ shortName, skinTone }) => {
            onPick(lib_1.convertShortName(shortName, skinTone));
        }, [onPick]);
        // Focus first button and restore focus on unmount
        hooks_1.useRestoreFocus(focusRef);
        const otherSelected = selected && !getEmojis().includes(selected);
        return pickingOther ? (renderEmojiPicker({ onPickEmoji, onClose, style, ref })) : (React.createElement("div", { ref: ref, style: style, className: "module-reaction-picker" },
            getEmojis().map((emoji, index) => {
                const maybeFocusRef = index === 0 ? focusRef : undefined;
                return (React.createElement("button", {
                    key: emoji, ref: maybeFocusRef, tabIndex: 0, className: classnames_1.default('module-reaction-picker__emoji-btn', emoji === selected
                        ? 'module-reaction-picker__emoji-btn--selected'
                        : null), onClick: e => {
                            e.stopPropagation();
                            onPick(emoji);
                        }, title: emoji
                },
                    React.createElement("div", { className: "module-reaction-picker__emoji-btn__emoji" },
                        React.createElement(Emoji_1.Emoji, { size: 48, emoji: emoji }))));
            }),
            window.REACT_ANY_EMOJI ? (React.createElement("button", {
                className: classnames_1.default('module-reaction-picker__emoji-btn', otherSelected
                    ? 'module-reaction-picker__emoji-btn--selected'
                    : 'module-reaction-picker__emoji-btn--more'), onClick: e => {
                        e.stopPropagation();
                        if (otherSelected && selected) {
                            onPick(selected);
                        }
                        else {
                            setPickingOther(true);
                        }
                    }, title: i18n('ReactionsViewer--more')
            }, otherSelected ? (React.createElement("div", { className: "module-reaction-picker__emoji-btn__emoji" },
                React.createElement(Emoji_1.Emoji, { size: 48, emoji: selected }))) : null)) : null));
    });
})();