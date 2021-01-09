(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.selectors = window.ts.state.selectors || {};
    const exports = window.ts.state.smart.TypingBubble = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = window.react_redux;
    const actions_1 = window.ts.state.actions;
    const TypingBubble_1 = window.ts.components.conversation.TypingBubble;
    const user_1 = window.ts.state.selectors.user;
    const conversations_1 = window.ts.state.selectors.conversations;
    const mapStateToProps = (state, props) => {
        const { id } = props;
        const conversation = conversations_1.getConversationSelector(state)(id);
        if (!conversation) {
            throw new Error(`Did not find conversation ${id} in state!`);
        }
        return Object.assign({}, conversation.typingContact, { conversationType: conversation.type, i18n: user_1.getIntl(state) });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartTypingBubble = smart(TypingBubble_1.TypingBubble);
})();