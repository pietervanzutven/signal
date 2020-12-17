(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.ducks = window.ts.state.ducks || {};
    const exports = window.ts.state.ducks.conversations = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = window.lodash;
    const events_1 = window.ts.shims.events;
    // Action Creators
    exports.actions = {
        conversationAdded,
        conversationChanged,
        conversationRemoved,
        removeAllConversations,
        messageExpired,
        openConversationInternal,
        openConversationExternal,
        showInbox,
        showArchivedConversations,
    };
    function conversationAdded(id, data) {
        return {
            type: 'CONVERSATION_ADDED',
            payload: {
                id,
                data,
            },
        };
    }
    function conversationChanged(id, data) {
        return {
            type: 'CONVERSATION_CHANGED',
            payload: {
                id,
                data,
            },
        };
    }
    function conversationRemoved(id) {
        return {
            type: 'CONVERSATION_REMOVED',
            payload: {
                id,
            },
        };
    }
    function removeAllConversations() {
        return {
            type: 'CONVERSATIONS_REMOVE_ALL',
            payload: null,
        };
    }
    function messageExpired(id, conversationId) {
        return {
            type: 'MESSAGE_EXPIRED',
            payload: {
                id,
                conversationId,
            },
        };
    }
    // Note: we need two actions here to simplify. Operations outside of the left pane can
    //   trigger an 'openConversation' so we go through Whisper.events for all conversation
    //   selection.
    function openConversationInternal(id, messageId) {
        events_1.trigger('showConversation', id, messageId);
        return {
            type: 'NOOP',
            payload: null,
        };
    }
    function openConversationExternal(id, messageId) {
        return {
            type: 'SELECTED_CONVERSATION_CHANGED',
            payload: {
                id,
                messageId,
            },
        };
    }
    function showInbox() {
        return {
            type: 'SHOW_INBOX',
            payload: null,
        };
    }
    function showArchivedConversations() {
        return {
            type: 'SHOW_ARCHIVED_CONVERSATIONS',
            payload: null,
        };
    }
    // Reducer
    function getEmptyState() {
        return {
            conversationLookup: {},
            showArchived: false,
        };
    }
    function reducer(state, action) {
        if (!state) {
            return getEmptyState();
        }
        if (action.type === 'CONVERSATION_ADDED') {
            const { payload } = action;
            const { id, data } = payload;
            const { conversationLookup } = state;
            return Object.assign({}, state, { conversationLookup: Object.assign({}, conversationLookup, { [id]: data }) });
        }
        if (action.type === 'CONVERSATION_CHANGED') {
            const { payload } = action;
            const { id, data } = payload;
            const { conversationLookup } = state;
            let showArchived = state.showArchived;
            let selectedConversation = state.selectedConversation;
            const existing = conversationLookup[id];
            // In the change case we only modify the lookup if we already had that conversation
            if (!existing) {
                return state;
            }
            if (selectedConversation === id) {
                // Archived -> Inbox: we go back to the normal inbox view
                if (existing.isArchived && !data.isArchived) {
                    showArchived = false;
                }
                // Inbox -> Archived: no conversation is selected
                // Note: With today's stacked converastions architecture, this can result in weird
                //   behavior - no selected conversation in the left pane, but a conversation show
                //   in the right pane.
                if (!existing.isArchived && data.isArchived) {
                    selectedConversation = undefined;
                }
            }
            return Object.assign({}, state, {
                selectedConversation,
                showArchived, conversationLookup: Object.assign({}, conversationLookup, { [id]: data })
            });
        }
        if (action.type === 'CONVERSATION_REMOVED') {
            const { payload } = action;
            const { id } = payload;
            const { conversationLookup } = state;
            return Object.assign({}, state, { conversationLookup: lodash_1.omit(conversationLookup, [id]) });
        }
        if (action.type === 'CONVERSATIONS_REMOVE_ALL') {
            return getEmptyState();
        }
        if (action.type === 'MESSAGE_EXPIRED') {
            // noop - for now this is only important for search
        }
        if (action.type === 'SELECTED_CONVERSATION_CHANGED') {
            const { payload } = action;
            const { id } = payload;
            return Object.assign({}, state, { selectedConversation: id });
        }
        if (action.type === 'SHOW_INBOX') {
            return Object.assign({}, state, { showArchived: false });
        }
        if (action.type === 'SHOW_ARCHIVED_CONVERSATIONS') {
            return Object.assign({}, state, { showArchived: true });
        }
        return state;
    }
    exports.reducer = reducer;
})();