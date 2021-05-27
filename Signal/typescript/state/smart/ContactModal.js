require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const ContactModal_1 = require("../../components/conversation/ContactModal");
    const user_1 = require("../selectors/user");
    const conversations_1 = require("../selectors/conversations");
    const mapStateToProps = (state, props) => {
        const { contactId, currentConversationId } = props;
        const currentConversation = conversations_1.getConversationSelector(state)(currentConversationId);
        const contact = conversations_1.getConversationSelector(state)(contactId);
        const isMember = contact && currentConversation && currentConversation.members
            ? currentConversation.members.includes(contact)
            : false;
        const areWeAdmin = currentConversation && currentConversation.areWeAdmin
            ? currentConversation.areWeAdmin
            : false;
        return Object.assign(Object.assign({}, props), {
            areWeAdmin,
            contact, i18n: user_1.getIntl(state), isMember
        });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartContactModal = smart(ContactModal_1.ContactModal);
});