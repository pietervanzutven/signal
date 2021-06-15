require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }));
    var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    });
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConversationHero = void 0;
    const React = __importStar(require("react"));
    const lodash_1 = require("lodash");
    const Avatar_1 = require("../Avatar");
    const ContactName_1 = require("./ContactName");
    const About_1 = require("./About");
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
            const firstThreeGroups = lodash_1.take(sharedGroupNames, 3).map((group, i) => (
                // We cannot guarantee uniqueness of group names
                // eslint-disable-next-line react/no-array-index-key
                React.createElement("strong", { key: i, className: nameClassName },
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
            if (firstThreeGroups.length === 3) {
                return (React.createElement("div", { className: className },
                    React.createElement(Intl_1.Intl, {
                        i18n: i18n, id: "ConversationHero--membership-3", components: {
                            group1: firstThreeGroups[0],
                            group2: firstThreeGroups[1],
                            group3: firstThreeGroups[2],
                        }
                    })));
            }
            if (firstThreeGroups.length >= 2) {
                return (React.createElement("div", { className: className },
                    React.createElement(Intl_1.Intl, {
                        i18n: i18n, id: "ConversationHero--membership-2", components: {
                            group1: firstThreeGroups[0],
                            group2: firstThreeGroups[1],
                        }
                    })));
            }
            if (firstThreeGroups.length >= 1) {
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
    const ConversationHero = ({ i18n, about, avatarPath, color, conversationType, isMe, membersCount, sharedGroupNames = [], name, phoneNumber, profileName, title, onHeightChange, updateSharedGroups, }) => {
        const firstRenderRef = React.useRef(true);
        // TODO: DESKTOP-686
        /* eslint-disable react-hooks/exhaustive-deps */
        React.useEffect(() => {
            // If any of the depenencies for this hook change then the height of this
            // component may have changed. The cleanup function notifies listeners of
            // any potential height changes.
            return () => {
                // Kick off the expensive hydration of the current sharedGroupNames
                if (updateSharedGroups) {
                    updateSharedGroups();
                }
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
            sharedGroupNames.map(g => `g-${g}`).join(' '),
        ]);
        /* eslint-enable react-hooks/exhaustive-deps */
        const phoneNumberOnly = Boolean(!name && !profileName && conversationType === 'direct');
        /* eslint-disable no-nested-ternary */
        return (React.createElement("div", { className: "module-conversation-hero" },
            React.createElement(Avatar_1.Avatar, { i18n: i18n, color: color, noteToSelf: isMe, avatarPath: avatarPath, conversationType: conversationType, name: name, profileName: profileName, title: title, size: 112, className: "module-conversation-hero__avatar" }),
            React.createElement("h1", { className: "module-conversation-hero__profile-name" }, isMe ? (i18n('noteToSelf')) : (React.createElement(ContactName_1.ContactName, { title: title, name: name, profileName: profileName, phoneNumber: phoneNumber, i18n: i18n }))),
            about && (React.createElement("div", { className: "module-about__container" },
                React.createElement(About_1.About, { text: about }))),
            !isMe ? (React.createElement("div", { className: "module-conversation-hero__with" }, membersCount === 1
                ? i18n('ConversationHero--members-1')
                : membersCount !== undefined
                    ? i18n('ConversationHero--members', [`${membersCount}`])
                    : phoneNumberOnly
                        ? null
                        : phoneNumber)) : null,
            renderMembershipRow({ isMe, sharedGroupNames, conversationType, i18n })));
        /* eslint-enable no-nested-ternary */
    };
    exports.ConversationHero = ConversationHero;
});