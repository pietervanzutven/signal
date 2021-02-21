(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.ReactionPicker = {};

    var __rest = (this && this.__rest) || function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
                t[p[i]] = s[p[i]];
        return t;
    };
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
    const hooks_1 = window.ts.components.hooks;
    const emojis = ['❤️', '👍', '👎', '😂', '😮', '😢', '😡'];
    exports.ReactionPicker = React.forwardRef((_a, ref) => {
        var { selected, onClose, onPick } = _a, rest = __rest(_a, ["selected", "onClose", "onPick"]);
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
        // Focus first button and restore focus on unmount
        hooks_1.useRestoreFocus(focusRef);
        return (React.createElement("div", Object.assign({}, rest, { ref: ref, className: "module-reaction-picker" }), emojis.map((emoji, index) => {
            const maybeFocusRef = index === 0 ? focusRef : undefined;
            return (React.createElement("button", {
                key: emoji, ref: maybeFocusRef, tabIndex: 0, className: classnames_1.default('module-reaction-picker__emoji-btn', emoji === selected
                    ? 'module-reaction-picker__emoji-btn--selected'
                    : null), onClick: e => {
                        e.stopPropagation();
                        onPick(emoji);
                    }
            },
                React.createElement("div", { className: "module-reaction-picker__emoji-btn__emoji" },
                    React.createElement(Emoji_1.Emoji, { size: 48, emoji: emoji }))));
        })));
    });
})();