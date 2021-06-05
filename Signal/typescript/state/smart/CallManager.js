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
    const lodash_1 = require("lodash");
    const actions_1 = require("../actions");
    const CallManager_1 = require("../../components/CallManager");
    const calling_1 = require("../../services/calling");
    const user_1 = require("../selectors/user");
    const conversations_1 = require("../selectors/conversations");
    const calling_2 = require("../ducks/calling");
    const calling_3 = require("../selectors/calling");
    const Calling_1 = require("../../types/Calling");
    const missingCaseError_1 = require("../../util/missingCaseError");
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
        const conversationSelectorByUuid = lodash_1.memoize(uuid => {
            const conversationId = window.ConversationController.ensureContactIds({
                uuid,
            });
            return conversationId ? conversationSelector(conversationId) : undefined;
        });
        const baseResult = {
            conversation,
            hasLocalAudio: activeCallState.hasLocalAudio,
            hasLocalVideo: activeCallState.hasLocalVideo,
            joinedAt: activeCallState.joinedAt,
            pip: activeCallState.pip,
            settingsDialogOpen: activeCallState.settingsDialogOpen,
            showParticipantsList: activeCallState.showParticipantsList,
        };
        switch (call.callMode) {
            case Calling_1.CallMode.Direct:
                return Object.assign(Object.assign({}, baseResult), {
                    callEndedReason: call.callEndedReason, callMode: Calling_1.CallMode.Direct, callState: call.callState, peekedParticipants: [], remoteParticipants: [
                        {
                            hasRemoteVideo: Boolean(call.hasRemoteVideo),
                        },
                    ]
                });
            case Calling_1.CallMode.Group: {
                const ourUuid = user_1.getUserUuid(state);
                const remoteParticipants = [];
                const peekedParticipants = [];
                for (let i = 0; i < call.remoteParticipants.length; i += 1) {
                    const remoteParticipant = call.remoteParticipants[i];
                    const remoteConversation = conversationSelectorByUuid(remoteParticipant.uuid);
                    if (!remoteConversation) {
                        window.log.error('Remote participant has no corresponding conversation');
                        continue;
                    }
                    remoteParticipants.push({
                        avatarPath: remoteConversation.avatarPath,
                        color: remoteConversation.color,
                        demuxId: remoteParticipant.demuxId,
                        firstName: remoteConversation.firstName,
                        hasRemoteAudio: remoteParticipant.hasRemoteAudio,
                        hasRemoteVideo: remoteParticipant.hasRemoteVideo,
                        isBlocked: Boolean(remoteConversation.isBlocked),
                        isSelf: remoteParticipant.uuid === ourUuid,
                        name: remoteConversation.name,
                        profileName: remoteConversation.profileName,
                        speakerTime: remoteParticipant.speakerTime,
                        title: remoteConversation.title,
                        uuid: remoteParticipant.uuid,
                        videoAspectRatio: remoteParticipant.videoAspectRatio,
                    });
                }
                for (let i = 0; i < call.peekInfo.uuids.length; i += 1) {
                    const peekedParticipantUuid = call.peekInfo.uuids[i];
                    const peekedConversation = conversationSelectorByUuid(peekedParticipantUuid);
                    if (!peekedConversation) {
                        window.log.error('Remote participant has no corresponding conversation');
                        continue;
                    }
                    peekedParticipants.push({
                        avatarPath: peekedConversation.avatarPath,
                        color: peekedConversation.color,
                        firstName: peekedConversation.firstName,
                        isSelf: peekedParticipantUuid === ourUuid,
                        name: peekedConversation.name,
                        profileName: peekedConversation.profileName,
                        title: peekedConversation.title,
                        uuid: peekedParticipantUuid,
                    });
                }
                return Object.assign(Object.assign({}, baseResult), {
                    callMode: Calling_1.CallMode.Group, connectionState: call.connectionState, deviceCount: call.peekInfo.deviceCount, joinState: call.joinState, maxDevices: call.peekInfo.maxDevices, peekedParticipants,
                    remoteParticipants
                });
            }
            default:
                throw missingCaseError_1.missingCaseError(call);
        }
    };
    const mapStateToIncomingCallProp = (state) => {
        const call = calling_3.getIncomingCall(state);
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
        me: Object.assign(Object.assign({}, conversations_1.getMe(state)), {
            // `getMe` returns a `ConversationType` which might not have a UUID, at least
            //   according to the type. This ensures one is set.
            uuid: user_1.getUserUuid(state)
        }),
        renderDeviceSelection,
    });
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartCallManager = smart(CallManager_1.CallManager);
});