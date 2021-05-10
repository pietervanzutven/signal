(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.selectors = window.ts.state.selectors || {};
    const exports = window.ts.state.smart.TimelineItem = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const TimelineItem_1 = require("../../components/conversation/TimelineItem");
    const user_1 = require("../selectors/user");
    const conversations_1 = require("../selectors/conversations");
    const ContactName_1 = require("./ContactName");
    // Workaround: A react component's required properties are filtering up through connect()
    //   https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31363
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const FilteredSmartContactName = ContactName_1.SmartContactName;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    function renderContact(conversationId) {
        return react_1.default.createElement(FilteredSmartContactName, { conversationId: conversationId });
    }
    const mapStateToProps = (state, props) => {
        const { id, conversationId } = props;
        const messageSelector = conversations_1.getMessageSelector(state);
        const item = messageSelector(id);
        const selectedMessage = conversations_1.getSelectedMessage(state);
        const isSelected = Boolean(selectedMessage && id === selectedMessage.id);
        return {
            item,
            id,
            conversationId,
            isSelected,
            renderContact,
            i18n: user_1.getIntl(state),
        };
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartTimelineItem = smart(TimelineItem_1.TimelineItem);
})();