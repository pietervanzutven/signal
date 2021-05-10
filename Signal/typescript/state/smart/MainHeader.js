(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.smart = window.ts.state.smart || {};
    const exports = window.ts.state.smart.MainHeader = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const MainHeader_1 = require("../../components/MainHeader");
    const search_1 = require("../selectors/search");
    const user_1 = require("../selectors/user");
    const conversations_1 = require("../selectors/conversations");
    const mapStateToProps = (state) => {
        return Object.assign(Object.assign({ searchTerm: search_1.getQuery(state), searchConversationId: search_1.getSearchConversationId(state), searchConversationName: search_1.getSearchConversationName(state), startSearchCounter: search_1.getStartSearchCounter(state), regionCode: user_1.getRegionCode(state), ourConversationId: user_1.getUserConversationId(state), ourNumber: user_1.getUserNumber(state), ourUuid: user_1.getUserUuid(state) }, conversations_1.getMe(state)), { i18n: user_1.getIntl(state) });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartMainHeader = smart(MainHeader_1.MainHeader);
})();