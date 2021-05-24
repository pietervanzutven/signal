require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const CallManager_1 = require("../../components/CallManager");
    const conversations_1 = require("../selectors/conversations");
    const user_1 = require("../selectors/user");
    const CallingDeviceSelection_1 = require("./CallingDeviceSelection");
    function renderDeviceSelection() {
        return react_1.default.createElement(CallingDeviceSelection_1.SmartCallingDeviceSelection, null);
    }
    const mapStateToProps = (state) => {
        const { calling } = state;
        return Object.assign(Object.assign({}, calling), { i18n: user_1.getIntl(state), me: conversations_1.getMe(state), renderDeviceSelection });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartCallManager = smart(CallManager_1.CallManager);
});