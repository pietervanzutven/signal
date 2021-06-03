require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = require("react-redux");
    const lodash_1 = require("lodash");
    const ConversationHeader_1 = require("../../components/conversation/ConversationHeader");
    const conversations_1 = require("../selectors/conversations");
    const Calling_1 = require("../../types/Calling");
    const conversations_2 = require("../ducks/conversations");
    const calling_1 = require("../ducks/calling");
    const user_1 = require("../selectors/user");
    const getOwn_1 = require("../../util/getOwn");
    const missingCaseError_1 = require("../../util/missingCaseError");
    const getOutgoingCallButtonStyle = (conversation, state) => {
        const { calling } = state;
        if (calling_1.getActiveCall(calling)) {
            return ConversationHeader_1.OutgoingCallButtonStyle.None;
        }
        const conversationCallMode = conversations_2.getConversationCallMode(conversation);
        switch (conversationCallMode) {
            case Calling_1.CallMode.None:
                return ConversationHeader_1.OutgoingCallButtonStyle.None;
            case Calling_1.CallMode.Direct:
                return ConversationHeader_1.OutgoingCallButtonStyle.Both;
            case Calling_1.CallMode.Group: {
                if (!window.GROUP_CALLING) {
                    return ConversationHeader_1.OutgoingCallButtonStyle.None;
                }
                const call = getOwn_1.getOwn(calling.callsByConversation, conversation.id);
                if ((call === null || call === void 0 ? void 0 : call.callMode) === Calling_1.CallMode.Group &&
                    calling_1.isAnybodyElseInGroupCall(call.peekInfo, user_1.getUserConversationId(state))) {
                    return ConversationHeader_1.OutgoingCallButtonStyle.Join;
                }
                return ConversationHeader_1.OutgoingCallButtonStyle.JustVideo;
            }
            default:
                throw missingCaseError_1.missingCaseError(conversationCallMode);
        }
    };
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
        ])), { i18n: user_1.getIntl(state), showBackButton: state.conversations.selectedConversationPanelDepth > 0, outgoingCallButtonStyle: getOutgoingCallButtonStyle(conversation, state) });
    };
    const smart = react_redux_1.connect(mapStateToProps, {});
    exports.SmartConversationHeader = smart(ConversationHeader_1.ConversationHeader);
});