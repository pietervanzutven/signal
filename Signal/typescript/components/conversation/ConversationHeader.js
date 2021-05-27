(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.ConversationHeader = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const moment_1 = __importDefault(require("moment"));
    const classnames_1 = __importDefault(require("classnames"));
    const react_contextmenu_1 = require("react-contextmenu");
    const Emojify_1 = require("./Emojify");
    const Avatar_1 = require("../Avatar");
    const InContactsIcon_1 = require("../InContactsIcon");
    const getMuteOptions_1 = require("../../util/getMuteOptions");
    const ExpirationTimerOptions_1 = require("../../util/ExpirationTimerOptions");
    const isMuted_1 = require("../../util/isMuted");
    class ConversationHeader extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.menuTriggerRef = react_1.default.createRef();
            this.showMenuBound = this.showMenu.bind(this);
        }
        showMenu(event) {
            if (this.menuTriggerRef.current) {
                this.menuTriggerRef.current.handleContextClick(event);
            }
        }
        renderBackButton() {
            const { i18n, onGoBack, showBackButton } = this.props;
            return (react_1.default.createElement("button", { type: "button", onClick: onGoBack, className: classnames_1.default('module-conversation-header__back-icon', showBackButton ? 'module-conversation-header__back-icon--show' : null), disabled: !showBackButton, "aria-label": i18n('goBack') }));
        }
        renderTitle() {
            const { name, phoneNumber, title, type, i18n, isMe, profileName, isVerified, } = this.props;
            if (isMe) {
                return (react_1.default.createElement("div", { className: "module-conversation-header__title" }, i18n('noteToSelf')));
            }
            const shouldShowIcon = Boolean(name && type === 'direct');
            const shouldShowNumber = Boolean(phoneNumber && (name || profileName));
            return (react_1.default.createElement("div", { className: "module-conversation-header__title" },
                react_1.default.createElement(Emojify_1.Emojify, { text: title }),
                shouldShowIcon ? (react_1.default.createElement("span", null,
                    ' ',
                    react_1.default.createElement(InContactsIcon_1.InContactsIcon, { i18n: i18n }))) : null,
                shouldShowNumber ? ` · ${phoneNumber}` : null,
                isVerified ? (react_1.default.createElement("span", null,
                    ' · ',
                    react_1.default.createElement("span", { className: "module-conversation-header__title__verified-icon" }),
                    i18n('verified'))) : null));
        }
        renderAvatar() {
            const { avatarPath, color, i18n, type, isMe, name, phoneNumber, profileName, title, } = this.props;
            return (react_1.default.createElement("span", { className: "module-conversation-header__avatar" },
                react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color, conversationType: type, i18n: i18n, noteToSelf: isMe, title: title, name: name, phoneNumber: phoneNumber, profileName: profileName, size: 28 })));
        }
        renderExpirationLength() {
            const { i18n, expireTimer, showBackButton } = this.props;
            const expirationSettingName = expireTimer
                ? ExpirationTimerOptions_1.ExpirationTimerOptions.getName(i18n, expireTimer)
                : undefined;
            if (!expirationSettingName) {
                return null;
            }
            return (react_1.default.createElement("div", {
                className: classnames_1.default('module-conversation-header__expiration', showBackButton
                    ? 'module-conversation-header__expiration--hidden'
                    : null)
            },
                react_1.default.createElement("div", { className: "module-conversation-header__expiration__clock-icon" }),
                react_1.default.createElement("div", { className: "module-conversation-header__expiration__setting" }, expirationSettingName)));
        }
        renderMoreButton(triggerId) {
            const { i18n, showBackButton } = this.props;
            return (react_1.default.createElement(react_contextmenu_1.ContextMenuTrigger, { id: triggerId, ref: this.menuTriggerRef },
                react_1.default.createElement("button", {
                    type: "button", onClick: this.showMenuBound, className: classnames_1.default('module-conversation-header__more-button', showBackButton
                        ? null
                        : 'module-conversation-header__more-button--show'), disabled: showBackButton, "aria-label": i18n('moreInfo')
                })));
        }
        renderSearchButton() {
            const { i18n, onSearchInConversation, showBackButton } = this.props;
            return (react_1.default.createElement("button", {
                type: "button", onClick: onSearchInConversation, className: classnames_1.default('module-conversation-header__search-button', showBackButton
                    ? null
                    : 'module-conversation-header__search-button--show'), disabled: showBackButton, "aria-label": i18n('search')
            }));
        }
        renderOutgoingCallButtons() {
            const { i18n, onOutgoingAudioCallInConversation, onOutgoingVideoCallInConversation, showCallButtons, showBackButton, } = this.props;
            if (!showCallButtons) {
                return null;
            }
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("button", {
                    type: "button", onClick: onOutgoingVideoCallInConversation, className: classnames_1.default('module-conversation-header__video-calling-button', showBackButton
                        ? null
                        : 'module-conversation-header__video-calling-button--show'), disabled: showBackButton, "aria-label": i18n('makeOutgoingVideoCall')
                }),
                react_1.default.createElement("button", {
                    type: "button", onClick: onOutgoingAudioCallInConversation, className: classnames_1.default('module-conversation-header__audio-calling-button', showBackButton
                        ? null
                        : 'module-conversation-header__audio-calling-button--show'), disabled: showBackButton, "aria-label": i18n('makeOutgoingCall')
                })));
        }
        renderMenu(triggerId) {
            const { i18n, acceptedMessageRequest, canChangeTimer, isArchived, isMe, isPinned, type, markedUnread, muteExpiresAt, isMissingMandatoryProfileSharing, left, onDeleteMessages, onResetSession, onSetDisappearingMessages, onSetMuteNotifications, onShowAllMedia, onShowGroupMembers, onShowSafetyNumber, onArchive, onMarkUnread, onSetPin, onMoveToInbox, } = this.props;
            const muteOptions = [];
            if (isMuted_1.isMuted(muteExpiresAt)) {
                const expires = moment_1.default(muteExpiresAt);
                const muteExpirationLabel = moment_1.default().isSame(expires, 'day')
                    ? expires.format('hh:mm A')
                    : expires.format('M/D/YY, hh:mm A');
                muteOptions.push(...[
                    {
                        name: i18n('muteExpirationLabel', [muteExpirationLabel]),
                        disabled: true,
                        value: 0,
                    },
                    {
                        name: i18n('unmute'),
                        value: 0,
                    },
                ]);
            }
            muteOptions.push(...getMuteOptions_1.getMuteOptions(i18n));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const disappearingTitle = i18n('disappearingMessages');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const muteTitle = i18n('muteNotificationsTitle');
            const isGroup = type === 'group';
            const disableTimerChanges = Boolean(!canChangeTimer ||
                !acceptedMessageRequest ||
                left ||
                isMissingMandatoryProfileSharing);
            return (react_1.default.createElement(react_contextmenu_1.ContextMenu, { id: triggerId },
                disableTimerChanges ? null : (react_1.default.createElement(react_contextmenu_1.SubMenu, { title: disappearingTitle }, ExpirationTimerOptions_1.ExpirationTimerOptions.map((item) => (react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    key: item.get('seconds'), onClick: () => {
                        onSetDisappearingMessages(item.get('seconds'));
                    }
                }, item.getName(i18n)))))),
                react_1.default.createElement(react_contextmenu_1.SubMenu, { title: muteTitle }, muteOptions.map(item => (react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    key: item.name, disabled: item.disabled, onClick: () => {
                        onSetMuteNotifications(item.value);
                    }
                }, item.name)))),
                isGroup ? (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onShowGroupMembers }, i18n('showMembers'))) : null,
                react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onShowAllMedia }, i18n('viewRecentMedia')),
                !isGroup && !isMe ? (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onShowSafetyNumber }, i18n('showSafetyNumber'))) : null,
                !isGroup && acceptedMessageRequest ? (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onResetSession }, i18n('resetSession'))) : null,
                react_1.default.createElement(react_contextmenu_1.MenuItem, { divider: true }),
                !markedUnread ? (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onMarkUnread }, i18n('markUnread'))) : null,
                isArchived ? (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onMoveToInbox }, i18n('moveConversationToInbox'))) : (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onArchive }, i18n('archiveConversation'))),
                react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onDeleteMessages }, i18n('deleteMessages')),
                isPinned ? (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: () => onSetPin(false) }, i18n('unpinConversation'))) : (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: () => onSetPin(true) }, i18n('pinConversation')))));
        }
        render() {
            const { id } = this.props;
            const triggerId = `conversation-${id}`;
            return (react_1.default.createElement("div", { className: "module-conversation-header" },
                this.renderBackButton(),
                react_1.default.createElement("div", { className: "module-conversation-header__title-container" },
                    react_1.default.createElement("div", { className: "module-conversation-header__title-flex" },
                        this.renderAvatar(),
                        this.renderTitle())),
                this.renderExpirationLength(),
                this.renderSearchButton(),
                this.renderOutgoingCallButtons(),
                this.renderMoreButton(triggerId),
                this.renderMenu(triggerId)));
        }
    }
    exports.ConversationHeader = ConversationHeader;
})();