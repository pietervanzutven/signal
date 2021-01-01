(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    const exports = window.ts.state.actions = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const conversations_1 = window.ts.state.ducks.conversations;
    const emojis_1 = window.ts.state.ducks.emojis;
    const items_1 = window.ts.state.ducks.items;
    const search_1 = window.ts.state.ducks.search;
    const stickers_1 = window.ts.state.ducks.stickers;
    const user_1 = window.ts.state.ducks.user;
    exports.mapDispatchToProps = Object.assign({}, conversations_1.actions, emojis_1.actions, items_1.actions, search_1.actions, stickers_1.actions, user_1.actions);
})();