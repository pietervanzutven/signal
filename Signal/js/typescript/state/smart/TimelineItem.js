(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.selectors = window.ts.state.selectors || {};
    const exports = window.ts.state.smart.TimelineItem = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = window.react_redux;
    const actions_1 = window.ts.state.actions;
    const TimelineItem_1 = window.ts.components.conversation.TimelineItem;
    const user_1 = window.ts.state.selectors.user;
    const conversations_1 = window.ts.state.selectors.conversations;
    const mapStateToProps = (state, props) => {
        const { id } = props;
        const messageSelector = conversations_1.getMessageSelector(state);
        return Object.assign({}, messageSelector(id), { i18n: user_1.getIntl(state) });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartTimelineItem = smart(TimelineItem_1.TimelineItem);
})();