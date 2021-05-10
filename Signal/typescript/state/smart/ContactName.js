require(exports => {
    "use strict";
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(require("react"));
    const react_redux_1 = require("react-redux");
    const ContactName_1 = require("../../components/conversation/ContactName");
    const user_1 = require("../selectors/user");
    const conversations_1 = require("../selectors/conversations");
    exports.SmartContactName = props => {
        const { conversationId } = props;
        const i18n = react_redux_1.useSelector(user_1.getIntl);
        const getConversation = react_redux_1.useSelector(conversations_1.getConversationSelector);
        const conversation = getConversation(conversationId);
        if (!conversation) {
            throw new Error(`Conversation id ${conversationId} not found!`);
        }
        return React.createElement(ContactName_1.ContactName, Object.assign({ i18n: i18n }, conversation));
    };
});