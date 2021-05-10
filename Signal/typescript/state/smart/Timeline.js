(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.selectors = window.ts.state.selectors || {};
    const exports = window.ts.state.smart.Timeline = {};

    var __rest = (this && this.__rest) || function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = require("lodash");
    const react_1 = __importDefault(require("react"));
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const Timeline_1 = require("../../components/conversation/Timeline");
    const user_1 = require("../selectors/user");
    const conversations_1 = require("../selectors/conversations");
    const TimelineItem_1 = require("./TimelineItem");
    const TypingBubble_1 = require("./TypingBubble");
    const LastSeenIndicator_1 = require("./LastSeenIndicator");
    const HeroRow_1 = require("./HeroRow");
    const TimelineLoadingRow_1 = require("./TimelineLoadingRow");
    const EmojiPicker_1 = require("./EmojiPicker");
    // Workaround: A react component's required properties are filtering up through connect()
    //   https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31363
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const FilteredSmartTimelineItem = TimelineItem_1.SmartTimelineItem;
    const FilteredSmartTypingBubble = TypingBubble_1.SmartTypingBubble;
    const FilteredSmartLastSeenIndicator = LastSeenIndicator_1.SmartLastSeenIndicator;
    const FilteredSmartHeroRow = HeroRow_1.SmartHeroRow;
    const FilteredSmartTimelineLoadingRow = TimelineLoadingRow_1.SmartTimelineLoadingRow;
    function renderItem(messageId, conversationId, actionProps) {
        return (react_1.default.createElement(FilteredSmartTimelineItem, Object.assign({}, actionProps, { conversationId: conversationId, id: messageId, renderEmojiPicker: renderEmojiPicker })));
    }
    function renderEmojiPicker({ ref, onPickEmoji, onClose, style, }) {
        return (react_1.default.createElement(EmojiPicker_1.SmartEmojiPicker, { ref: ref, onPickEmoji: onPickEmoji, onClose: onClose, style: style, disableSkinTones: true }));
    }
    function renderLastSeenIndicator(id) {
        return react_1.default.createElement(FilteredSmartLastSeenIndicator, { id: id });
    }
    function renderHeroRow(id, onHeightChange, updateSharedGroups) {
        return (react_1.default.createElement(FilteredSmartHeroRow, { id: id, onHeightChange: onHeightChange, updateSharedGroups: updateSharedGroups }));
    }
    function renderLoadingRow(id) {
        return react_1.default.createElement(FilteredSmartTimelineLoadingRow, { id: id });
    }
    function renderTypingBubble(id) {
        return react_1.default.createElement(FilteredSmartTypingBubble, { id: id });
    }
    const mapStateToProps = (state, props) => {
        const { id } = props, actions = __rest(props, ["id"]);
        const conversation = conversations_1.getConversationSelector(state)(id);
        const conversationMessages = conversations_1.getConversationMessagesSelector(state)(id);
        const selectedMessage = conversations_1.getSelectedMessage(state);
        return Object.assign(Object.assign(Object.assign(Object.assign({ id }, lodash_1.pick(conversation, ['unreadCount', 'typingContact'])), conversationMessages), {
            selectedMessageId: selectedMessage ? selectedMessage.id : undefined, i18n: user_1.getIntl(state), renderItem,
            renderLastSeenIndicator,
            renderHeroRow,
            renderLoadingRow,
            renderTypingBubble
        }), actions);
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exports.SmartTimeline = smart(Timeline_1.Timeline);
})();