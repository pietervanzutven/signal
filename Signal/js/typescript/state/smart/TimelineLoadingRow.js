(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.selectors = window.ts.state.selectors || {};
    const exports = window.ts.state.smart.TimelineLoadingRow = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = window.react_redux;
    const actions_1 = window.ts.state.actions;
    const lodash_1 = window.lodash;
    const TimelineLoadingRow_1 = window.ts.components.conversation.TimelineLoadingRow;
    const Timeline_1 = window.ts.components.conversation.Timeline;
    const user_1 = window.ts.state.selectors.user;
    const conversations_1 = window.ts.state.selectors.conversations;
    const mapStateToProps = (state, props) => {
        const { id } = props;
        const conversation = conversations_1.getConversationMessagesSelector(state)(id);
        if (!conversation) {
            throw new Error(`Did not find conversation ${id} in state!`);
        }
        const { isLoadingMessages, loadCountdownStart } = conversation;
        const loadingState = isLoadingMessages
            ? 'loading'
            : lodash_1.isNumber(loadCountdownStart)
                ? 'countdown'
                : 'idle';
        const duration = loadingState === 'countdown' ? Timeline_1.LOAD_COUNTDOWN : undefined;
        const expiresAt = loadingState === 'countdown' && loadCountdownStart
            ? loadCountdownStart + Timeline_1.LOAD_COUNTDOWN
            : undefined;
        return {
            state: loadingState,
            duration,
            expiresAt,
            i18n: user_1.getIntl(state),
        };
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartTimelineLoadingRow = smart(TimelineLoadingRow_1.TimelineLoadingRow);
})();