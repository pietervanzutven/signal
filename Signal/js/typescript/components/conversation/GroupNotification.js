(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.GroupNotification = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    // import classNames from 'classnames';
    const lodash_1 = window.lodash;
    const ContactName_1 = window.ts.components.conversation.ContactName;
    const Intl_1 = window.ts.components.Intl;
    const missingCaseError_1 = window.ts.util.missingCaseError;
    class GroupNotification extends react_1.default.Component {
        renderChange(change) {
            const { isMe, contacts, type, newName } = change;
            const { i18n } = this.props;
            const people = lodash_1.compact(lodash_1.flatten((contacts || []).map((contact, index) => {
                const element = (react_1.default.createElement("span", { key: `external-${contact.phoneNumber}`, className: "module-group-notification__contact" },
                    react_1.default.createElement(ContactName_1.ContactName, { i18n: i18n, phoneNumber: contact.phoneNumber, profileName: contact.profileName, name: contact.name })));
                return [index > 0 ? ', ' : null, element];
            })));
            switch (type) {
                case 'name':
                    return i18n('titleIsNow', [newName || '']);
                case 'add':
                    if (!contacts || !contacts.length) {
                        throw new Error('Group update is missing contacts');
                    }
                    return (react_1.default.createElement(Intl_1.Intl, { i18n: i18n, id: contacts.length > 1 ? 'multipleJoinedTheGroup' : 'joinedTheGroup', components: [people] }));
                case 'remove':
                    if (!contacts || !contacts.length) {
                        throw new Error('Group update is missing contacts');
                    }
                    if (isMe) {
                        return i18n('youLeftTheGroup');
                    }
                    return (react_1.default.createElement(Intl_1.Intl, { i18n: i18n, id: contacts.length > 1 ? 'multipleLeftTheGroup' : 'leftTheGroup', components: [people] }));
                case 'general':
                    return i18n('updatedTheGroup');
                default:
                    throw missingCaseError_1.missingCaseError(type);
            }
        }
        render() {
            const { changes } = this.props;
            return (react_1.default.createElement("div", { className: "module-group-notification" }, (changes || []).map((change, index) => (react_1.default.createElement("div", { key: index, className: "module-group-notification__change" }, this.renderChange(change))))));
        }
    }
    exports.GroupNotification = GroupNotification;
})();