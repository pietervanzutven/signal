require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const memoizee_1 = __importDefault(require("memoizee"));
    const reselect_1 = require("reselect");
    const Whisper_1 = require("../../shims/Whisper");
    const libphonenumberInstance_1 = require("../../util/libphonenumberInstance");
    const user_1 = require("./user");
    const conversations_1 = require("./conversations");
    exports.getSearch = (state) => state.search;
    exports.getQuery = reselect_1.createSelector(exports.getSearch, (state) => state.query);
    exports.getSelectedMessage = reselect_1.createSelector(exports.getSearch, (state) => state.selectedMessage);
    exports.getSearchConversationId = reselect_1.createSelector(exports.getSearch, (state) => state.searchConversationId);
    exports.getSearchConversationName = reselect_1.createSelector(exports.getSearch, (state) => state.searchConversationName);
    exports.getStartSearchCounter = reselect_1.createSelector(exports.getSearch, (state) => state.startSearchCounter);
    exports.isSearching = reselect_1.createSelector(exports.getSearch, (state) => {
        const { query } = state;
        return query && query.trim().length > 1;
    });
    exports.getMessageSearchResultLookup = reselect_1.createSelector(exports.getSearch, (state) => state.messageLookup);
    exports.getSearchResults = reselect_1.createSelector([
        exports.getSearch,
        user_1.getRegionCode,
        user_1.getUserAgent,
        conversations_1.getConversationLookup,
        conversations_1.getSelectedConversation,
        exports.getSelectedMessage,
    ], (state, regionCode, userAgent, lookup, selectedConversationId, selectedMessageId) => {
        const { contacts, conversations, discussionsLoading, messageIds, messagesLoading, searchConversationName, } = state;
        const showStartNewConversation = Boolean(state.normalizedPhoneNumber && !lookup[state.normalizedPhoneNumber]);
        const haveConversations = conversations && conversations.length;
        const haveContacts = contacts && contacts.length;
        const haveMessages = messageIds && messageIds.length;
        const noResults = !discussionsLoading &&
            !messagesLoading &&
            !showStartNewConversation &&
            !haveConversations &&
            !haveContacts &&
            !haveMessages;
        const items = [];
        if (showStartNewConversation) {
            items.push({
                type: 'start-new-conversation',
                data: undefined,
            });
            const isIOS = userAgent === 'OWI';
            let isValidNumber = false;
            try {
                // Sometimes parse() throws, like for invalid country codes
                const parsedNumber = libphonenumberInstance_1.instance.parse(state.query, regionCode);
                isValidNumber = libphonenumberInstance_1.instance.isValidNumber(parsedNumber);
            }
            catch (_) {
                // no-op
            }
            if (!isIOS && isValidNumber) {
                items.push({
                    type: 'sms-mms-not-supported-text',
                    data: undefined,
                });
            }
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
                    data: Object.assign(Object.assign({}, data), { isSelected: Boolean(data && id === selectedConversationId) }),
                });
            });
        }
        else if (discussionsLoading) {
            items.push({
                type: 'conversations-header',
                data: undefined,
            });
            items.push({
                type: 'spinner',
                data: undefined,
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
                    data: Object.assign(Object.assign({}, data), { isSelected: Boolean(data && id === selectedConversationId) }),
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
        else if (messagesLoading) {
            items.push({
                type: 'messages-header',
                data: undefined,
            });
            items.push({
                type: 'spinner',
                data: undefined,
            });
        }
        return {
            discussionsLoading,
            items,
            messagesLoading,
            noResults,
            regionCode,
            searchConversationName,
            searchTerm: state.query,
            selectedConversationId,
            selectedMessageId,
        };
    });
    function _messageSearchResultSelector(message, _ourNumber, _regionCode, _sender, _recipient, searchConversationId, selectedMessageId) {
        // Note: We don't use all of those parameters here, but the shim we call does.
        //   We want to call this function again if any of those parameters change.
        return Object.assign(Object.assign({}, Whisper_1.getSearchResultsProps(message)), { isSelected: message.id === selectedMessageId, isSearchingInConversation: Boolean(searchConversationId) });
    }
    exports._messageSearchResultSelector = _messageSearchResultSelector;
    exports.getCachedSelectorForMessageSearchResult = reselect_1.createSelector(user_1.getRegionCode, user_1.getUserNumber, () => {
        // Note: memoizee will check all parameters provided, and only run our selector
        //   if any of them have changed.
        return memoizee_1.default(_messageSearchResultSelector, { max: 500 });
    });
    exports.getMessageSearchResultSelector = reselect_1.createSelector(exports.getCachedSelectorForMessageSearchResult, exports.getMessageSearchResultLookup, exports.getSelectedMessage, conversations_1.getConversationSelector, exports.getSearchConversationId, user_1.getRegionCode, user_1.getUserNumber, (messageSearchResultSelector, messageSearchResultLookup, selectedMessage, conversationSelector, searchConversationId, regionCode, ourNumber) => {
        return (id) => {
            const message = messageSearchResultLookup[id];
            if (!message) {
                return undefined;
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
            return messageSearchResultSelector(message, ourNumber, regionCode, sender, recipient, searchConversationId, selectedMessage);
        };
    });
});