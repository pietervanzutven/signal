(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.selectors = window.ts.state.selectors || {};
    const exports = window.ts.state.selectors.search = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const memoizee_1 = __importDefault(window.memoizee);
    const reselect_1 = window.reselect;
    const Whisper_1 = window.ts.shims.Whisper;
    const user_1 = window.ts.state.selectors.user;
    const conversations_1 = window.ts.state.selectors.conversations;
    exports.getSearch = (state) => state.search;
    exports.getQuery = reselect_1.createSelector(exports.getSearch, (state) => state.query);
    exports.getSelectedMessage = reselect_1.createSelector(exports.getSearch, (state) => state.selectedMessage);
    exports.isSearching = reselect_1.createSelector(exports.getSearch, (state) => {
        const { query } = state;
        return query && query.trim().length > 1;
    });
    exports.getMessageSearchResultLookup = reselect_1.createSelector(exports.getSearch, (state) => state.messageLookup);
    exports.getSearchResults = reselect_1.createSelector([exports.getSearch, user_1.getRegionCode, conversations_1.getConversationLookup, conversations_1.getSelectedConversation], (state, regionCode, lookup, selectedConversation) => {
        const { conversations, contacts, messageIds } = state;
        const showStartNewConversation = Boolean(state.normalizedPhoneNumber && !lookup[state.normalizedPhoneNumber]);
        const haveConversations = conversations && conversations.length;
        const haveContacts = contacts && contacts.length;
        const haveMessages = messageIds && messageIds.length;
        const noResults = !showStartNewConversation &&
            !haveConversations &&
            !haveContacts &&
            !haveMessages;
        const items = [];
        if (showStartNewConversation) {
            items.push({
                type: 'start-new-conversation',
                data: undefined,
            });
        }
        if (haveConversations) {
            items.push({
                type: 'conversations-header',
                data: undefined,
            });
            conversations.forEach(id => {
                const data = lookup[id];
                items.push({
                    type: 'conversation',
                    data: Object.assign({}, data, { isSelected: Boolean(data && id === selectedConversation) }),
                });
            });
        }
        if (haveContacts) {
            items.push({
                type: 'contacts-header',
                data: undefined,
            });
            contacts.forEach(id => {
                const data = lookup[id];
                items.push({
                    type: 'contact',
                    data: Object.assign({}, data, { isSelected: Boolean(data && id === selectedConversation) }),
                });
            });
        }
        if (haveMessages) {
            items.push({
                type: 'messages-header',
                data: undefined,
            });
            messageIds.forEach(messageId => {
                items.push({
                    type: 'message',
                    data: messageId,
                });
            });
        }
        return {
            items,
            noResults,
            regionCode: regionCode,
            searchTerm: state.query,
        };
    });
    function _messageSearchResultSelector(message,
        // @ts-ignore
        ourNumber,
        // @ts-ignore
        regionCode,
        // @ts-ignore
        sender,
        // @ts-ignore
        recipient, selectedMessageId) {
        // Note: We don't use all of those parameters here, but the shim we call does.
        //   We want to call this function again if any of those parameters change.
        return Object.assign({}, Whisper_1.getSearchResultsProps(message), { isSelected: message.id === selectedMessageId });
    }
    exports._messageSearchResultSelector = _messageSearchResultSelector;
    exports.getCachedSelectorForMessageSearchResult = reselect_1.createSelector(user_1.getRegionCode, user_1.getUserNumber, () => {
        // Note: memoizee will check all parameters provided, and only run our selector
        //   if any of them have changed.
        return memoizee_1.default(_messageSearchResultSelector, { max: 500 });
    });
    exports.getMessageSearchResultSelector = reselect_1.createSelector(exports.getCachedSelectorForMessageSearchResult, exports.getMessageSearchResultLookup, exports.getSelectedMessage, conversations_1.getConversationSelector, user_1.getRegionCode, user_1.getUserNumber, (messageSearchResultSelector, messageSearchResultLookup, selectedMessage, conversationSelector, regionCode, ourNumber) => {
        return (id) => {
            const message = messageSearchResultLookup[id];
            if (!message) {
                return;
            }
            const { conversationId, source, type } = message;
            let sender;
            let recipient;
            if (type === 'incoming') {
                sender = conversationSelector(source);
                recipient = conversationSelector(ourNumber);
            }
            else if (type === 'outgoing') {
                sender = conversationSelector(ourNumber);
                recipient = conversationSelector(conversationId);
            }
            return messageSearchResultSelector(message, ourNumber, regionCode, sender, recipient, selectedMessage);
        };
    });
})();