(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.smart = window.ts.state.smart || {};
    const exports = window.ts.state.smart.NetworkStatus = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = window.react_redux;
    const actions_1 = window.ts.state.actions;
    const NetworkStatus_1 = window.ts.components.NetworkStatus;
    const user_1 = window.ts.state.selectors.user;
    const network_1 = window.ts.state.selectors.network;
    const registration_1 = window.ts.util.registration;
    const mapStateToProps = (state) => {
        return Object.assign(Object.assign({}, state.network), { hasNetworkDialog: network_1.hasNetworkDialog(state), i18n: user_1.getIntl(state), isRegistrationDone: registration_1.isDone() });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartNetworkStatus = smart(NetworkStatus_1.NetworkStatus);
})();