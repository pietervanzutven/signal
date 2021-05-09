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
    const react_1 = __importDefault(require("react"));
    const lodash_1 = require("lodash");
    const ContactName_1 = require("./ContactName");
    const Intl_1 = require("../Intl");
    const missingCaseError_1 = require("../../util/missingCaseError");
    class GroupNotification extends react_1.default.Component {
        renderChange(change, from) {
            const { contacts, type, newName } = change;
            const { i18n } = this.props;
            const otherPeople = lodash_1.compact((contacts || []).map(contact => {
                if (contact.isMe) {
                    return null;
                }
                return (react_1.default.createElement("span", { key: `external-${contact.phoneNumber}`, className: "module-group-notification__contact" },
                    react_1.default.createElement(ContactName_1.ContactName, { title: contact.title, phoneNumber: contact.phoneNumber, profileName: contact.profileName, name: contact.name, i18n: i18n })));
            }));
            const otherPeopleWithCommas = lodash_1.compact(lodash_1.flatten(otherPeople.map((person, index) => [index > 0 ? ', ' : null, person])));
            const contactsIncludesMe = (contacts || []).length !== otherPeople.length;
            switch (type) {
                case 'name':
                    return (react_1.default.createElement(Intl_1.Intl, { i18n: i18n, id: "titleIsNow", components: [newName || ''] }));
                case 'avatar':
                    return react_1.default.createElement(Intl_1.Intl, { i18n: i18n, id: "updatedGroupAvatar" });
                case 'add':
                    if (!contacts || !contacts.length) {
                        throw new Error('Group update is missing contacts');
                    }
                    // eslint-disable-next-line no-case-declarations
                    const otherPeopleNotifMsg = otherPeople.length === 1
                        ? 'joinedTheGroup'
                        : 'multipleJoinedTheGroup';
                    return (react_1.default.createElement(react_1.default.Fragment, null,
                        otherPeople.length > 0 && (react_1.default.createElement(Intl_1.Intl, { i18n: i18n, id: otherPeopleNotifMsg, components: [otherPeopleWithCommas] })),
                        contactsIncludesMe && (react_1.default.createElement("div", { className: "module-group-notification__change" },
                            react_1.default.createElement(Intl_1.Intl, { i18n: i18n, id: "youJoinedTheGroup" })))));
                case 'remove':
                    if (from && from.isMe) {
                        return i18n('youLeftTheGroup');
                    }
                    if (!contacts || !contacts.length) {
                        throw new Error('Group update is missing contacts');
                    }
                    // eslint-disable-next-line no-case-declarations
                    const leftKey = contacts.length > 1 ? 'multipleLeftTheGroup' : 'leftTheGroup';
                    return (react_1.default.createElement(Intl_1.Intl, { i18n: i18n, id: leftKey, components: [otherPeopleWithCommas] }));
                case 'general':
                    // eslint-disable-next-line consistent-return
                    return;
                default:
                    throw missingCaseError_1.missingCaseError(type);
            }
        }
        render() {
            const { changes, i18n, from } = this.props;
            // Leave messages are always from the person leaving, so we omit the fromLabel if
            //   the change is a 'leave.'
            const isLeftOnly = changes && changes.length === 1 && changes[0].type === 'remove';
            const fromContact = (react_1.default.createElement(ContactName_1.ContactName, { title: from.title, phoneNumber: from.phoneNumber, profileName: from.profileName, name: from.name, i18n: i18n }));
            const fromLabel = from.isMe ? (react_1.default.createElement(Intl_1.Intl, { i18n: i18n, id: "youUpdatedTheGroup" })) : (react_1.default.createElement(Intl_1.Intl, { i18n: i18n, id: "updatedTheGroup", components: [fromContact] }));
            return (react_1.default.createElement("div", { className: "module-group-notification" },
                isLeftOnly ? null : (react_1.default.createElement(react_1.default.Fragment, null,
                    fromLabel,
                    react_1.default.createElement("br", null))),
                (changes || []).map((change, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    react_1.default.createElement("div", { key: i, className: "module-group-notification__change" }, this.renderChange(change, from))))));
        }
    }
    exports.GroupNotification = GroupNotification;
})();