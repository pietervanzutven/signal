(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.smart = window.ts.state.smart || {};
    const exports = window.ts.state.smart.NetworkStatus = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const NetworkStatus_1 = require("../../components/NetworkStatus");
    const user_1 = require("../selectors/user");
    const network_1 = require("../selectors/network");
    const mapStateToProps = (state) => {
        return Object.assign(Object.assign({}, state.network), { hasNetworkDialog: network_1.hasNetworkDialog(state), i18n: user_1.getIntl(state) });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartNetworkStatus = smart(NetworkStatus_1.NetworkStatus);
})();