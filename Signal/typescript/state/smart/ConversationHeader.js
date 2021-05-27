require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const lodash_1 = require("lodash");
    const ConversationHeader_1 = require("../../components/conversation/ConversationHeader");
    const conversations_1 = require("../selectors/conversations");
    const calling_1 = require("../selectors/calling");
    const user_1 = require("../selectors/user");
    const mapStateToProps = (state, ownProps) => {
        const conversation = conversations_1.getConversationSelector(state)(ownProps.id);
        if (!conversation) {
            throw new Error('Could not find conversation');
        }
        return Object.assign(Object.assign({}, lodash_1.pick(conversation, [
            'acceptedMessageRequest',
            'avatarPath',
            'canChangeTimer',
            'color',
            'expireTimer',
            'isArchived',
            'isMe',
            'isMissingMandatoryProfileSharing',
            'isPinned',
            'isVerified',
            'left',
            'markedUnread',
            'muteExpiresAt',
            'name',
            'phoneNumber',
            'profileName',
            'title',
            'type',
        ])), {
            i18n: user_1.getIntl(state), showBackButton: state.conversations.selectedConversationPanelDepth > 0, showCallButtons: conversation.type === 'direct' &&
                !conversation.isMe &&
                !calling_1.isCallActive(state.calling)
        });
    };
    const smart = react_redux_1.connect(mapStateToProps, {});
    exports.SmartConversationHeader = smart(ConversationHeader_1.ConversationHeader);
});