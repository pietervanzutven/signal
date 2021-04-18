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
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const Emojify_1 = window.ts.components.conversation.Emojify;
    const Avatar_1 = window.ts.components.Avatar;
    const react_contextmenu_1 = window.react_contextmenu;
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
            const { onGoBack, showBackButton } = this.props;
            return (react_1.default.createElement("button", { onClick: onGoBack, className: classnames_1.default('module-conversation-header__back-icon', showBackButton ? 'module-conversation-header__back-icon--show' : null), disabled: !showBackButton }));
        }
        renderTitle() {
            const { name, phoneNumber, i18n, isMe, profileName, isVerified, } = this.props;
            if (isMe) {
                return (react_1.default.createElement("div", { className: "module-conversation-header__title" }, i18n('noteToSelf')));
            }
            return (react_1.default.createElement("div", { className: "module-conversation-header__title" },
                name ? react_1.default.createElement(Emojify_1.Emojify, { text: name }) : null,
                name && phoneNumber ? ' · ' : null,
                phoneNumber ? phoneNumber : null,
                ' ',
                profileName && !name ? (react_1.default.createElement("span", { className: "module-conversation-header__title__profile-name" },
                    "~",
                    react_1.default.createElement(Emojify_1.Emojify, { text: profileName }))) : null,
                isVerified ? ' · ' : null,
                isVerified ? (react_1.default.createElement("span", null,
                    react_1.default.createElement("span", { className: "module-conversation-header__title__verified-icon" }),
                    i18n('verified'))) : null));
        }
        renderAvatar() {
            const { avatarPath, color, i18n, isGroup, isMe, name, phoneNumber, profileName, } = this.props;
            const conversationType = isGroup ? 'group' : 'direct';
            return (react_1.default.createElement("span", { className: "module-conversation-header__avatar" },
                react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color, conversationType: conversationType, i18n: i18n, noteToSelf: isMe, name: name, phoneNumber: phoneNumber, profileName: profileName, size: 28 })));
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
            const { showBackButton } = this.props;
            return (react_1.default.createElement(react_contextmenu_1.ContextMenuTrigger, { id: triggerId, ref: this.menuTriggerRef },
                react_1.default.createElement("button", {
                    onClick: this.showMenuBound, className: classnames_1.default('module-conversation-header__more-button', showBackButton
                        ? null
                        : 'module-conversation-header__more-button--show'), disabled: showBackButton
                })));
        }
        renderSearchButton() {
            const { onSearchInConversation, showBackButton } = this.props;
            return (react_1.default.createElement("button", {
                onClick: onSearchInConversation, className: classnames_1.default('module-conversation-header__search-button', showBackButton
                    ? null
                    : 'module-conversation-header__search-button--show'), disabled: showBackButton
            }));
        }
        renderMenu(triggerId) {
            const { i18n, isMe, isGroup, isArchived, leftGroup, onDeleteMessages, onResetSession, onSetDisappearingMessages, onShowAllMedia, onShowGroupMembers, onShowSafetyNumber, onArchive, onMoveToInbox, timerOptions, } = this.props;
            const disappearingTitle = i18n('disappearingMessages');
            return (react_1.default.createElement(react_contextmenu_1.ContextMenu, { id: triggerId },
                leftGroup ? null : (react_1.default.createElement(react_contextmenu_1.SubMenu, { title: disappearingTitle }, (timerOptions || []).map(item => (react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    key: item.value, onClick: () => {
                        onSetDisappearingMessages(item.value);
                    }
                }, item.name))))),
                react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onShowAllMedia }, i18n('viewAllMedia')),
                isGroup ? (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onShowGroupMembers }, i18n('showMembers'))) : null,
                !isGroup && !isMe ? (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onShowSafetyNumber }, i18n('showSafetyNumber'))) : null,
                !isGroup ? (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onResetSession }, i18n('resetSession'))) : null,
                isArchived ? (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onMoveToInbox }, i18n('moveConversationToInbox'))) : (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onArchive }, i18n('archiveConversation'))),
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
                this.renderMoreButton(triggerId),
                this.renderMenu(triggerId)));
        }
    }
    exports.ConversationHeader = ConversationHeader;
})();