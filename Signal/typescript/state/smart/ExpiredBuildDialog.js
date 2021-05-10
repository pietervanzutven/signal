(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.smart = window.ts.state.smart || {};
    const exports = window.ts.state.smart.ExpiredBuildDialog = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const ExpiredBuildDialog_1 = require("../../components/ExpiredBuildDialog");
    const user_1 = require("../selectors/user");
    const mapStateToProps = (state) => {
        return {
            hasExpired: state.expiration.hasExpired,
            i18n: user_1.getIntl(state),
        };
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartExpiredBuildDialog = smart(ExpiredBuildDialog_1.ExpiredBuildDialog);
})();