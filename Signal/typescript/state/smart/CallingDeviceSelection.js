require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const CallingDeviceSelection_1 = require("../../components/CallingDeviceSelection");
    const user_1 = require("../selectors/user");
    const mapStateToProps = (state) => {
        const { availableMicrophones, availableSpeakers, selectedMicrophone, selectedSpeaker, availableCameras, selectedCamera, } = state.calling;
        return {
            availableCameras,
            availableMicrophones,
            availableSpeakers,
            i18n: user_1.getIntl(state),
            selectedCamera,
            selectedMicrophone,
            selectedSpeaker,
        };
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartCallingDeviceSelection = smart(CallingDeviceSelection_1.CallingDeviceSelection);
});