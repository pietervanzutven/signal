require(exports => {
    "use strict";
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(require("react"));
    const lodash_1 = require("lodash");
    const Avatar_1 = require("../Avatar");
    const ContactName_1 = require("./ContactName");
    const Emojify_1 = require("./Emojify");
    const Intl_1 = require("../Intl");
    const renderMembershipRow = ({ i18n, groups, conversationType, isMe, }) => {
        const className = 'module-conversation-hero__membership';
        const nameClassName = `${className}__name`;
        if (isMe) {
            return React.createElement("div", { className: className }, i18n('noteToSelfHero'));
        }
        if (conversationType === 'direct' && groups && groups.length > 0) {
            const firstThreeGroups = lodash_1.take(groups, 3).map((group, i) => (React.createElement("strong", { key: i, className: nameClassName },
                React.createElement(Emojify_1.Emojify, { text: group }))));
            return (React.createElement("div", { className: className },
                React.createElement(Intl_1.Intl, { i18n: i18n, id: `ConversationHero--membership-${firstThreeGroups.length}`, components: firstThreeGroups })));
        }
        return null;
    };
    exports.ConversationHero = ({ i18n, avatarPath, color, conversationType, isMe, membersCount, groups = [], name, phoneNumber, profileName, title, onHeightChange, }) => {
        const firstRenderRef = React.useRef(true);
        React.useEffect(() => {
            // If any of the depenencies for this hook change then the height of this
            // component may have changed. The cleanup function notifies listeners of
            // any potential height changes.
            return () => {
                if (onHeightChange && !firstRenderRef.current) {
                    onHeightChange();
                }
                else {
                    firstRenderRef.current = false;
                }
            };
        }, [
            firstRenderRef,
            onHeightChange,
            // Avoid collisions in these dependencies by prefixing them
            // These dependencies may be dynamic, and therefore may cause height changes
            `mc-${membersCount}`,
            `n-${name}`,
            `pn-${profileName}`,
            ...groups.map(g => `g-${g}`),
        ]);
        const displayName = name || (conversationType === 'group' ? i18n('unknownGroup') : undefined);
        const phoneNumberOnly = Boolean(!name && !profileName && conversationType === 'direct');
        return (React.createElement("div", { className: "module-conversation-hero" },
            React.createElement(Avatar_1.Avatar, { i18n: i18n, color: color, noteToSelf: isMe, avatarPath: avatarPath, conversationType: conversationType, name: name, profileName: profileName, title: title, size: 112, className: "module-conversation-hero__avatar" }),
            React.createElement("h1", { className: "module-conversation-hero__profile-name" }, isMe ? (i18n('noteToSelf')) : (React.createElement(ContactName_1.ContactName, { title: title, name: displayName, profileName: profileName, phoneNumber: phoneNumber, i18n: i18n }))),
            !isMe ? (React.createElement("div", { className: "module-conversation-hero__with" }, membersCount === 1
                ? i18n('ConversationHero--members-1')
                : membersCount !== undefined
                    ? i18n('ConversationHero--members', [`${membersCount}`])
                    : phoneNumberOnly
                        ? null
                        : phoneNumber)) : null,
            renderMembershipRow({ isMe, groups, conversationType, i18n })));
    };
});