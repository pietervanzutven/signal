require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const SafetyNumberViewer_1 = require("../../components/SafetyNumberViewer");
    const safetyNumber_1 = require("../selectors/safetyNumber");
    const conversations_1 = require("../selectors/conversations");
    const user_1 = require("../selectors/user");
    const mapStateToProps = (state, props) => {
        return Object.assign(Object.assign(Object.assign({}, props), safetyNumber_1.getContactSafetyNumber(state, props)), { contact: conversations_1.getConversationSelector(state)(props.contactID), i18n: user_1.getIntl(state) });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartSafetyNumberViewer = smart(SafetyNumberViewer_1.SafetyNumberViewer);
});