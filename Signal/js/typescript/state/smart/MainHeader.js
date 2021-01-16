(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.smart = window.ts.state.smart || {};
    const exports = window.ts.state.smart.MainHeader = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = window.react_redux;
    const actions_1 = window.ts.state.actions;
    const MainHeader_1 = window.ts.components.MainHeader;
    const search_1 = window.ts.state.selectors.search;
    const user_1 = window.ts.state.selectors.user;
    const conversations_1 = window.ts.state.selectors.conversations;
    const mapStateToProps = (state) => {
        return Object.assign({ searchTerm: search_1.getQuery(state), searchConversationId: search_1.getSearchConversationId(state), searchConversationName: search_1.getSearchConversationName(state), startSearchCounter: search_1.getStartSearchCounter(state), regionCode: user_1.getRegionCode(state), ourNumber: user_1.getUserNumber(state) }, conversations_1.getMe(state), { i18n: user_1.getIntl(state) });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartMainHeader = smart(MainHeader_1.MainHeader);
})();