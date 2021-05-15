require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = require("lodash");
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const TimelineLoadingRow_1 = require("../../components/conversation/TimelineLoadingRow");
    const Timeline_1 = require("../../components/conversation/Timeline");
    const user_1 = require("../selectors/user");
    const conversations_1 = require("../selectors/conversations");
    const mapStateToProps = (state, props) => {
        const { id } = props;
        const conversation = conversations_1.getConversationMessagesSelector(state)(id);
        if (!conversation) {
            throw new Error(`Did not find conversation ${id} in state!`);
        }
        const { isLoadingMessages, loadCountdownStart } = conversation;
        let loadingState;
        if (isLoadingMessages) {
            loadingState = 'loading';
        }
        else if (lodash_1.isNumber(loadCountdownStart)) {
            loadingState = 'countdown';
        }
        else {
            loadingState = 'idle';
        }
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
});