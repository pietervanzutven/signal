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
    const ringrtc_1 = require("ringrtc");
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
    const createCanvasVideoRenderer = () => new ringrtc_1.CanvasVideoRenderer();
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
        const groupCallParticipants = [];
        if (call && call.callMode === Calling_1.CallMode.Group) {
            call.remoteParticipants.forEach((remoteParticipant) => {
                const remoteConversation = conversationSelector(remoteParticipant.conversationId);
                if (!remoteConversation) {
                    window.log.error('Remote participant has no corresponding conversation');
                    return;
                }
                groupCallParticipants.push({
                    avatarPath: remoteConversation.avatarPath,
                    color: remoteConversation.color,
                    firstName: remoteConversation.firstName,
                    hasRemoteAudio: remoteParticipant.hasRemoteAudio,
                    hasRemoteVideo: remoteParticipant.hasRemoteVideo,
                    isSelf: remoteParticipant.isSelf,
                    profileName: remoteConversation.profileName,
                    title: remoteConversation.title,
                });
            });
        }
        return {
            activeCallState,
            call,
            conversation,
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
        createCanvasVideoRenderer,
        getGroupCallVideoFrameSource,
        i18n: user_1.getIntl(state),
        incomingCall: mapStateToIncomingCallProp(state),
        me: conversations_1.getMe(state),
        renderDeviceSelection,
    });
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartCallManager = smart(CallManager_1.CallManager);
});