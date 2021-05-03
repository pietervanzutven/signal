(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    const exports = window.ts.state.actions = {};

    Object.defineProperty(exports, "__esModule", { value: true });
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
    exports.mapDispatchToProps = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, calling_1.actions), conversations_1.actions), emojis_1.actions), expiration_1.actions), items_1.actions), network_1.actions), safetyNumber_1.actions), search_1.actions), stickers_1.actions), updates_1.actions), user_1.actions);
})();