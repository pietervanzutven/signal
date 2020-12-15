(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.selectors = window.ts.state.selectors || {};
    const exports = window.ts.state.selectors.search = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = window.lodash;
    const reselect_1 = window.reselect;
    const conversations_1 = window.ts.state.selectors.conversations;
    exports.getSearch = (state) => state.search;
    exports.getQuery = reselect_1.createSelector(exports.getSearch, (state) => state.query);
    exports.getSelectedMessage = reselect_1.createSelector(exports.getSearch, (state) => state.selectedMessage);
    exports.isSearching = reselect_1.createSelector(exports.getSearch, (state) => {
        const { query } = state;
        return query && query.trim().length > 1;
    });
    exports.getSearchResults = reselect_1.createSelector([
        exports.getSearch,
        conversations_1.getConversationLookup,
        conversations_1.getSelectedConversation,
        exports.getSelectedMessage,
    ], (state, lookup, selectedConversation, selectedMessage) => {
        return {
            contacts: lodash_1.compact(state.contacts.map(id => {
                const value = lookup[id];
                if (value && id === selectedConversation) {
                    return Object.assign({}, value, { isSelected: true });
                }
                return value;
            })),
            conversations: lodash_1.compact(state.conversations.map(id => {
                const value = lookup[id];
                if (value && id === selectedConversation) {
                    return Object.assign({}, value, { isSelected: true });
                }
                return value;
            })),
            hideMessagesHeader: false,
            messages: state.messages.map(message => {
                if (message.id === selectedMessage) {
                    return Object.assign({}, message, { isSelected: true });
                }
                return message;
            }),
            searchTerm: state.query,
            showStartNewConversation: Boolean(state.normalizedPhoneNumber && !lookup[state.normalizedPhoneNumber]),
        };
    });
})();