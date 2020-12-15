(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.smart = window.ts.state.smart || {};
    const exports = window.ts.state.smart.MessageSearchResult = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = window.react_redux;
    const actions_1 = window.ts.state.actions;
    const MessageSearchResult_1 = window.ts.components.MessageSearchResult;
    function mapStateToProps(state, ourProps) {
        const { id } = ourProps;
        const lookup = state.search && state.search.messageLookup;
        if (!lookup) {
            return null;
        }
        return lookup[id];
    }
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartMessageSearchResult = smart(MessageSearchResult_1.MessageSearchResult);
})();