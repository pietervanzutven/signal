require(exports => {
    "use strict";
    // Copyright 2019-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = require("lodash");
    const calling_1 = require("../../services/calling");
    const getOwn_1 = require("../../util/getOwn");
    const events_1 = require("../../shims/events");
    const Calling_1 = require("../../types/Calling");
    // Helpers
    exports.getConversationCallMode = (conversation) => {
        if (conversation.left ||
            conversation.isBlocked ||
            conversation.isMe ||
            !conversation.acceptedMessageRequest) {
            return Calling_1.CallMode.None;
        }
        if (conversation.type === 'direct') {
            return Calling_1.CallMode.Direct;
        }
        if (conversation.type === 'group' && conversation.groupVersion === 2) {
            return Calling_1.CallMode.Group;
        }
        return Calling_1.CallMode.None;
    };
    // Action Creators
    exports.actions = {
        conversationAdded,
        conversationChanged,
        conversationRemoved,
        conversationUnloaded,
        removeAllConversations,
        selectMessage,
        messageDeleted,
        messageChanged,
        messageSizeChanged,
        messagesAdded,
        messagesReset,
        setMessagesLoading,
        setLoadCountdownStart,
        setIsNearBottom,
        setSelectedConversationPanelDepth,
        clearChangedMessages,
        clearSelectedMessage,
        clearUnreadMetrics,
        scrollToMessage,
        openConversationInternal,
        openConversationExternal,
        showInbox,
        showArchivedConversations,
        repairNewestMessage,
        repairOldestMessage,
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
        return dispatch => {
            calling_1.calling.groupMembersChanged(id);
            dispatch({
                type: 'CONVERSATION_CHANGED',
                payload: {
                    id,
                    data,
                },
            });
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
    function conversationUnloaded(id) {
        return {
            type: 'CONVERSATION_UNLOADED',
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
    function selectMessage(messageId, conversationId) {
        return {
            type: 'MESSAGE_SELECTED',
            payload: {
                messageId,
                conversationId,
            },
        };
    }
    function messageChanged(id, conversationId, data) {
        return {
            type: 'MESSAGE_CHANGED',
            payload: {
                id,
                conversationId,
                data,
            },
        };
    }
    function messageDeleted(id, conversationId) {
        return {
            type: 'MESSAGE_DELETED',
            payload: {
                id,
                conversationId,
            },
        };
    }
    function messageSizeChanged(id, conversationId) {
        return {
            type: 'MESSAGE_SIZE_CHANGED',
            payload: {
                id,
                conversationId,
            },
        };
    }
    function messagesAdded(conversationId, messages, isNewMessage, isActive) {
        return {
            type: 'MESSAGES_ADDED',
            payload: {
                conversationId,
                messages,
                isNewMessage,
                isActive,
            },
        };
    }
    function repairNewestMessage(conversationId) {
        return {
            type: 'REPAIR_NEWEST_MESSAGE',
            payload: {
                conversationId,
            },
        };
    }
    function repairOldestMessage(conversationId) {
        return {
            type: 'REPAIR_OLDEST_MESSAGE',
            payload: {
                conversationId,
            },
        };
    }
    function messagesReset(conversationId, messages, metrics, scrollToMessageId, unboundedFetch) {
        return {
            type: 'MESSAGES_RESET',
            payload: {
                unboundedFetch: Boolean(unboundedFetch),
                conversationId,
                messages,
                metrics,
                scrollToMessageId,
            },
        };
    }
    function setMessagesLoading(conversationId, isLoadingMessages) {
        return {
            type: 'SET_MESSAGES_LOADING',
            payload: {
                conversationId,
                isLoadingMessages,
            },
        };
    }
    function setLoadCountdownStart(conversationId, loadCountdownStart) {
        return {
            type: 'SET_LOAD_COUNTDOWN_START',
            payload: {
                conversationId,
                loadCountdownStart,
            },
        };
    }
    function setIsNearBottom(conversationId, isNearBottom) {
        return {
            type: 'SET_NEAR_BOTTOM',
            payload: {
                conversationId,
                isNearBottom,
            },
        };
    }
    function setSelectedConversationPanelDepth(panelDepth) {
        return {
            type: 'SET_SELECTED_CONVERSATION_PANEL_DEPTH',
            payload: { panelDepth },
        };
    }
    function clearChangedMessages(conversationId) {
        return {
            type: 'CLEAR_CHANGED_MESSAGES',
            payload: {
                conversationId,
            },
        };
    }
    function clearSelectedMessage() {
        return {
            type: 'CLEAR_SELECTED_MESSAGE',
            payload: null,
        };
    }
    function clearUnreadMetrics(conversationId) {
        return {
            type: 'CLEAR_UNREAD_METRICS',
            payload: {
                conversationId,
            },
        };
    }
    function scrollToMessage(conversationId, messageId) {
        return {
            type: 'SCROLL_TO_MESSAGE',
            payload: {
                conversationId,
                messageId,
            },
        };
    }
    // Note: we need two actions here to simplify. Operations outside of the left pane can
    //   trigger an 'openConversation' so we go through Whisper.events for all
    //   conversation selection. Internal just triggers the Whisper.event, and External
    //   makes the changes to the store.
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
            messagesByConversation: {},
            messagesLookup: {},
            selectedMessageCounter: 0,
            showArchived: false,
            selectedConversationPanelDepth: 0,
        };
    }
    exports.getEmptyState = getEmptyState;
    function hasMessageHeightChanged(message, previous) {
        const messageAttachments = message.attachments || [];
        const previousAttachments = previous.attachments || [];
        const errorStatusChanged = (!message.errors && previous.errors) ||
            (message.errors && !previous.errors) ||
            (message.errors &&
                previous.errors &&
                message.errors.length !== previous.errors.length);
        if (errorStatusChanged) {
            return true;
        }
        const groupUpdateChanged = message.group_update !== previous.group_update;
        if (groupUpdateChanged) {
            return true;
        }
        const stickerPendingChanged = message.sticker &&
            message.sticker.data &&
            previous.sticker &&
            previous.sticker.data &&
            !previous.sticker.data.blurHash &&
            previous.sticker.data.pending !== message.sticker.data.pending;
        if (stickerPendingChanged) {
            return true;
        }
        const longMessageAttachmentLoaded = previous.bodyPending && !message.bodyPending;
        if (longMessageAttachmentLoaded) {
            return true;
        }
        const firstAttachmentNoLongerPending = previousAttachments[0] &&
            previousAttachments[0].pending &&
            messageAttachments[0] &&
            !messageAttachments[0].pending;
        if (firstAttachmentNoLongerPending) {
            return true;
        }
        const signalAccountChanged = Boolean(message.hasSignalAccount || previous.hasSignalAccount) &&
            message.hasSignalAccount !== previous.hasSignalAccount;
        if (signalAccountChanged) {
            return true;
        }
        const currentReactions = message.reactions || [];
        const lastReactions = previous.reactions || [];
        const reactionsChanged = (currentReactions.length === 0) !== (lastReactions.length === 0);
        if (reactionsChanged) {
            return true;
        }
        const isDeletedForEveryone = message.deletedForEveryone;
        const wasDeletedForEveryone = previous.deletedForEveryone;
        if (isDeletedForEveryone !== wasDeletedForEveryone) {
            return true;
        }
        return false;
    }
    function reducer(state = getEmptyState(), action) {
        if (action.type === 'CONVERSATION_ADDED') {
            const { payload } = action;
            const { id, data } = payload;
            const { conversationLookup } = state;
            return Object.assign(Object.assign({}, state), { conversationLookup: Object.assign(Object.assign({}, conversationLookup), { [id]: data }) });
        }
        if (action.type === 'CONVERSATION_CHANGED') {
            const { payload } = action;
            const { id, data } = payload;
            const { conversationLookup } = state;
            let { showArchived, selectedConversation } = state;
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
            return Object.assign(Object.assign({}, state), {
                selectedConversation,
                showArchived, conversationLookup: Object.assign(Object.assign({}, conversationLookup), { [id]: data })
            });
        }
        if (action.type === 'CONVERSATION_REMOVED') {
            const { payload } = action;
            const { id } = payload;
            const { conversationLookup } = state;
            return Object.assign(Object.assign({}, state), { conversationLookup: lodash_1.omit(conversationLookup, [id]) });
        }
        if (action.type === 'CONVERSATION_UNLOADED') {
            const { payload } = action;
            const { id } = payload;
            const existingConversation = state.messagesByConversation[id];
            if (!existingConversation) {
                return state;
            }
            const { messageIds } = existingConversation;
            const selectedConversation = state.selectedConversation !== id
                ? state.selectedConversation
                : undefined;
            return Object.assign(Object.assign({}, state), { selectedConversation, selectedConversationPanelDepth: 0, messagesLookup: lodash_1.omit(state.messagesLookup, messageIds), messagesByConversation: lodash_1.omit(state.messagesByConversation, [id]) });
        }
        if (action.type === 'CONVERSATIONS_REMOVE_ALL') {
            return getEmptyState();
        }
        if (action.type === 'SET_SELECTED_CONVERSATION_PANEL_DEPTH') {
            return Object.assign(Object.assign({}, state), { selectedConversationPanelDepth: action.payload.panelDepth });
        }
        if (action.type === 'MESSAGE_SELECTED') {
            const { messageId, conversationId } = action.payload;
            if (state.selectedConversation !== conversationId) {
                return state;
            }
            return Object.assign(Object.assign({}, state), { selectedMessage: messageId, selectedMessageCounter: state.selectedMessageCounter + 1 });
        }
        if (action.type === 'MESSAGE_CHANGED') {
            const { id, conversationId, data } = action.payload;
            const existingConversation = state.messagesByConversation[conversationId];
            // We don't keep track of messages unless their conversation is loaded...
            if (!existingConversation) {
                return state;
            }
            // ...and we've already loaded that message once
            const existingMessage = state.messagesLookup[id];
            if (!existingMessage) {
                return state;
            }
            // Check for changes which could affect height - that's why we need this
            //   heightChangeMessageIds field. It tells Timeline to recalculate all of its heights
            const hasHeightChanged = hasMessageHeightChanged(data, existingMessage);
            const { heightChangeMessageIds } = existingConversation;
            const updatedChanges = hasHeightChanged
                ? lodash_1.uniq([...heightChangeMessageIds, id])
                : heightChangeMessageIds;
            return Object.assign(Object.assign({}, state), { messagesLookup: Object.assign(Object.assign({}, state.messagesLookup), { [id]: data }), messagesByConversation: Object.assign(Object.assign({}, state.messagesByConversation), { [conversationId]: Object.assign(Object.assign({}, existingConversation), { heightChangeMessageIds: updatedChanges }) }) });
        }
        if (action.type === 'MESSAGE_SIZE_CHANGED') {
            const { id, conversationId } = action.payload;
            const existingConversation = getOwn_1.getOwn(state.messagesByConversation, conversationId);
            if (!existingConversation) {
                return state;
            }
            return Object.assign(Object.assign({}, state), {
                messagesByConversation: Object.assign(Object.assign({}, state.messagesByConversation), {
                    [conversationId]: Object.assign(Object.assign({}, existingConversation), {
                        heightChangeMessageIds: lodash_1.uniq([
                            ...existingConversation.heightChangeMessageIds,
                            id,
                        ])
                    })
                })
            });
        }
        if (action.type === 'MESSAGES_RESET') {
            const { conversationId, messages, metrics, scrollToMessageId, unboundedFetch, } = action.payload;
            const { messagesByConversation, messagesLookup } = state;
            const existingConversation = messagesByConversation[conversationId];
            const resetCounter = existingConversation
                ? existingConversation.resetCounter + 1
                : 0;
            const sorted = lodash_1.orderBy(messages, ['received_at', 'sent_at'], ['ASC', 'ASC']);
            const messageIds = sorted.map(message => message.id);
            const lookup = lodash_1.fromPairs(messages.map(message => [message.id, message]));
            let { newest, oldest } = metrics;
            // If our metrics are a little out of date, we'll fix them up
            if (messages.length > 0) {
                const first = messages[0];
                if (first && (!oldest || first.received_at <= oldest.received_at)) {
                    oldest = lodash_1.pick(first, ['id', 'received_at', 'sent_at']);
                }
                const last = messages[messages.length - 1];
                if (last &&
                    (!newest || unboundedFetch || last.received_at >= newest.received_at)) {
                    newest = lodash_1.pick(last, ['id', 'received_at', 'sent_at']);
                }
            }
            return Object.assign(Object.assign({}, state), {
                selectedMessage: scrollToMessageId, selectedMessageCounter: state.selectedMessageCounter + 1, messagesLookup: Object.assign(Object.assign({}, messagesLookup), lookup), messagesByConversation: Object.assign(Object.assign({}, messagesByConversation), {
                    [conversationId]: {
                        isLoadingMessages: false,
                        scrollToMessageId,
                        scrollToMessageCounter: existingConversation
                            ? existingConversation.scrollToMessageCounter + 1
                            : 0,
                        messageIds,
                        metrics: Object.assign(Object.assign({}, metrics), {
                            newest,
                            oldest
                        }),
                        resetCounter,
                        heightChangeMessageIds: [],
                    }
                })
            });
        }
        if (action.type === 'SET_MESSAGES_LOADING') {
            const { payload } = action;
            const { conversationId, isLoadingMessages } = payload;
            const { messagesByConversation } = state;
            const existingConversation = messagesByConversation[conversationId];
            if (!existingConversation) {
                return state;
            }
            return Object.assign(Object.assign({}, state), { messagesByConversation: Object.assign(Object.assign({}, messagesByConversation), { [conversationId]: Object.assign(Object.assign({}, existingConversation), { loadCountdownStart: undefined, isLoadingMessages }) }) });
        }
        if (action.type === 'SET_LOAD_COUNTDOWN_START') {
            const { payload } = action;
            const { conversationId, loadCountdownStart } = payload;
            const { messagesByConversation } = state;
            const existingConversation = messagesByConversation[conversationId];
            if (!existingConversation) {
                return state;
            }
            return Object.assign(Object.assign({}, state), { messagesByConversation: Object.assign(Object.assign({}, messagesByConversation), { [conversationId]: Object.assign(Object.assign({}, existingConversation), { loadCountdownStart }) }) });
        }
        if (action.type === 'SET_NEAR_BOTTOM') {
            const { payload } = action;
            const { conversationId, isNearBottom } = payload;
            const { messagesByConversation } = state;
            const existingConversation = messagesByConversation[conversationId];
            if (!existingConversation) {
                return state;
            }
            return Object.assign(Object.assign({}, state), { messagesByConversation: Object.assign(Object.assign({}, messagesByConversation), { [conversationId]: Object.assign(Object.assign({}, existingConversation), { isNearBottom }) }) });
        }
        if (action.type === 'SCROLL_TO_MESSAGE') {
            const { payload } = action;
            const { conversationId, messageId } = payload;
            const { messagesByConversation, messagesLookup } = state;
            const existingConversation = messagesByConversation[conversationId];
            if (!existingConversation) {
                return state;
            }
            if (!messagesLookup[messageId]) {
                return state;
            }
            if (!existingConversation.messageIds.includes(messageId)) {
                return state;
            }
            return Object.assign(Object.assign({}, state), { selectedMessage: messageId, selectedMessageCounter: state.selectedMessageCounter + 1, messagesByConversation: Object.assign(Object.assign({}, messagesByConversation), { [conversationId]: Object.assign(Object.assign({}, existingConversation), { isLoadingMessages: false, scrollToMessageId: messageId, scrollToMessageCounter: existingConversation.scrollToMessageCounter + 1 }) }) });
        }
        if (action.type === 'MESSAGE_DELETED') {
            const { id, conversationId } = action.payload;
            const { messagesByConversation, messagesLookup } = state;
            const existingConversation = messagesByConversation[conversationId];
            if (!existingConversation) {
                return state;
            }
            // Assuming that we always have contiguous groups of messages in memory, the removal
            //   of one message at one end of our message set be replaced with the message right
            //   next to it.
            const oldIds = existingConversation.messageIds;
            let { newest, oldest } = existingConversation.metrics;
            if (oldIds.length > 1) {
                const firstId = oldIds[0];
                const lastId = oldIds[oldIds.length - 1];
                if (oldest && oldest.id === firstId && firstId === id) {
                    const second = messagesLookup[oldIds[1]];
                    oldest = second
                        ? lodash_1.pick(second, ['id', 'received_at', 'sent_at'])
                        : undefined;
                }
                if (newest && newest.id === lastId && lastId === id) {
                    const penultimate = messagesLookup[oldIds[oldIds.length - 2]];
                    newest = penultimate
                        ? lodash_1.pick(penultimate, ['id', 'received_at', 'sent_at'])
                        : undefined;
                }
            }
            // Removing it from our caches
            const messageIds = lodash_1.without(existingConversation.messageIds, id);
            const heightChangeMessageIds = lodash_1.without(existingConversation.heightChangeMessageIds, id);
            let metrics;
            if (messageIds.length === 0) {
                metrics = {
                    totalUnread: 0,
                };
            }
            else {
                metrics = Object.assign(Object.assign({}, existingConversation.metrics), {
                    oldest,
                    newest
                });
            }
            return Object.assign(Object.assign({}, state), {
                messagesLookup: lodash_1.omit(messagesLookup, id), messagesByConversation: {
                    [conversationId]: Object.assign(Object.assign({}, existingConversation), {
                        messageIds,
                        heightChangeMessageIds,
                        metrics
                    }),
                }
            });
        }
        if (action.type === 'REPAIR_NEWEST_MESSAGE') {
            const { conversationId } = action.payload;
            const { messagesByConversation, messagesLookup } = state;
            const existingConversation = getOwn_1.getOwn(messagesByConversation, conversationId);
            if (!existingConversation) {
                return state;
            }
            const { messageIds } = existingConversation;
            const lastId = messageIds && messageIds.length
                ? messageIds[messageIds.length - 1]
                : undefined;
            const last = lastId ? getOwn_1.getOwn(messagesLookup, lastId) : undefined;
            const newest = last
                ? lodash_1.pick(last, ['id', 'received_at', 'sent_at'])
                : undefined;
            return Object.assign(Object.assign({}, state), { messagesByConversation: Object.assign(Object.assign({}, messagesByConversation), { [conversationId]: Object.assign(Object.assign({}, existingConversation), { metrics: Object.assign(Object.assign({}, existingConversation.metrics), { newest }) }) }) });
        }
        if (action.type === 'REPAIR_OLDEST_MESSAGE') {
            const { conversationId } = action.payload;
            const { messagesByConversation, messagesLookup } = state;
            const existingConversation = getOwn_1.getOwn(messagesByConversation, conversationId);
            if (!existingConversation) {
                return state;
            }
            const { messageIds } = existingConversation;
            const firstId = messageIds && messageIds.length ? messageIds[0] : undefined;
            const first = firstId ? getOwn_1.getOwn(messagesLookup, firstId) : undefined;
            const oldest = first
                ? lodash_1.pick(first, ['id', 'received_at', 'sent_at'])
                : undefined;
            return Object.assign(Object.assign({}, state), { messagesByConversation: Object.assign(Object.assign({}, messagesByConversation), { [conversationId]: Object.assign(Object.assign({}, existingConversation), { metrics: Object.assign(Object.assign({}, existingConversation.metrics), { oldest }) }) }) });
        }
        if (action.type === 'MESSAGES_ADDED') {
            const { conversationId, isActive, isNewMessage, messages } = action.payload;
            const { messagesByConversation, messagesLookup } = state;
            const existingConversation = messagesByConversation[conversationId];
            if (!existingConversation) {
                return state;
            }
            let { newest, oldest, oldestUnread, totalUnread, } = existingConversation.metrics;
            if (messages.length < 1) {
                return state;
            }
            const lookup = lodash_1.fromPairs(existingConversation.messageIds.map(id => [id, messagesLookup[id]]));
            messages.forEach(message => {
                lookup[message.id] = message;
            });
            const sorted = lodash_1.orderBy(lodash_1.values(lookup), ['received_at', 'sent_at'], ['ASC', 'ASC']);
            const messageIds = sorted.map(message => message.id);
            const first = sorted[0];
            const last = sorted[sorted.length - 1];
            if (!newest) {
                newest = lodash_1.pick(first, ['id', 'received_at', 'sent_at']);
            }
            if (!oldest) {
                oldest = lodash_1.pick(last, ['id', 'received_at', 'sent_at']);
            }
            const existingTotal = existingConversation.messageIds.length;
            if (isNewMessage && existingTotal > 0) {
                const lastMessageId = existingConversation.messageIds[existingTotal - 1];
                // If our messages in memory don't include the most recent messages, then we
                //   won't add new messages to our message list.
                const haveLatest = newest && newest.id === lastMessageId;
                if (!haveLatest) {
                    return state;
                }
            }
            // Update oldest and newest if we receive older/newer
            // messages (or duplicated timestamps!)
            if (first && oldest && first.received_at <= oldest.received_at) {
                oldest = lodash_1.pick(first, ['id', 'received_at', 'sent_at']);
            }
            if (last && newest && last.received_at >= newest.received_at) {
                newest = lodash_1.pick(last, ['id', 'received_at', 'sent_at']);
            }
            const newIds = messages.map(message => message.id);
            const newMessageIds = lodash_1.difference(newIds, existingConversation.messageIds);
            const { isNearBottom } = existingConversation;
            if ((!isNearBottom || !isActive) && !oldestUnread) {
                const oldestId = newMessageIds.find(messageId => {
                    const message = lookup[messageId];
                    return Boolean(message.unread);
                });
                if (oldestId) {
                    oldestUnread = lodash_1.pick(lookup[oldestId], [
                        'id',
                        'received_at',
                        'sent_at',
                    ]);
                }
            }
            if (oldestUnread) {
                const newUnread = newMessageIds.reduce((sum, messageId) => {
                    const message = lookup[messageId];
                    return sum + (message && message.unread ? 1 : 0);
                }, 0);
                totalUnread = (totalUnread || 0) + newUnread;
            }
            const changedIds = lodash_1.intersection(newIds, existingConversation.messageIds);
            const heightChangeMessageIds = lodash_1.uniq([
                ...changedIds,
                ...existingConversation.heightChangeMessageIds,
            ]);
            return Object.assign(Object.assign({}, state), {
                messagesLookup: Object.assign(Object.assign({}, messagesLookup), lookup), messagesByConversation: Object.assign(Object.assign({}, messagesByConversation), {
                    [conversationId]: Object.assign(Object.assign({}, existingConversation), {
                        isLoadingMessages: false, messageIds,
                        heightChangeMessageIds, scrollToMessageId: undefined, metrics: Object.assign(Object.assign({}, existingConversation.metrics), {
                            newest,
                            oldest,
                            totalUnread,
                            oldestUnread
                        })
                    })
                })
            });
        }
        if (action.type === 'CLEAR_SELECTED_MESSAGE') {
            return Object.assign(Object.assign({}, state), { selectedMessage: undefined });
        }
        if (action.type === 'CLEAR_CHANGED_MESSAGES') {
            const { payload } = action;
            const { conversationId } = payload;
            const existingConversation = state.messagesByConversation[conversationId];
            if (!existingConversation) {
                return state;
            }
            return Object.assign(Object.assign({}, state), { messagesByConversation: Object.assign(Object.assign({}, state.messagesByConversation), { [conversationId]: Object.assign(Object.assign({}, existingConversation), { heightChangeMessageIds: [] }) }) });
        }
        if (action.type === 'CLEAR_UNREAD_METRICS') {
            const { payload } = action;
            const { conversationId } = payload;
            const existingConversation = state.messagesByConversation[conversationId];
            if (!existingConversation) {
                return state;
            }
            return Object.assign(Object.assign({}, state), { messagesByConversation: Object.assign(Object.assign({}, state.messagesByConversation), { [conversationId]: Object.assign(Object.assign({}, existingConversation), { metrics: Object.assign(Object.assign({}, existingConversation.metrics), { oldestUnread: undefined, totalUnread: 0 }) }) }) });
        }
        if (action.type === 'SELECTED_CONVERSATION_CHANGED') {
            const { payload } = action;
            const { id } = payload;
            return Object.assign(Object.assign({}, state), { selectedConversation: id });
        }
        if (action.type === 'SHOW_INBOX') {
            return Object.assign(Object.assign({}, state), { showArchived: false });
        }
        if (action.type === 'SHOW_ARCHIVED_CONVERSATIONS') {
            return Object.assign(Object.assign({}, state), { showArchived: true });
        }
        return state;
    }
    exports.reducer = reducer;
});