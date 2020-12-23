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
    const reselect_1 = window.reselect;
    const PhoneNumber_1 = window.ts.types.PhoneNumber;
    const user_1 = window.ts.state.selectors.user;
    exports.getConversations = (state) => state.conversations;
    exports.getConversationLookup = reselect_1.createSelector(exports.getConversations, (state) => {
        return state.conversationLookup;
    });
    exports.getSelectedConversation = reselect_1.createSelector(exports.getConversations, (state) => {
        return state.selectedConversation;
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
            const leftTitle = getConversationTitle(left, {
                i18n,
                ourRegionCode,
            }).toLowerCase();
            const rightTitle = getConversationTitle(right, {
                i18n,
                ourRegionCode,
            }).toLowerCase();
            return collator.compare(leftTitle, rightTitle);
        };
    };
    exports.getConversationComparator = reselect_1.createSelector(user_1.getIntl, user_1.getRegionCode, exports._getConversationComparator);
    exports._getLeftPaneLists = (lookup, comparator, selectedConversation) => {
        const values = Object.values(lookup);
        const sorted = values.sort(comparator);
        const conversations = [];
        const archivedConversations = [];
        const max = sorted.length;
        for (let i = 0; i < max; i += 1) {
            let conversation = sorted[i];
            if (!conversation.activeAt) {
                continue;
            }
            if (selectedConversation === conversation.id) {
                conversation = Object.assign({}, conversation, { isSelected: true });
            }
            if (conversation.isArchived) {
                archivedConversations.push(conversation);
            }
            else {
                conversations.push(conversation);
            }
        }
        return { conversations, archivedConversations };
    };
    exports.getLeftPaneLists = reselect_1.createSelector(exports.getConversationLookup, exports.getConversationComparator, exports.getSelectedConversation, exports._getLeftPaneLists);
    exports.getMe = reselect_1.createSelector([exports.getConversationLookup, user_1.getUserNumber], (lookup, ourNumber) => {
        return lookup[ourNumber];
    });
    // This is where we will put Conversation selector logic, replicating what
    //   is currently in models/conversation.getProps()
    //   Blockers:
    //     1) contactTypingTimers - that UI-only state needs to be moved to redux
    function _conversationSelector(conversation
        // regionCode: string,
        // userNumber: string
    ) {
        return conversation;
    }
    exports._conversationSelector = _conversationSelector;
    exports.getCachedSelectorForConversation = reselect_1.createSelector(user_1.getRegionCode, user_1.getUserNumber, () => {
        return memoizee_1.default(_conversationSelector, { max: 100 });
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
    // For now we pass through, as selector logic is still happening in the Backbone Model.
    //   Blockers:
    //     1) it's a lot of code to pull over - ~500 lines
    //     2) a couple places still rely on all that code - will need to move these to Roots:
    //       - quote compose
    //       - message details
    function _messageSelector(message
        // ourNumber: string,
        // regionCode: string,
        // conversation?: ConversationType,
        // sender?: ConversationType,
        // quoted?: ConversationType
    ) {
        return message;
    }
    exports._messageSelector = _messageSelector;
    exports.getCachedSelectorForMessage = reselect_1.createSelector(user_1.getRegionCode, user_1.getUserNumber, () => {
        return memoizee_1.default(_messageSelector, { max: 500 });
    });
    exports.getMessageSelector = reselect_1.createSelector(exports.getCachedSelectorForMessage, exports.getMessages, (selector, lookup) => {
        return (id) => {
            const message = lookup[id];
            if (!message) {
                return;
            }
            return selector(message);
        };
    });
})();