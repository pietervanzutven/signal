(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.smart = window.ts.state.smart || {};
    const exports = window.ts.state.smart.UpdateDialog = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = window.react_redux;
    const actions_1 = window.ts.state.actions;
    const UpdateDialog_1 = window.ts.components.UpdateDialog;
    const user_1 = window.ts.state.selectors.user;
    const network_1 = window.ts.state.selectors.network;
    const mapStateToProps = (state) => {
        return Object.assign(Object.assign({}, state.updates), { hasNetworkDialog: network_1.hasNetworkDialog(state), i18n: user_1.getIntl(state) });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartUpdateDialog = smart(UpdateDialog_1.UpdateDialog);
})();