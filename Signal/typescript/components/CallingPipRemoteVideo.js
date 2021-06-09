require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importStar(require("react"));
    const lodash_1 = require("lodash");
    const Avatar_1 = require("./Avatar");
    const CallBackgroundBlur_1 = require("./CallBackgroundBlur");
    const DirectCallRemoteParticipant_1 = require("./DirectCallRemoteParticipant");
    const GroupCallRemoteParticipant_1 = require("./GroupCallRemoteParticipant");
    const Calling_1 = require("../types/Calling");
    const hooks_1 = require("../util/hooks");
    const nonRenderedRemoteParticipant_1 = require("../util/ringrtc/nonRenderedRemoteParticipant");
    // This value should be kept in sync with the hard-coded CSS height.
    const PIP_VIDEO_HEIGHT_PX = 120;
    const NoVideo = ({ activeCall, i18n, }) => {
        const { avatarPath, color, name, phoneNumber, profileName, title, } = activeCall.conversation;
        return (react_1.default.createElement("div", { className: "module-calling-pip__video--remote" },
            react_1.default.createElement(CallBackgroundBlur_1.CallBackgroundBlur, { avatarPath: avatarPath, color: color },
                react_1.default.createElement("div", { className: "module-calling-pip__video--avatar" },
                    react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color || 'ultramarine', noteToSelf: false, conversationType: "direct", i18n: i18n, name: name, phoneNumber: phoneNumber, profileName: profileName, title: title, size: 52 })))));
    };
    exports.CallingPipRemoteVideo = ({ activeCall, getGroupCallVideoFrameSource, i18n, setGroupCallVideoRequest, setRendererCanvas, }) => {
        const { conversation } = activeCall;
        const isPageVisible = hooks_1.usePageVisibility();
        const activeGroupCallSpeaker = react_1.useMemo(() => {
            if (activeCall.callMode !== Calling_1.CallMode.Group) {
                return undefined;
            }
            return lodash_1.maxBy(activeCall.remoteParticipants, participant => participant.speakerTime || -Infinity);
        }, [activeCall.callMode, activeCall.remoteParticipants]);
        react_1.useEffect(() => {
            if (activeCall.callMode !== Calling_1.CallMode.Group) {
                return;
            }
            if (isPageVisible) {
                setGroupCallVideoRequest(activeCall.remoteParticipants.map(participant => {
                    const isVisible = participant === activeGroupCallSpeaker &&
                        participant.hasRemoteVideo;
                    if (isVisible) {
                        return {
                            demuxId: participant.demuxId,
                            width: Math.floor(PIP_VIDEO_HEIGHT_PX * participant.videoAspectRatio),
                            height: PIP_VIDEO_HEIGHT_PX,
                        };
                    }
                    return nonRenderedRemoteParticipant_1.nonRenderedRemoteParticipant(participant);
                }));
            }
            else {
                setGroupCallVideoRequest(activeCall.remoteParticipants.map(nonRenderedRemoteParticipant_1.nonRenderedRemoteParticipant));
            }
        }, [
            activeCall.callMode,
            activeCall.remoteParticipants,
            activeGroupCallSpeaker,
            isPageVisible,
            setGroupCallVideoRequest,
        ]);
        if (activeCall.callMode === Calling_1.CallMode.Direct) {
            const { hasRemoteVideo } = activeCall.remoteParticipants[0];
            if (!hasRemoteVideo) {
                return react_1.default.createElement(NoVideo, { activeCall: activeCall, i18n: i18n });
            }
            return (react_1.default.createElement("div", { className: "module-calling-pip__video--remote" },
                react_1.default.createElement(DirectCallRemoteParticipant_1.DirectCallRemoteParticipant, { conversation: conversation, hasRemoteVideo: hasRemoteVideo, i18n: i18n, setRendererCanvas: setRendererCanvas })));
        }
        if (activeCall.callMode === Calling_1.CallMode.Group) {
            if (!activeGroupCallSpeaker) {
                return react_1.default.createElement(NoVideo, { activeCall: activeCall, i18n: i18n });
            }
            return (react_1.default.createElement("div", { className: "module-calling-pip__video--remote" },
                react_1.default.createElement(GroupCallRemoteParticipant_1.GroupCallRemoteParticipant, { getGroupCallVideoFrameSource: getGroupCallVideoFrameSource, i18n: i18n, isInPip: true, remoteParticipant: activeGroupCallSpeaker })));
        }
        throw new Error('CallingRemoteVideo: Unknown Call Mode');
    };
});