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
    const classnames_1 = __importDefault(require("classnames"));
    const react_contextmenu_1 = require("react-contextmenu");
    const Emojify_1 = require("./Emojify");
    const Avatar_1 = require("../Avatar");
    const InContactsIcon_1 = require("../InContactsIcon");
    const getMuteOptions_1 = require("../../util/getMuteOptions");
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
            const { expirationSettingName, showBackButton } = this.props;
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
        renderOutgoingAudioCallButton() {
            const { i18n, isMe, onOutgoingAudioCallInConversation, showBackButton, type, } = this.props;
            if (type === 'group' || isMe) {
                return null;
            }
            return (react_1.default.createElement("button", {
                type: "button", onClick: onOutgoingAudioCallInConversation, className: classnames_1.default('module-conversation-header__audio-calling-button', showBackButton
                    ? null
                    : 'module-conversation-header__audio-calling-button--show'), disabled: showBackButton, "aria-label": i18n('makeOutgoingCall')
            }));
        }
        renderOutgoingVideoCallButton() {
            const { i18n, isMe, type } = this.props;
            if (type === 'group' || isMe) {
                return null;
            }
            const { onOutgoingVideoCallInConversation, showBackButton } = this.props;
            return (react_1.default.createElement("button", {
                type: "button", onClick: onOutgoingVideoCallInConversation, className: classnames_1.default('module-conversation-header__video-calling-button', showBackButton
                    ? null
                    : 'module-conversation-header__video-calling-button--show'), disabled: showBackButton, "aria-label": i18n('makeOutgoingVideoCall')
            }));
        }
        renderMenu(triggerId) {
            const { disableTimerChanges, i18n, isAccepted, isMe, isPinned, type, isArchived, muteExpirationLabel, onDeleteMessages, onResetSession, onSetDisappearingMessages, onSetMuteNotifications, onShowAllMedia, onShowGroupMembers, onShowSafetyNumber, onArchive, onSetPin, onMoveToInbox, timerOptions, } = this.props;
            const muteOptions = [];
            if (muteExpirationLabel) {
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
            return (react_1.default.createElement(react_contextmenu_1.ContextMenu, { id: triggerId },
                disableTimerChanges ? null : (react_1.default.createElement(react_contextmenu_1.SubMenu, { title: disappearingTitle }, (timerOptions || []).map(item => (react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    key: item.value, onClick: () => {
                        onSetDisappearingMessages(item.value);
                    }
                }, item.name))))),
                react_1.default.createElement(react_contextmenu_1.SubMenu, { title: muteTitle }, muteOptions.map(item => (react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    key: item.name, disabled: item.disabled, onClick: () => {
                        onSetMuteNotifications(item.value);
                    }
                }, item.name)))),
                react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onShowAllMedia }, i18n('viewRecentMedia')),
                isGroup ? (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onShowGroupMembers }, i18n('showMembers'))) : null,
                !isGroup && !isMe ? (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onShowSafetyNumber }, i18n('showSafetyNumber'))) : null,
                !isGroup && isAccepted ? (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onResetSession }, i18n('resetSession'))) : null,
                isArchived ? (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onMoveToInbox }, i18n('moveConversationToInbox'))) : (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onArchive }, i18n('archiveConversation'))),
                isPinned ? (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: () => onSetPin(false) }, i18n('unpinConversation'))) : (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: () => onSetPin(true) }, i18n('pinConversation'))),
                react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onDeleteMessages }, i18n('deleteMessages'))));
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
                this.renderOutgoingVideoCallButton(),
                this.renderOutgoingAudioCallButton(),
                this.renderMoreButton(triggerId),
                this.renderMenu(triggerId)));
        }
    }
    exports.ConversationHeader = ConversationHeader;
})();