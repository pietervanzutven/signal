require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const CallManager_1 = require("../../components/CallManager");
    const user_1 = require("../selectors/user");
    const CallingDeviceSelection_1 = require("./CallingDeviceSelection");
    // Workaround: A react component's required properties are filtering up through connect()
    //   https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31363
    const FilteredCallingDeviceSelection = CallingDeviceSelection_1.SmartCallingDeviceSelection;
    function renderDeviceSelection() {
        return react_1.default.createElement(FilteredCallingDeviceSelection, null);
    }
    const mapStateToProps = (state) => {
        return Object.assign(Object.assign({}, state.calling), { i18n: user_1.getIntl(state), renderDeviceSelection });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartCallManager = smart(CallManager_1.CallManager);
});