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
    const Whisper_1 = window.ts.shims.Whisper;
    const cleanSearchTerm_1 = window.ts.util.cleanSearchTerm;
    const data_1 = window.data;
    const makeLookup_1 = require_ts_util_makeLookup();
    // Action Creators
    exports.actions = {
        search,
        clearSearch,
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
        const { regionCode, ourNumber, noteToSelf } = options;
        const [discussions, messages] = await Promise.all([
            queryConversationsAndContacts(query, { ourNumber, noteToSelf }),
            queryMessages(query),
        ]);
        const { conversations, contacts } = discussions;
        return {
            query,
            normalizedPhoneNumber: PhoneNumber_1.normalize(query, { regionCode }),
            conversations,
            contacts,
            messages: getMessageProps(messages) || [],
        };
    }
    function clearSearch() {
        return {
            type: 'SEARCH_CLEAR',
            payload: null,
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
    // Helper functions for search
    const getMessageProps = (messages) => {
        if (!messages || !messages.length) {
            return [];
        }
        return messages.map(message => {
            const model = Whisper_1.getMessageModel(message);
            return model.propsForSearchResult;
        });
    };
    async function queryMessages(query) {
        try {
            const normalized = cleanSearchTerm_1.cleanSearchTerm(query);
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
            messages: [],
            messageLookup: {},
            conversations: [],
            contacts: [],
        };
    }
    function reducer(state, action) {
        if (!state) {
            return getEmptyState();
        }
        if (action.type === 'SEARCH_CLEAR') {
            return getEmptyState();
        }
        if (action.type === 'SEARCH_UPDATE') {
            const { payload } = action;
            const { query } = payload;
            return Object.assign({}, state, { query });
        }
        if (action.type === 'SEARCH_RESULTS_FULFILLED') {
            const { payload } = action;
            const { query, messages } = payload;
            // Reject if the associated query is not the most recent user-provided query
            if (state.query !== query) {
                return state;
            }
            return Object.assign({}, state, payload, { messageLookup: makeLookup_1.makeLookup(messages, 'id') });
        }
        if (action.type === 'CONVERSATIONS_REMOVE_ALL') {
            return getEmptyState();
        }
        if (action.type === 'SELECTED_CONVERSATION_CHANGED') {
            const { payload } = action;
            const { messageId } = payload;
            if (!messageId) {
                return state;
            }
            return Object.assign({}, state, { selectedMessage: messageId });
        }
        if (action.type === 'MESSAGE_EXPIRED') {
            const { messages, messageLookup } = state;
            if (!messages.length) {
                return state;
            }
            const { payload } = action;
            const { id } = payload;
            return Object.assign({}, state, { messages: lodash_1.reject(messages, message => id === message.id), messageLookup: lodash_1.omit(messageLookup, ['id']) });
        }
        return state;
    }
    exports.reducer = reducer;
})();