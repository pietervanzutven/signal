require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const ConversationHero_1 = require("../../components/conversation/ConversationHero");
    const user_1 = require("../selectors/user");
    const mapStateToProps = (state, props) => {
        const { id } = props;
        const conversation = state.conversations.conversationLookup[id];
        if (!conversation) {
            throw new Error(`Did not find conversation ${id} in state!`);
        }
        return Object.assign(Object.assign({ i18n: user_1.getIntl(state) }, conversation), { conversationType: conversation.type });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartHeroRow = smart(ConversationHero_1.ConversationHero);
});