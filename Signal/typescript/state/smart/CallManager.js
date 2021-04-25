require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const ringrtc_1 = require("ringrtc");
    const actions_1 = require("../actions");
    const CallManager_1 = require("../../components/CallManager");
    const user_1 = require("../selectors/user");
    const mapStateToProps = (state) => {
        return Object.assign(Object.assign({}, state.calling), { i18n: user_1.getIntl(state), getVideoCapturer: (localVideoRef) => new ringrtc_1.GumVideoCapturer(640, 480, 30, localVideoRef), getVideoRenderer: (remoteVideoRef) => new ringrtc_1.CanvasVideoRenderer(remoteVideoRef) });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartCallManager = smart(CallManager_1.CallManager);
});