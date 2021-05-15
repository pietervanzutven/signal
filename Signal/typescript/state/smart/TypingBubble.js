require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const TypingBubble_1 = require("../../components/conversation/TypingBubble");
    const user_1 = require("../selectors/user");
    const conversations_1 = require("../selectors/conversations");
    const mapStateToProps = (state, props) => {
        const { id } = props;
        const conversation = conversations_1.getConversationSelector(state)(id);
        if (!conversation) {
            throw new Error(`Did not find conversation ${id} in state!`);
        }
        return Object.assign(Object.assign({}, conversation.typingContact), { conversationType: conversation.type, i18n: user_1.getIntl(state) });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartTypingBubble = smart(TypingBubble_1.TypingBubble);
});