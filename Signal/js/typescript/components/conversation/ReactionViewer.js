(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.ReactionViewer = {};

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
    const lodash_1 = window.lodash;
    const classnames_1 = __importDefault(window.classnames);
    const Avatar_1 = window.ts.components.Avatar;
    const Emoji_1 = window.ts.components.emoji.Emoji;
    const hooks_1 = window.ts.components.hooks;
    const emojisOrder = ['❤️', '👍', '👎', '😂', '😮', '😢', '😡'];
    exports.ReactionViewer = React.forwardRef(
        // tslint:disable-next-line max-func-body-length
        (_a, ref) => {
            var { i18n, reactions, onClose } = _a, rest = __rest(_a, ["i18n", "reactions", "onClose"]);
            const grouped = lodash_1.mapValues(lodash_1.groupBy(reactions, 'emoji'), res => lodash_1.orderBy(res, ['timestamp'], ['desc']));
            const filtered = emojisOrder.filter(e => Boolean(grouped[e]));
            const [selected, setSelected] = React.useState(filtered[0]);
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
            // Create sorted reaction categories, supporting reaction types we don't
            // explicitly know about yet
            const renderedEmojis = React.useMemo(() => {
                const emojiSet = new Set();
                reactions.forEach(re => emojiSet.add(re.emoji));
                return lodash_1.sortBy(Array.from(emojiSet), emoji => emojisOrder.indexOf(emoji) || Infinity);
            }, [reactions]);
            // If we have previously selected a reaction type that is no longer present
            // (removed on another device, for instance) we should select another
            // reaction type
            React.useEffect(() => {
                if (!grouped[selected]) {
                    const toSelect = renderedEmojis[0];
                    if (toSelect) {
                        setSelected(toSelect);
                    }
                    else if (onClose) {
                        // We have nothing to render!
                        onClose();
                    }
                }
            }, [grouped, onClose, renderedEmojis, selected, setSelected]);
            const selectedReactions = grouped[selected] || [];
            return (React.createElement("div", Object.assign({}, rest, { ref: ref, className: "module-reaction-viewer" }),
                React.createElement("header", { className: "module-reaction-viewer__header" }, renderedEmojis
                    .filter(e => Boolean(grouped[e]))
                    .map((emoji, index) => {
                        const re = grouped[emoji];
                        const maybeFocusRef = index === 0 ? focusRef : undefined;
                        return (React.createElement("button", {
                            key: emoji, ref: maybeFocusRef, className: classnames_1.default('module-reaction-viewer__header__button', selected === emoji
                                ? 'module-reaction-viewer__header__button--selected'
                                : null), onClick: event => {
                                    event.stopPropagation();
                                    setSelected(emoji);
                                }
                        },
                            React.createElement(Emoji_1.Emoji, { size: 18, emoji: emoji }),
                            React.createElement("span", { className: "module-reaction-viewer__header__button__count" }, re.length)));
                    })),
                React.createElement("main", { className: "module-reaction-viewer__body" }, selectedReactions.map(re => (React.createElement("div", { key: `${re.from.id}-${re.emoji}`, className: "module-reaction-viewer__body__row" },
                    React.createElement("div", { className: "module-reaction-viewer__body__row__avatar" },
                        React.createElement(Avatar_1.Avatar, { avatarPath: re.from.avatarPath, conversationType: "direct", size: 32, i18n: i18n })),
                    React.createElement("span", { className: "module-reaction-viewer__body__row__name" }, re.from.name || re.from.profileName)))))));
        });
})();