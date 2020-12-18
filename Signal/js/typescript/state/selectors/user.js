(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.selectors = window.ts.state.selectors || {};
    const exports = window.ts.state.selectors.user = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const reselect_1 = window.reselect;
    exports.getUser = (state) => state.user;
    exports.getUserNumber = reselect_1.createSelector(exports.getUser, (state) => state.ourNumber);
    exports.getRegionCode = reselect_1.createSelector(exports.getUser, (state) => state.regionCode);
    exports.getIntl = reselect_1.createSelector(exports.getUser, (state) => state.i18n);
})();