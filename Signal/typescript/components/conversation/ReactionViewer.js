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
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
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
    const React = __importStar(require("react"));
    const lodash_1 = require("lodash");
    const classnames_1 = __importDefault(require("classnames"));
    const ContactName_1 = require("./ContactName");
    const Avatar_1 = require("../Avatar");
    const Emoji_1 = require("../emoji/Emoji");
    const hooks_1 = require("../../util/hooks");
    const emojisOrder = ['❤️', '👍', '👎', '😂', '😮', '😢', '😡'];
    exports.ReactionViewer = React.forwardRef(
        // tslint:disable-next-line max-func-body-length
        (_a, ref) => {
            var { i18n, reactions, onClose, pickedReaction } = _a, rest = __rest(_a, ["i18n", "reactions", "onClose", "pickedReaction"]);
            const grouped = lodash_1.mapValues(lodash_1.groupBy(reactions, 'emoji'), res => lodash_1.orderBy(res, ['timestamp'], ['desc']));
            const [selected, setSelected] = React.useState(pickedReaction || 'all');
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
                const arr = lodash_1.sortBy(Array.from(emojiSet), emoji => {
                    const idx = emojisOrder.indexOf(emoji);
                    if (idx > -1) {
                        return idx;
                    }
                    return Infinity;
                });
                return ['all', ...arr];
            }, [reactions]);
            const allSorted = React.useMemo(() => {
                return lodash_1.orderBy(reactions, ['timestamp'], ['desc']);
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
            const selectedReactions = grouped[selected] || allSorted;
            return (React.createElement("div", Object.assign({}, rest, { ref: ref, className: "module-reaction-viewer" }),
                React.createElement("header", { className: "module-reaction-viewer__header" }, renderedEmojis
                    .filter(e => e === 'all' || Boolean(grouped[e]))
                    .map((cat, index) => {
                        const re = grouped[cat] || reactions;
                        const maybeFocusRef = index === 0 ? focusRef : undefined;
                        const isAll = cat === 'all';
                        return (React.createElement("button", {
                            key: cat, ref: maybeFocusRef, className: classnames_1.default('module-reaction-viewer__header__button', selected === cat
                                ? 'module-reaction-viewer__header__button--selected'
                                : null), onClick: event => {
                                    event.stopPropagation();
                                    setSelected(cat);
                                }
                        }, isAll ? (React.createElement("span", { className: "module-reaction-viewer__header__button__all" },
                            i18n('ReactionsViewer--all'),
                            "\u2009\u00B7\u2009",
                            re.length)) : (React.createElement(React.Fragment, null,
                                React.createElement(Emoji_1.Emoji, { size: 18, emoji: cat }),
                                React.createElement("span", { className: "module-reaction-viewer__header__button__count" }, re.length)))));
                    })),
                React.createElement("main", { className: "module-reaction-viewer__body" }, selectedReactions.map(({ from, emoji }) => (React.createElement("div", { key: `${from.id}-${emoji}`, className: "module-reaction-viewer__body__row" },
                    React.createElement("div", { className: "module-reaction-viewer__body__row__avatar" },
                        React.createElement(Avatar_1.Avatar, { avatarPath: from.avatarPath, conversationType: "direct", size: 32, color: from.color, name: from.name, profileName: from.profileName, phoneNumber: from.phoneNumber, title: from.title, i18n: i18n })),
                    React.createElement("div", { className: "module-reaction-viewer__body__row__name" }, from.isMe ? (i18n('you')) : (React.createElement(ContactName_1.ContactName, { module: "module-reaction-viewer__body__row__name__contact-name", name: from.name, profileName: from.profileName, phoneNumber: from.phoneNumber, title: from.title, i18n: i18n }))),
                    React.createElement("div", { className: "module-reaction-viewer__body__row__emoji" },
                        React.createElement(Emoji_1.Emoji, { size: 18, emoji: emoji }))))))));
        });
})();