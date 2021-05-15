require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const UpdateDialog_1 = require("../../components/UpdateDialog");
    const user_1 = require("../selectors/user");
    const network_1 = require("../selectors/network");
    const mapStateToProps = (state) => {
        return Object.assign(Object.assign({}, state.updates), { hasNetworkDialog: network_1.hasNetworkDialog(state), i18n: user_1.getIntl(state) });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartUpdateDialog = smart(UpdateDialog_1.UpdateDialog);
});