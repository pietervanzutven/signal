(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    const exports = window.ts.state.reducer = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const redux_1 = window.redux;
    const conversations_1 = window.ts.state.ducks.conversations;
    const items_1 = window.ts.state.ducks.items;
    const search_1 = window.ts.state.ducks.search;
    const stickers_1 = window.ts.state.ducks.stickers;
    const user_1 = window.ts.state.ducks.user;
    exports.reducers = {
        conversations: conversations_1.reducer,
        items: items_1.reducer,
        search: search_1.reducer,
        stickers: stickers_1.reducer,
        user: user_1.reducer,
    };
    // @ts-ignore: AnyAction breaks strong type checking inside reducers
    exports.reducer = redux_1.combineReducers(exports.reducers);
})();