(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.selectors = window.ts.state.selectors || {};
    const exports = window.ts.state.selectors.registration = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const reselect_1 = window.reselect;
    const getItems = (state) => state.items;
    exports.isDone = reselect_1.createSelector(getItems, (state) => state.chromiumRegistrationDone === '');
    exports.everDone = reselect_1.createSelector(getItems, (state) => state.chromiumRegistrationDoneEver === '' ||
        state.chromiumRegistrationDone === '');
})();