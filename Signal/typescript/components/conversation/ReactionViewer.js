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
    const lib_1 = require("../emoji/lib");
    const DEFAULT_EMOJI_ORDER = [
        'heart',
        '+1',
        '-1',
        'joy',
        'open_mouth',
        'cry',
        'rage',
    ];
    exports.ReactionViewer = React.forwardRef((_a, ref) => {
        var { i18n, reactions, onClose, pickedReaction } = _a, rest = __rest(_a, ["i18n", "reactions", "onClose", "pickedReaction"]);
        const reactionsWithEmojiData = React.useMemo(() => reactions
            .map(reaction => {
                const emojiData = lib_1.emojiToData(reaction.emoji);
                if (!emojiData) {
                    return undefined;
                }
                return Object.assign(Object.assign({}, reaction), emojiData);
            })
            .filter((reactionWithEmojiData) => Boolean(reactionWithEmojiData)), [reactions]);
        const groupedAndSortedReactions = React.useMemo(() => lodash_1.mapValues(Object.assign({ all: reactionsWithEmojiData }, lodash_1.groupBy(reactionsWithEmojiData, 'short_name')), groupedReactions => lodash_1.orderBy(groupedReactions, ['timestamp'], ['desc'])), [reactionsWithEmojiData]);
        const reactionCategories = React.useMemo(() => [
            {
                id: 'all',
                index: 0,
                count: reactionsWithEmojiData.length,
            },
            ...Object.entries(groupedAndSortedReactions)
                .filter(([key]) => key !== 'all')
                .map(([, [{ short_name: id, emoji }, ...otherReactions]]) => {
                    return {
                        id,
                        index: DEFAULT_EMOJI_ORDER.includes(id)
                            ? DEFAULT_EMOJI_ORDER.indexOf(id)
                            : Infinity,
                        emoji,
                        count: otherReactions.length + 1,
                    };
                }),
        ].sort((a, b) => a.index - b.index), [reactionsWithEmojiData, groupedAndSortedReactions]);
        const [selectedReactionCategory, setSelectedReactionCategory,] = React.useState(pickedReaction || 'all');
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
        // If we have previously selected a reaction type that is no longer present
        // (removed on another device, for instance) we should select another
        // reaction type
        React.useEffect(() => {
            if (!reactionCategories.find(({ id }) => id === selectedReactionCategory)) {
                if (reactionsWithEmojiData.length > 0) {
                    setSelectedReactionCategory('all');
                }
                else if (onClose) {
                    onClose();
                }
            }
        }, [
            reactionCategories,
            onClose,
            reactionsWithEmojiData,
            selectedReactionCategory,
        ]);
        const selectedReactions = groupedAndSortedReactions[selectedReactionCategory] || [];
        return (React.createElement("div", Object.assign({}, rest, { ref: ref, className: "module-reaction-viewer" }),
            React.createElement("header", { className: "module-reaction-viewer__header" }, reactionCategories.map(({ id, emoji, count }, index) => {
                const isAll = index === 0;
                const maybeFocusRef = isAll ? focusRef : undefined;
                return (React.createElement("button", {
                    type: "button", key: id, ref: maybeFocusRef, className: classnames_1.default('module-reaction-viewer__header__button', selectedReactionCategory === id
                        ? 'module-reaction-viewer__header__button--selected'
                        : null), onClick: event => {
                            event.stopPropagation();
                            setSelectedReactionCategory(id);
                        }
                }, isAll ? (React.createElement("span", { className: "module-reaction-viewer__header__button__all" },
                    i18n('ReactionsViewer--all'),
                    "\u2009\u00B7\u2009",
                    count)) : (React.createElement(React.Fragment, null,
                        React.createElement(Emoji_1.Emoji, { size: 18, emoji: emoji }),
                        React.createElement("span", { className: "module-reaction-viewer__header__button__count" }, count)))));
            })),
            React.createElement("main", { className: "module-reaction-viewer__body" }, selectedReactions.map(({ from, emoji }) => (React.createElement("div", { key: `${from.id}-${emoji}`, className: "module-reaction-viewer__body__row" },
                React.createElement("div", { className: "module-reaction-viewer__body__row__avatar" },
                    React.createElement(Avatar_1.Avatar, { avatarPath: from.avatarPath, conversationType: "direct", size: 32, color: from.color, name: from.name, profileName: from.profileName, phoneNumber: from.phoneNumber, title: from.title, i18n: i18n })),
                React.createElement("div", { className: "module-reaction-viewer__body__row__name" }, from.isMe ? (i18n('you')) : (React.createElement(ContactName_1.ContactName, { module: "module-reaction-viewer__body__row__name__contact-name", name: from.name, profileName: from.profileName, phoneNumber: from.phoneNumber, title: from.title, i18n: i18n }))),
                React.createElement("div", { className: "module-reaction-viewer__body__row__emoji" },
                    React.createElement(Emoji_1.Emoji, { size: 18, emoji: emoji }))))))));
    });
})();