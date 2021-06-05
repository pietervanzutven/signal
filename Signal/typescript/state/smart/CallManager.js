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
    const calling_1 = require("../../services/calling");
    const conversations_1 = require("../selectors/conversations");
    const calling_2 = require("../ducks/calling");
    const calling_3 = require("../selectors/calling");
    const Calling_1 = require("../../types/Calling");
    const user_1 = require("../selectors/user");
    const CallingDeviceSelection_1 = require("./CallingDeviceSelection");
    function renderDeviceSelection() {
        return react_1.default.createElement(CallingDeviceSelection_1.SmartCallingDeviceSelection, null);
    }
    const getGroupCallVideoFrameSource = calling_1.calling.getGroupCallVideoFrameSource.bind(calling_1.calling);
    const mapStateToActiveCallProp = (state) => {
        const { calling } = state;
        const { activeCallState } = calling;
        if (!activeCallState) {
            return undefined;
        }
        const call = calling_2.getActiveCall(calling);
        if (!call) {
            window.log.error('There was an active call state but no corresponding call');
            return undefined;
        }
        const conversationSelector = conversations_1.getConversationSelector(state);
        const conversation = conversationSelector(activeCallState.conversationId);
        if (!conversation) {
            window.log.error('The active call has no corresponding conversation');
            return undefined;
        }
        // TODO: The way we deal with remote participants isn't ideal. See DESKTOP-949.
        let isCallFull = false;
        const groupCallPeekedParticipants = [];
        const groupCallParticipants = [];
        if (call.callMode === Calling_1.CallMode.Group) {
            isCallFull = call.peekInfo.deviceCount >= call.peekInfo.maxDevices;
            call.peekInfo.conversationIds.forEach((conversationId) => {
                const peekedConversation = conversationSelector(conversationId);
                if (!peekedConversation) {
                    window.log.error('Peeked participant has no corresponding conversation');
                    return;
                }
                groupCallPeekedParticipants.push({
                    avatarPath: peekedConversation.avatarPath,
                    color: peekedConversation.color,
                    firstName: peekedConversation.firstName,
                    isSelf: conversationId === state.user.ourConversationId,
                    name: peekedConversation.name,
                    profileName: peekedConversation.profileName,
                    title: peekedConversation.title,
                });
            });
            call.remoteParticipants.forEach((remoteParticipant) => {
                const remoteConversation = conversationSelector(remoteParticipant.conversationId);
                if (!remoteConversation) {
                    window.log.error('Remote participant has no corresponding conversation');
                    return;
                }
                groupCallParticipants.push({
                    avatarPath: remoteConversation.avatarPath,
                    color: remoteConversation.color,
                    demuxId: remoteParticipant.demuxId,
                    firstName: remoteConversation.firstName,
                    hasRemoteAudio: remoteParticipant.hasRemoteAudio,
                    hasRemoteVideo: remoteParticipant.hasRemoteVideo,
                    isBlocked: Boolean(remoteConversation.isBlocked),
                    isSelf: remoteParticipant.isSelf,
                    name: remoteConversation.name,
                    profileName: remoteConversation.profileName,
                    speakerTime: remoteParticipant.speakerTime,
                    title: remoteConversation.title,
                    videoAspectRatio: remoteParticipant.videoAspectRatio,
                });
            });
            groupCallParticipants.sort((a, b) => a.title.localeCompare(b.title));
        }
        return {
            activeCallState,
            call,
            conversation,
            isCallFull,
            groupCallPeekedParticipants,
            groupCallParticipants,
        };
    };
    const mapStateToIncomingCallProp = (state) => {
        const call = calling_3.getIncomingCall(state.calling);
        if (!call) {
            return undefined;
        }
        const conversation = conversations_1.getConversationSelector(state)(call.conversationId);
        if (!conversation) {
            window.log.error('The incoming call has no corresponding conversation');
            return undefined;
        }
        return {
            call,
            conversation,
        };
    };
    const mapStateToProps = (state) => ({
        activeCall: mapStateToActiveCallProp(state),
        availableCameras: state.calling.availableCameras,
        getGroupCallVideoFrameSource,
        i18n: user_1.getIntl(state),
        incomingCall: mapStateToIncomingCallProp(state),
        me: conversations_1.getMe(state),
        renderDeviceSelection,
    });
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartCallManager = smart(CallManager_1.CallManager);
});