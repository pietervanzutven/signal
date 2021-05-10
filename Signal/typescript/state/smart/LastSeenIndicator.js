(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.smart = window.ts.state.smart || {};
    const exports = window.ts.state.smart.LastSeenIndicator = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const LastSeenIndicator_1 = require("../../components/conversation/LastSeenIndicator");
    const user_1 = require("../selectors/user");
    const conversations_1 = require("../selectors/conversations");
    const mapStateToProps = (state, props) => {
        const { id } = props;
        const conversation = conversations_1.getConversationMessagesSelector(state)(id);
        if (!conversation) {
            throw new Error(`Did not find conversation ${id} in state!`);
        }
        const { totalUnread } = conversation;
        return {
            count: totalUnread,
            i18n: user_1.getIntl(state),
        };
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartLastSeenIndicator = smart(LastSeenIndicator_1.LastSeenIndicator);
})();