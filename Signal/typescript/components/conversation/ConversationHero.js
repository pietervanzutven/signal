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
    const renderMembershipRow = ({ i18n, sharedGroupNames, conversationType, isMe, }) => {
        const className = 'module-conversation-hero__membership';
        const nameClassName = `${className}__name`;
        if (isMe) {
            return React.createElement("div", { className: className }, i18n('noteToSelfHero'));
        }
        if (conversationType === 'direct' &&
            sharedGroupNames &&
            sharedGroupNames.length > 0) {
            const firstThreeGroups = lodash_1.take(sharedGroupNames, 3).map((group, i) => (React.createElement("strong", { key: i, className: nameClassName },
                React.createElement(Emojify_1.Emojify, { text: group }))));
            if (sharedGroupNames.length > 3) {
                const remainingCount = sharedGroupNames.length - 3;
                return (React.createElement("div", { className: className },
                    React.createElement(Intl_1.Intl, {
                        i18n: i18n, id: "ConversationHero--membership-extra", components: {
                            group1: firstThreeGroups[0],
                            group2: firstThreeGroups[1],
                            group3: firstThreeGroups[2],
                            remainingCount: remainingCount.toString(),
                        }
                    })));
            }
            else if (firstThreeGroups.length === 3) {
                return (React.createElement("div", { className: className },
                    React.createElement(Intl_1.Intl, {
                        i18n: i18n, id: "ConversationHero--membership-3", components: {
                            group1: firstThreeGroups[0],
                            group2: firstThreeGroups[1],
                            group3: firstThreeGroups[2],
                        }
                    })));
            }
            else if (firstThreeGroups.length >= 2) {
                return (React.createElement("div", { className: className },
                    React.createElement(Intl_1.Intl, {
                        i18n: i18n, id: "ConversationHero--membership-2", components: {
                            group1: firstThreeGroups[0],
                            group2: firstThreeGroups[1],
                        }
                    })));
            }
            else if (firstThreeGroups.length >= 1) {
                return (React.createElement("div", { className: className },
                    React.createElement(Intl_1.Intl, {
                        i18n: i18n, id: "ConversationHero--membership-1", components: {
                            group: firstThreeGroups[0],
                        }
                    })));
            }
        }
        return null;
    };
    exports.ConversationHero = ({ i18n, avatarPath, color, conversationType, isMe, membersCount, sharedGroupNames = [], name, phoneNumber, profileName, title, onHeightChange, }) => {
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
            ...sharedGroupNames.map(g => `g-${g}`),
        ]);
        const phoneNumberOnly = Boolean(!name && !profileName && conversationType === 'direct');
        return (React.createElement("div", { className: "module-conversation-hero" },
            React.createElement(Avatar_1.Avatar, { i18n: i18n, color: color, noteToSelf: isMe, avatarPath: avatarPath, conversationType: conversationType, name: name, profileName: profileName, title: title, size: 112, className: "module-conversation-hero__avatar" }),
            React.createElement("h1", { className: "module-conversation-hero__profile-name" }, isMe ? (i18n('noteToSelf')) : (React.createElement(ContactName_1.ContactName, { title: title, name: name, profileName: profileName, phoneNumber: phoneNumber, i18n: i18n }))),
            !isMe ? (React.createElement("div", { className: "module-conversation-hero__with" }, membersCount === 1
                ? i18n('ConversationHero--members-1')
                : membersCount !== undefined
                    ? i18n('ConversationHero--members', [`${membersCount}`])
                    : phoneNumberOnly
                        ? null
                        : phoneNumber)) : null,
            renderMembershipRow({ isMe, sharedGroupNames, conversationType, i18n })));
    };
});