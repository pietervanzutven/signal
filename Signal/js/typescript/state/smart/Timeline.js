(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.selectors = window.ts.state.selectors || {};
    const exports = window.ts.state.smart.Timeline = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const react_redux_1 = window.react_redux;
    const actions_1 = window.ts.state.actions;
    const Timeline_1 = window.ts.components.conversation.Timeline;
    const user_1 = window.ts.state.selectors.user;
    const conversations_1 = window.ts.state.selectors.conversations;
    const TimelineItem_1 = window.ts.state.smart.TimelineItem;
    // Workaround: A react component's required properties are filtering up through connect()
    //   https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31363
    const FilteredSmartTimelineItem = TimelineItem_1.SmartTimelineItem;
    const mapStateToProps = (state, props) => {
        const { id } = props;
        const conversationSelector = conversations_1.getConversationSelector(state);
        const conversation = conversationSelector(id);
        const items = [];
        return Object.assign({}, conversation, {
            items, i18n: user_1.getIntl(state), renderTimelineItem: (messageId) => {
                return react_1.default.createElement(FilteredSmartTimelineItem, { id: messageId });
            }
        });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartTimeline = smart(Timeline_1.Timeline);
})();