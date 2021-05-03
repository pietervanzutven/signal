(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    const exports = window.ts.state.reducer = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const redux_1 = require("redux");
    const calling_1 = require("./ducks/calling");
    const conversations_1 = require("./ducks/conversations");
    const emojis_1 = require("./ducks/emojis");
    const expiration_1 = require("./ducks/expiration");
    const items_1 = require("./ducks/items");
    const network_1 = require("./ducks/network");
    const safetyNumber_1 = require("./ducks/safetyNumber");
    const search_1 = require("./ducks/search");
    const stickers_1 = require("./ducks/stickers");
    const updates_1 = require("./ducks/updates");
    const user_1 = require("./ducks/user");
    exports.reducers = {
        calling: calling_1.reducer,
        conversations: conversations_1.reducer,
        emojis: emojis_1.reducer,
        expiration: expiration_1.reducer,
        items: items_1.reducer,
        network: network_1.reducer,
        safetyNumber: safetyNumber_1.reducer,
        search: search_1.reducer,
        stickers: stickers_1.reducer,
        updates: updates_1.reducer,
        user: user_1.reducer,
    };
    // @ts-ignore: AnyAction breaks strong type checking inside reducers
    exports.reducer = redux_1.combineReducers(exports.reducers);
})();