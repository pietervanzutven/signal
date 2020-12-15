(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.SearchResults = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const ConversationListItem_1 = window.ts.components.ConversationListItem;
    const MessageSearchResult_1 = window.ts.components.MessageSearchResult;
    const StartNewConversation_1 = window.ts.components.StartNewConversation;
    class SearchResults extends react_1.default.Component {
        render() {
            const { conversations, contacts, hideMessagesHeader, i18n, messages, openConversation, startNewConversation, searchTerm, showStartNewConversation, } = this.props;
            const haveConversations = conversations && conversations.length;
            const haveContacts = contacts && contacts.length;
            const haveMessages = messages && messages.length;
            const noResults = !showStartNewConversation &&
                !haveConversations &&
                !haveContacts &&
                !haveMessages;
            return (react_1.default.createElement("div", { className: "module-search-results" },
                noResults ? (react_1.default.createElement("div", { className: "module-search-results__no-results" }, i18n('noSearchResults', [searchTerm]))) : null,
                showStartNewConversation ? (react_1.default.createElement(StartNewConversation_1.StartNewConversation, { phoneNumber: searchTerm, i18n: i18n, onClick: startNewConversation })) : null,
                haveConversations ? (react_1.default.createElement("div", { className: "module-search-results__conversations" },
                    react_1.default.createElement("div", { className: "module-search-results__conversations-header" }, i18n('conversationsHeader')),
                    conversations.map(conversation => (react_1.default.createElement(ConversationListItem_1.ConversationListItem, Object.assign({ key: conversation.phoneNumber }, conversation, { onClick: openConversation, i18n: i18n })))))) : null,
                haveContacts ? (react_1.default.createElement("div", { className: "module-search-results__contacts" },
                    react_1.default.createElement("div", { className: "module-search-results__contacts-header" }, i18n('contactsHeader')),
                    contacts.map(contact => (react_1.default.createElement(ConversationListItem_1.ConversationListItem, Object.assign({ key: contact.phoneNumber }, contact, { onClick: openConversation, i18n: i18n })))))) : null,
                haveMessages ? (react_1.default.createElement("div", { className: "module-search-results__messages" },
                    hideMessagesHeader ? null : (react_1.default.createElement("div", { className: "module-search-results__messages-header" }, i18n('messagesHeader'))),
                    messages.map(message => (react_1.default.createElement(MessageSearchResult_1.MessageSearchResult, Object.assign({ key: message.id }, message, { onClick: openConversation, i18n: i18n })))))) : null));
        }
    }
    exports.SearchResults = SearchResults;
})();