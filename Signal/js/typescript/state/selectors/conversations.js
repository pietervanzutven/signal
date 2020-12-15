(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.selectors = window.ts.state.selectors || {};
    const exports = window.ts.state.selectors.conversations = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = window.lodash;
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
    exports._getLeftPaneList = (lookup, comparator, selectedConversation) => {
        const values = Object.values(lookup);
        const filtered = lodash_1.compact(values.map(conversation => {
            if (!conversation.activeAt) {
                return null;
            }
            if (selectedConversation === conversation.id) {
                return Object.assign({}, conversation, { isSelected: true });
            }
            return conversation;
        }));
        return filtered.sort(comparator);
    };
    exports.getLeftPaneList = reselect_1.createSelector(exports.getConversationLookup, exports.getConversationComparator, exports.getSelectedConversation, exports._getLeftPaneList);
    exports.getMe = reselect_1.createSelector([exports.getConversationLookup, user_1.getUserNumber], (lookup, ourNumber) => {
        return lookup[ourNumber];
    });
})();