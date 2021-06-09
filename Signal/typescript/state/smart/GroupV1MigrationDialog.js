require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const GroupV1MigrationDialog_1 = require("../../components/GroupV1MigrationDialog");
    const conversations_1 = require("../selectors/conversations");
    const user_1 = require("../selectors/user");
    const mapStateToProps = (state, props) => {
        const getConversation = conversations_1.getConversationSelector(state);
        const { droppedMemberIds, invitedMemberIds } = props;
        const droppedMembers = droppedMemberIds
            .map(getConversation)
            .filter(Boolean);
        if (droppedMembers.length !== droppedMemberIds.length) {
            window.log.warn('smart/GroupV1MigrationDialog: droppedMembers length changed');
        }
        const invitedMembers = invitedMemberIds
            .map(getConversation)
            .filter(Boolean);
        if (invitedMembers.length !== invitedMemberIds.length) {
            window.log.warn('smart/GroupV1MigrationDialog: invitedMembers length changed');
        }
        return Object.assign(Object.assign({}, props), {
            droppedMembers,
            invitedMembers, i18n: user_1.getIntl(state)
        });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartGroupV1MigrationDialog = smart(GroupV1MigrationDialog_1.GroupV1MigrationDialog);
});