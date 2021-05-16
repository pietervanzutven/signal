require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const MessageSearchResult_1 = require("../../components/MessageSearchResult");
    const user_1 = require("../selectors/user");
    const search_1 = require("../selectors/search");
    function mapStateToProps(state, ourProps) {
        const { id } = ourProps;
        const props = search_1.getMessageSearchResultSelector(state)(id);
        return Object.assign(Object.assign({}, props), { i18n: user_1.getIntl(state) });
    }
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartMessageSearchResult = smart(MessageSearchResult_1.MessageSearchResult);
});