require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const RelinkDialog_1 = require("../../components/RelinkDialog");
    const user_1 = require("../selectors/user");
    const registration_1 = require("../../util/registration");
    const mapStateToProps = (state) => {
        return {
            i18n: user_1.getIntl(state),
            isRegistrationDone: registration_1.isDone(),
        };
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartRelinkDialog = smart(RelinkDialog_1.RelinkDialog);
});