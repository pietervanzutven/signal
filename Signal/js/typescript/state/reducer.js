(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    const exports = window.ts.state.reducer = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const redux_1 = window.redux;
    const search_1 = window.ts.state.ducks.search;
    const conversations_1 = window.ts.state.ducks.conversations;
    const user_1 = window.ts.state.ducks.user;
    exports.reducers = {
        search: search_1.reducer,
        conversations: conversations_1.reducer,
        user: user_1.reducer,
    };
    // Making this work would require that our reducer signature supported AnyAction, not
    //   our restricted actions
    // @ts-ignore
    exports.reducer = redux_1.combineReducers(exports.reducers);
})();