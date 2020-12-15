(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    const exports = window.ts.state.actions = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const redux_1 = window.redux;
    const search_1 = window.ts.state.ducks.search;
    const conversations_1 = window.ts.state.ducks.conversations;
    const user_1 = window.ts.state.ducks.user;
    const actions = Object.assign({}, search_1.actions, conversations_1.actions, user_1.actions);
    function mapDispatchToProps(dispatch) {
        return redux_1.bindActionCreators(actions, dispatch);
    }
    exports.mapDispatchToProps = mapDispatchToProps;
})();