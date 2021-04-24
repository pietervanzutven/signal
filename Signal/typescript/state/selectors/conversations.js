(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.selectors = window.ts.state.selectors || {};
    const exports = window.ts.state.selectors.conversations = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const memoizee_1 = __importDefault(window.memoizee);
    const lodash_1 = window.lodash;
    const reselect_1 = window.reselect;
    const PhoneNumber_1 = window.ts.types.PhoneNumber;
    const Whisper_1 = window.ts.shims.Whisper;
    const user_1 = window.ts.state.selectors.user;
    exports.getConversations = (state) => state.conversations;
    exports.getConversationLookup = reselect_1.createSelector(exports.getConversations, (state) => {
        return state.conversationLookup;
    });
    exports.getSelectedConversation = reselect_1.createSelector(exports.getConversations, (state) => {
        return state.selectedConversation;
    });
    exports.getSelectedMessage = reselect_1.createSelector(exports.getConversations, (state) => {
        if (!state.selectedMessage) {
            return;
        }
        return {
            id: state.selectedMessage,
            counter: state.selectedMessageCounter,
        };
    });
    exports.getShowArchived = reselect_1.createSelector(exports.getConversations, (state) => {
        return Boolean(state.showArchived);
    });
    exports.getMessages = reselect_1.createSelector(exports.getConversations, (state) => {
        return state.messagesLookup;
    });
    exports.getMessagesByConversation = reselect_1.createSelector(exports.getConversations, (state) => {
        return state.messagesByConversation;
    });
    function getConversationTitle(conversation, options) {
        if (conversation.name) {
            return conversation.name;
        }
        if (conversation.type === 'group') {
            const { i18n } = options;
            return i18n('unknownGroup');
        }
        return PhoneNumber_1.format(conversation.phoneNumber, options);
    }
    const collator = new Intl.Collator();
    exports._getConversationComparator = (i18n, ourRegionCode) => {
        return (left, right) => {
            const leftTimestamp = left.timestamp;
            const rightTimestamp = right.timestamp;
            if (leftTimestamp && !rightTimestamp) {
                return -1;
            }
            if (rightTimestamp && !leftTimestamp) {
                return 1;
            }
            if (leftTimestamp && rightTimestamp && leftTimestamp !== rightTimestamp) {
                return rightTimestamp - leftTimestamp;
            }
            if (typeof left.inboxPosition === 'number' &&
                typeof right.inboxPosition === 'number') {
                return right.inboxPosition > left.inboxPosition ? -1 : 1;
            }
            if (typeof left.inboxPosition === 'number' && right.inboxPosition == null) {
                return -1;
            }
            if (typeof right.inboxPosition === 'number' && left.inboxPosition == null) {
                return 1;
            }
            const leftTitle = getConversationTitle(left, {
                i18n,
                ourRegionCode,
            });
            const rightTitle = getConversationTitle(right, {
                i18n,
                ourRegionCode,
            });
            return collator.compare(leftTitle, rightTitle);
        };
    };
    exports.getConversationComparator = reselect_1.createSelector(user_1.getIntl, user_1.getRegionCode, exports._getConversationComparator);
    exports._getLeftPaneLists = (lookup, comparator, selectedConversation) => {
        const conversations = [];
        const archivedConversations = [];
        const values = Object.values(lookup);
        const max = values.length;
        for (let i = 0; i < max; i += 1) {
            let conversation = values[i];
            if (!conversation.activeAt) {
                continue;
            }
            if (selectedConversation === conversation.id) {
                conversation = Object.assign(Object.assign({}, conversation), { isSelected: true });
            }
            if (conversation.isArchived) {
                archivedConversations.push(conversation);
            }
            else {
                conversations.push(conversation);
            }
        }
        conversations.sort(comparator);
        archivedConversations.sort(comparator);
        return { conversations, archivedConversations };
    };
    exports.getLeftPaneLists = reselect_1.createSelector(exports.getConversationLookup, exports.getConversationComparator, exports.getSelectedConversation, exports._getLeftPaneLists);
    exports.getMe = reselect_1.createSelector([exports.getConversationLookup, user_1.getUserConversationId], (lookup, ourConversationId) => {
        return lookup[ourConversationId];
    });
    // This is where we will put Conversation selector logic, replicating what
    // is currently in models/conversation.getProps()
    // What needs to happen to pull that selector logic here?
    //   1) contactTypingTimers - that UI-only state needs to be moved to redux
    //   2) all of the message selectors need to be reselect-based; today those
    //      Backbone-based prop-generation functions expect to get Conversation information
    //      directly via ConversationController
    function _conversationSelector(conversation
        // regionCode: string,
        // userNumber: string
    ) {
        return conversation;
    }
    exports._conversationSelector = _conversationSelector;
    exports.getCachedSelectorForConversation = reselect_1.createSelector(user_1.getRegionCode, user_1.getUserNumber, () => {
        // Note: memoizee will check all parameters provided, and only run our selector
        //   if any of them have changed.
        return memoizee_1.default(_conversationSelector, { max: 2000 });
    });
    exports.getConversationSelector = reselect_1.createSelector(exports.getCachedSelectorForConversation, exports.getConversationLookup, (selector, lookup) => {
        return (id) => {
            const conversation = lookup[id];
            if (!conversation) {
                return;
            }
            return selector(conversation);
        };
    });
    // For now we use a shim, as selector logic is still happening in the Backbone Model.
    // What needs to happen to pull that selector logic here?
    //   1) translate ~500 lines of selector logic into TypeScript
    //   2) other places still rely on that prop-gen code - need to put these under Roots:
    //     - quote compose
    //     - message details
    function _messageSelector(message,
        // @ts-ignore
        ourNumber,
        // @ts-ignore
        regionCode, interactionMode,
        // @ts-ignore
        conversation,
        // @ts-ignore
        author,
        // @ts-ignore
        quoted, selectedMessageId, selectedMessageCounter) {
        // Note: We don't use all of those parameters here, but the shim we call does.
        //   We want to call this function again if any of those parameters change.
        const props = Whisper_1.getBubbleProps(message);
        if (selectedMessageId === message.id) {
            return Object.assign(Object.assign({}, props), { data: Object.assign(Object.assign({}, props.data), { interactionMode, isSelected: true, isSelectedCounter: selectedMessageCounter }) });
        }
        return Object.assign(Object.assign({}, props), { data: Object.assign(Object.assign({}, props.data), { interactionMode }) });
    }
    exports._messageSelector = _messageSelector;
    exports.getCachedSelectorForMessage = reselect_1.createSelector(user_1.getRegionCode, user_1.getUserNumber, () => {
        // Note: memoizee will check all parameters provided, and only run our selector
        //   if any of them have changed.
        return memoizee_1.default(_messageSelector, { max: 2000 });
    });
    exports.getMessageSelector = reselect_1.createSelector(exports.getCachedSelectorForMessage, exports.getMessages, exports.getSelectedMessage, exports.getConversationSelector, user_1.getRegionCode, user_1.getUserNumber, user_1.getInteractionMode, (messageSelector, messageLookup, selectedMessage, conversationSelector, regionCode, ourNumber, interactionMode) => {
        return (id) => {
            const message = messageLookup[id];
            if (!message) {
                return;
            }
            const { conversationId, source, type, quote } = message;
            const conversation = conversationSelector(conversationId);
            let author;
            let quoted;
            if (type === 'incoming') {
                author = conversationSelector(source);
            }
            else if (type === 'outgoing') {
                author = conversationSelector(ourNumber);
            }
            if (quote) {
                quoted = conversationSelector(quote.author);
            }
            return messageSelector(message, ourNumber, regionCode, interactionMode, conversation, author, quoted, selectedMessage ? selectedMessage.id : undefined, selectedMessage ? selectedMessage.counter : undefined);
        };
    });
    function _conversationMessagesSelector(conversation) {
        const { heightChangeMessageIds, isLoadingMessages, isNearBottom, loadCountdownStart, messageIds, metrics, resetCounter, scrollToMessageId, scrollToMessageCounter, } = conversation;
        const firstId = messageIds[0];
        const lastId = messageIds.length === 0 ? undefined : messageIds[messageIds.length - 1];
        const { oldestUnread } = metrics;
        const haveNewest = !metrics.newest || !lastId || lastId === metrics.newest.id;
        const haveOldest = !metrics.oldest || !firstId || firstId === metrics.oldest.id;
        const items = messageIds;
        const messageHeightChangeLookup = heightChangeMessageIds && heightChangeMessageIds.length
            ? lodash_1.fromPairs(heightChangeMessageIds.map(id => [id, true]))
            : null;
        const messageHeightChangeIndex = messageHeightChangeLookup
            ? messageIds.findIndex(id => messageHeightChangeLookup[id])
            : undefined;
        const oldestUnreadIndex = oldestUnread
            ? messageIds.findIndex(id => id === oldestUnread.id)
            : undefined;
        const scrollToIndex = scrollToMessageId
            ? messageIds.findIndex(id => id === scrollToMessageId)
            : undefined;
        const { totalUnread } = metrics;
        return {
            haveNewest,
            haveOldest,
            isLoadingMessages,
            loadCountdownStart,
            items,
            isNearBottom,
            messageHeightChangeIndex: lodash_1.isNumber(messageHeightChangeIndex) && messageHeightChangeIndex >= 0
                ? messageHeightChangeIndex
                : undefined,
            oldestUnreadIndex: lodash_1.isNumber(oldestUnreadIndex) && oldestUnreadIndex >= 0
                ? oldestUnreadIndex
                : undefined,
            resetCounter,
            scrollToIndex: lodash_1.isNumber(scrollToIndex) && scrollToIndex >= 0 ? scrollToIndex : undefined,
            scrollToIndexCounter: scrollToMessageCounter,
            totalUnread,
        };
    }
    exports._conversationMessagesSelector = _conversationMessagesSelector;
    exports.getCachedSelectorForConversationMessages = reselect_1.createSelector(user_1.getRegionCode, user_1.getUserNumber, () => {
        // Note: memoizee will check all parameters provided, and only run our selector
        //   if any of them have changed.
        return memoizee_1.default(_conversationMessagesSelector, { max: 50 });
    });
    exports.getConversationMessagesSelector = reselect_1.createSelector(exports.getCachedSelectorForConversationMessages, exports.getMessagesByConversation, (conversationMessagesSelector, messagesByConversation) => {
        return (id) => {
            const conversation = messagesByConversation[id];
            if (!conversation) {
                return;
            }
            return conversationMessagesSelector(conversation);
        };
    });
})();