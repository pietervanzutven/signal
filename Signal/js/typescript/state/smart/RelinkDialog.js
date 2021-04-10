(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.smart = window.ts.state.smart || {};
    const exports = window.ts.state.smart.RelinkDialog = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = window.react_redux;
    const actions_1 = window.ts.state.actions;
    const RelinkDialog_1 = window.ts.components.RelinkDialog;
    const user_1 = window.ts.state.selectors.user;
    const registration_1 = window.ts.util.registration;
    const mapStateToProps = (state) => {
        return {
            i18n: user_1.getIntl(state),
            isRegistrationDone: registration_1.isDone(),
        };
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartRelinkDialog = smart(RelinkDialog_1.RelinkDialog);
})();