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
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
                t[p[i]] = s[p[i]];
        return t;
    };
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = window.lodash;
    const react_1 = __importDefault(window.react);
    const react_redux_1 = window.react_redux;
    const actions_1 = window.ts.state.actions;
    const Timeline_1 = window.ts.components.conversation.Timeline;
    const user_1 = window.ts.state.selectors.user;
    const conversations_1 = window.ts.state.selectors.conversations;
    const TimelineItem_1 = window.ts.state.smart.TimelineItem;
    const TypingBubble_1 = window.ts.state.smart.TypingBubble;
    const LastSeenIndicator_1 = window.ts.state.smart.LastSeenIndicator;
    const TimelineLoadingRow_1 = window.ts.state.smart.TimelineLoadingRow;
    // Workaround: A react component's required properties are filtering up through connect()
    //   https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31363
    const FilteredSmartTimelineItem = TimelineItem_1.SmartTimelineItem;
    const FilteredSmartTypingBubble = TypingBubble_1.SmartTypingBubble;
    const FilteredSmartLastSeenIndicator = LastSeenIndicator_1.SmartLastSeenIndicator;
    const FilteredSmartTimelineLoadingRow = TimelineLoadingRow_1.SmartTimelineLoadingRow;
    function renderItem(messageId, actionProps) {
        return react_1.default.createElement(FilteredSmartTimelineItem, Object.assign({}, actionProps, { id: messageId }));
    }
    function renderLastSeenIndicator(id) {
        return react_1.default.createElement(FilteredSmartLastSeenIndicator, { id: id });
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
        return Object.assign({ id }, lodash_1.pick(conversation, ['unreadCount', 'typingContact']), conversationMessages, {
            i18n: user_1.getIntl(state), renderItem,
            renderLastSeenIndicator,
            renderLoadingRow,
            renderTypingBubble
        }, actions);
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartTimeline = smart(Timeline_1.Timeline);
})();