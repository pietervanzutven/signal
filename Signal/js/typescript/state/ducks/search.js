(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.ducks = window.ts.state.ducks || {};
    const exports = window.ts.state.ducks.search = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = window.lodash;
    const PhoneNumber_1 = window.ts.types.PhoneNumber;
    const events_1 = window.ts.shims.events;
    const cleanSearchTerm_1 = window.ts.util.cleanSearchTerm;
    const data_1 = window.data;
    const makeLookup_1 = require_ts_util_makeLookup();
    // Action Creators
    exports.actions = {
        search,
        clearSearch,
        clearConversationSearch,
        searchInConversation,
        updateSearchTerm,
        startNewConversation,
    };
    function search(query, options) {
        return {
            type: 'SEARCH_RESULTS',
            payload: doSearch(query, options),
        };
    }
    async function doSearch(query, options) {
        const { regionCode, ourNumber, noteToSelf, searchConversationId } = options;
        const normalizedPhoneNumber = PhoneNumber_1.normalize(query, { regionCode });
        if (searchConversationId) {
            const messages = await queryMessages(query, searchConversationId);
            return {
                contacts: [],
                conversations: [],
                messages,
                normalizedPhoneNumber,
                query,
            };
        }
        else {
            const [discussions, messages] = await Promise.all([
                queryConversationsAndContacts(query, { ourNumber, noteToSelf }),
                queryMessages(query),
            ]);
            const { conversations, contacts } = discussions;
            return {
                contacts,
                conversations,
                messages,
                normalizedPhoneNumber,
                query,
            };
        }
    }
    function clearSearch() {
        return {
            type: 'SEARCH_CLEAR',
            payload: null,
        };
    }
    function clearConversationSearch() {
        return {
            type: 'CLEAR_CONVERSATION_SEARCH',
            payload: null,
        };
    }
    function searchInConversation(searchConversationId, searchConversationName) {
        return {
            type: 'SEARCH_IN_CONVERSATION',
            payload: {
                searchConversationId,
                searchConversationName,
            },
        };
    }
    function updateSearchTerm(query) {
        return {
            type: 'SEARCH_UPDATE',
            payload: {
                query,
            },
        };
    }
    function startNewConversation(query, options) {
        const { regionCode } = options;
        const normalized = PhoneNumber_1.normalize(query, { regionCode });
        if (!normalized) {
            throw new Error('Attempted to start new conversation with invalid number');
        }
        events_1.trigger('showConversation', normalized);
        return {
            type: 'SEARCH_CLEAR',
            payload: null,
        };
    }
    async function queryMessages(query, searchConversationId) {
        try {
            const normalized = cleanSearchTerm_1.cleanSearchTerm(query);
            if (searchConversationId) {
                return data_1.searchMessagesInConversation(normalized, searchConversationId);
            }
            return data_1.searchMessages(normalized);
        }
        catch (e) {
            return [];
        }
    }
    async function queryConversationsAndContacts(providedQuery, options) {
        const { ourNumber, noteToSelf } = options;
        const query = providedQuery.replace(/[+-.()]*/g, '');
        const searchResults = await data_1.searchConversations(query);
        // Split into two groups - active conversations and items just from address book
        let conversations = [];
        let contacts = [];
        const max = searchResults.length;
        for (let i = 0; i < max; i += 1) {
            const conversation = searchResults[i];
            if (conversation.type === 'direct' && !Boolean(conversation.lastMessage)) {
                contacts.push(conversation.id);
            }
            else {
                conversations.push(conversation.id);
            }
        }
        // Inject synthetic Note to Self entry if query matches localized 'Note to Self'
        if (noteToSelf.indexOf(providedQuery.toLowerCase()) !== -1) {
            // ensure that we don't have duplicates in our results
            contacts = contacts.filter(id => id !== ourNumber);
            conversations = conversations.filter(id => id !== ourNumber);
            contacts.unshift(ourNumber);
        }
        return { conversations, contacts };
    }
    // Reducer
    function getEmptyState() {
        return {
            query: '',
            messageIds: [],
            messageLookup: {},
            conversations: [],
            contacts: [],
        };
    }
    // tslint:disable-next-line max-func-body-length
    function reducer(state = getEmptyState(), action) {
        if (action.type === 'SEARCH_CLEAR') {
            return getEmptyState();
        }
        if (action.type === 'SEARCH_UPDATE') {
            const { payload } = action;
            const { query } = payload;
            return Object.assign({}, state, { query });
        }
        if (action.type === 'SEARCH_IN_CONVERSATION') {
            const { payload } = action;
            const { searchConversationId, searchConversationName } = payload;
            if (searchConversationId === state.searchConversationId) {
                return state;
            }
            return Object.assign({}, getEmptyState(), {
                searchConversationId,
                searchConversationName
            });
        }
        if (action.type === 'CLEAR_CONVERSATION_SEARCH') {
            const { searchConversationId, searchConversationName } = state;
            return Object.assign({}, getEmptyState(), {
                searchConversationId,
                searchConversationName
            });
        }
        if (action.type === 'SEARCH_RESULTS_FULFILLED') {
            const { payload } = action;
            const { contacts, conversations, messages, normalizedPhoneNumber, query, } = payload;
            // Reject if the associated query is not the most recent user-provided query
            if (state.query !== query) {
                return state;
            }
            const messageIds = messages.map(message => message.id);
            return Object.assign({}, state, {
                contacts,
                conversations,
                normalizedPhoneNumber,
                query,
                messageIds, messageLookup: makeLookup_1.makeLookup(messages, 'id')
            });
        }
        if (action.type === 'CONVERSATIONS_REMOVE_ALL') {
            return getEmptyState();
        }
        if (action.type === 'SELECTED_CONVERSATION_CHANGED') {
            const { payload } = action;
            const { id, messageId } = payload;
            const { searchConversationId } = state;
            if (searchConversationId && searchConversationId !== id) {
                return getEmptyState();
            }
            return Object.assign({}, state, { selectedMessage: messageId });
        }
        if (action.type === 'MESSAGE_DELETED') {
            const { messageIds, messageLookup } = state;
            if (!messageIds || messageIds.length < 1) {
                return state;
            }
            const { payload } = action;
            const { id } = payload;
            return Object.assign({}, state, { messageIds: lodash_1.reject(messageIds, messageId => id === messageId), messageLookup: lodash_1.omit(messageLookup, ['id']) });
        }
        return state;
    }
    exports.reducer = reducer;
})();