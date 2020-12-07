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
    const Emojify_1 = window.ts.components.conversation.Emojify;
    const Avatar_1 = window.ts.components.Avatar;
    const react_contextmenu_1 = window.react_contextmenu;
    class ConversationHeader extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.captureMenuTriggerBound = this.captureMenuTrigger.bind(this);
            this.showMenuBound = this.showMenu.bind(this);
            this.menuTriggerRef = null;
        }
        captureMenuTrigger(triggerRef) {
            this.menuTriggerRef = triggerRef;
        }
        showMenu(event) {
            if (this.menuTriggerRef) {
                this.menuTriggerRef.handleContextClick(event);
            }
        }
        renderBackButton() {
            const { onGoBack, showBackButton } = this.props;
            if (!showBackButton) {
                return null;
            }
            return (react_1.default.createElement("div", { onClick: onGoBack, role: "button", className: "module-conversation-header__back-icon" }));
        }
        renderTitle() {
            const { name, phoneNumber, i18n, isMe, profileName, isVerified, } = this.props;
            if (isMe) {
                return (react_1.default.createElement("div", { className: "module-conversation-header__title" }, i18n('noteToSelf')));
            }
            return (react_1.default.createElement("div", { className: "module-conversation-header__title" },
                name ? react_1.default.createElement(Emojify_1.Emojify, { text: name, i18n: i18n }) : null,
                name && phoneNumber ? ' · ' : null,
                phoneNumber ? phoneNumber : null,
                ' ',
                profileName && !name ? (react_1.default.createElement("span", { className: "module-conversation-header__title__profile-name" },
                    "~",
                    react_1.default.createElement(Emojify_1.Emojify, { text: profileName, i18n: i18n }))) : null,
                isVerified ? ' · ' : null,
                isVerified ? (react_1.default.createElement("span", null,
                    react_1.default.createElement("span", { className: "module-conversation-header__title__verified-icon" }),
                    i18n('verified'))) : null));
        }
        renderAvatar() {
            const { avatarPath, color, i18n, isGroup, isMe, name, phoneNumber, profileName, } = this.props;
            return (react_1.default.createElement("span", { className: "module-conversation-header__avatar" },
                react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color, conversationType: isGroup ? 'group' : 'direct', i18n: i18n, noteToSelf: isMe, name: name, phoneNumber: phoneNumber, profileName: profileName, size: 28 })));
        }
        renderExpirationLength() {
            const { expirationSettingName } = this.props;
            if (!expirationSettingName) {
                return null;
            }
            return (react_1.default.createElement("div", { className: "module-conversation-header__expiration" },
                react_1.default.createElement("div", { className: "module-conversation-header__expiration__clock-icon" }),
                react_1.default.createElement("div", { className: "module-conversation-header__expiration__setting" }, expirationSettingName)));
        }
        renderGear(triggerId) {
            const { showBackButton } = this.props;
            if (showBackButton) {
                return null;
            }
            return (react_1.default.createElement(react_contextmenu_1.ContextMenuTrigger, { id: triggerId, ref: this.captureMenuTriggerBound },
                react_1.default.createElement("div", { role: "button", onClick: this.showMenuBound, className: "module-conversation-header__gear-icon" })));
        }
        /* tslint:disable:jsx-no-lambda react-this-binding-issue */
        renderMenu(triggerId) {
            const { i18n, isMe, isGroup, onDeleteMessages, onResetSession, onSetDisappearingMessages, onShowAllMedia, onShowGroupMembers, onShowSafetyNumber, timerOptions, } = this.props;
            const disappearingTitle = i18n('disappearingMessages');
            return (react_1.default.createElement(react_contextmenu_1.ContextMenu, { id: triggerId },
                react_1.default.createElement(react_contextmenu_1.SubMenu, { title: disappearingTitle }, (timerOptions || []).map(item => (react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    key: item.value, onClick: () => {
                        onSetDisappearingMessages(item.value);
                    }
                }, item.name)))),
                react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onShowAllMedia }, i18n('viewAllMedia')),
                isGroup ? (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onShowGroupMembers }, i18n('showMembers'))) : null,
                !isGroup && !isMe ? (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onShowSafetyNumber }, i18n('showSafetyNumber'))) : null,
                !isGroup ? (react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onResetSession }, i18n('resetSession'))) : null,
                react_1.default.createElement(react_contextmenu_1.MenuItem, { onClick: onDeleteMessages }, i18n('deleteMessages'))));
        }
        /* tslint:enable */
        render() {
            const { id } = this.props;
            return (react_1.default.createElement("div", { className: "module-conversation-header" },
                this.renderBackButton(),
                react_1.default.createElement("div", { className: "module-conversation-header__title-container" },
                    react_1.default.createElement("div", { className: "module-conversation-header__title-flex" },
                        this.renderAvatar(),
                        this.renderTitle())),
                this.renderExpirationLength(),
                this.renderGear(id),
                this.renderMenu(id)));
        }
    }
    exports.ConversationHeader = ConversationHeader;
})();