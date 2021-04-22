(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.ducks = window.ts.state.ducks || {};
    const exports = window.ts.state.ducks.search = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = window.lodash;
    const PhoneNumber_1 = window.ts.types.PhoneNumber;
    const events_1 = window.ts.shims.events;
    const cleanSearchTerm_1 = require("../../util/cleanSearchTerm");
    const Client_1 = __importDefault(window.ts.sql.Client);
    const makeLookup_1 = require("../../util/makeLookup");
    const { searchConversations: dataSearchConversations, searchMessages: dataSearchMessages, searchMessagesInConversation, } = Client_1.default;
    // Action Creators
    exports.actions = {
        searchMessages,
        searchDiscussions,
        startSearch,
        clearSearch,
        clearConversationSearch,
        searchInConversation,
        updateSearchTerm,
        startNewConversation,
    };
    function searchMessages(query, options) {
        return {
            type: 'SEARCH_MESSAGES_RESULTS',
            payload: doSearchMessages(query, options),
        };
    }
    function searchDiscussions(query, options) {
        return {
            type: 'SEARCH_DISCUSSIONS_RESULTS',
            payload: doSearchDiscussions(query, options),
        };
    }
    async function doSearchMessages(query, options) {
        const { regionCode, searchConversationId } = options;
        const normalizedPhoneNumber = PhoneNumber_1.normalize(query, { regionCode });
        const messages = await queryMessages(query, searchConversationId);
        return {
            messages,
            normalizedPhoneNumber,
            query,
        };
    }
    async function doSearchDiscussions(query, options) {
        const { ourConversationId, noteToSelf } = options;
        const { conversations, contacts } = await queryConversationsAndContacts(query, {
            ourConversationId,
            noteToSelf,
        });
        return {
            conversations,
            contacts,
            query,
        };
    }
    function startSearch() {
        return {
            type: 'SEARCH_START',
            payload: null,
        };
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
                return searchMessagesInConversation(normalized, searchConversationId);
            }
            return dataSearchMessages(normalized);
        }
        catch (e) {
            return [];
        }
    }
    async function queryConversationsAndContacts(providedQuery, options) {
        const { ourConversationId, noteToSelf } = options;
        const query = providedQuery.replace(/[+-.()]*/g, '');
        const searchResults = await dataSearchConversations(query);
        // Split into two groups - active conversations and items just from address book
        let conversations = [];
        let contacts = [];
        const max = searchResults.length;
        for (let i = 0; i < max; i += 1) {
            const conversation = searchResults[i];
            if (conversation.type === 'private' && !Boolean(conversation.lastMessage)) {
                contacts.push(conversation.id);
            }
            else {
                conversations.push(conversation.id);
            }
        }
        // // @ts-ignore
        // console._log(
        //   '%cqueryConversationsAndContacts',
        //   'background:black;color:red;',
        //   { searchResults, conversations, ourNumber, ourUuid }
        // );
        // Inject synthetic Note to Self entry if query matches localized 'Note to Self'
        if (noteToSelf.indexOf(providedQuery.toLowerCase()) !== -1) {
            // ensure that we don't have duplicates in our results
            contacts = contacts.filter(id => id !== ourConversationId);
            conversations = conversations.filter(id => id !== ourConversationId);
            contacts.unshift(ourConversationId);
        }
        return { conversations, contacts };
    }
    // Reducer
    function getEmptyState() {
        return {
            startSearchCounter: 0,
            query: '',
            messageIds: [],
            messageLookup: {},
            conversations: [],
            contacts: [],
            discussionsLoading: false,
            messagesLoading: false,
        };
    }
    // tslint:disable-next-line cyclomatic-complexity max-func-body-length
    function reducer(state = getEmptyState(), action) {
        if (action.type === 'SHOW_ARCHIVED_CONVERSATIONS') {
            return getEmptyState();
        }
        if (action.type === 'SEARCH_START') {
            return Object.assign(Object.assign({}, state), { searchConversationId: undefined, searchConversationName: undefined, startSearchCounter: state.startSearchCounter + 1 });
        }
        if (action.type === 'SEARCH_CLEAR') {
            return getEmptyState();
        }
        if (action.type === 'SEARCH_UPDATE') {
            const { payload } = action;
            const { query } = payload;
            const hasQuery = Boolean(query && query.length >= 2);
            const isWithinConversation = Boolean(state.searchConversationId);
            return Object.assign(Object.assign(Object.assign({}, state), { query, messagesLoading: hasQuery }), (hasQuery
                ? {
                    messageIds: [],
                    messageLookup: {},
                    discussionsLoading: !isWithinConversation,
                    contacts: [],
                    conversations: [],
                }
                : {}));
        }
        if (action.type === 'SEARCH_IN_CONVERSATION') {
            const { payload } = action;
            const { searchConversationId, searchConversationName } = payload;
            if (searchConversationId === state.searchConversationId) {
                return Object.assign(Object.assign({}, state), { startSearchCounter: state.startSearchCounter + 1 });
            }
            return Object.assign(Object.assign({}, getEmptyState()), {
                searchConversationId,
                searchConversationName, startSearchCounter: state.startSearchCounter + 1
            });
        }
        if (action.type === 'CLEAR_CONVERSATION_SEARCH') {
            const { searchConversationId, searchConversationName } = state;
            return Object.assign(Object.assign({}, getEmptyState()), {
                searchConversationId,
                searchConversationName
            });
        }
        if (action.type === 'SEARCH_MESSAGES_RESULTS_FULFILLED') {
            const { payload } = action;
            const { messages, normalizedPhoneNumber, query } = payload;
            // Reject if the associated query is not the most recent user-provided query
            if (state.query !== query) {
                return state;
            }
            const messageIds = messages.map(message => message.id);
            return Object.assign(Object.assign({}, state), {
                normalizedPhoneNumber,
                query,
                messageIds, messageLookup: makeLookup_1.makeLookup(messages, 'id'), messagesLoading: false
            });
        }
        if (action.type === 'SEARCH_DISCUSSIONS_RESULTS_FULFILLED') {
            const { payload } = action;
            const { contacts, conversations } = payload;
            return Object.assign(Object.assign({}, state), {
                contacts,
                conversations, discussionsLoading: false
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
            return Object.assign(Object.assign({}, state), { selectedMessage: messageId });
        }
        if (action.type === 'CONVERSATION_UNLOADED') {
            const { payload } = action;
            const { id } = payload;
            const { searchConversationId } = state;
            if (searchConversationId && searchConversationId === id) {
                return getEmptyState();
            }
            return state;
        }
        if (action.type === 'MESSAGE_DELETED') {
            const { messageIds, messageLookup } = state;
            if (!messageIds || messageIds.length < 1) {
                return state;
            }
            const { payload } = action;
            const { id } = payload;
            return Object.assign(Object.assign({}, state), { messageIds: lodash_1.reject(messageIds, messageId => id === messageId), messageLookup: lodash_1.omit(messageLookup, ['id']) });
        }
        return state;
    }
    exports.reducer = reducer;
})();