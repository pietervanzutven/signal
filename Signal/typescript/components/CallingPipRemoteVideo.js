require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const Avatar_1 = require("./Avatar");
    const CallBackgroundBlur_1 = require("./CallBackgroundBlur");
    const DirectCallRemoteParticipant_1 = require("./DirectCallRemoteParticipant");
    const GroupCallRemoteParticipant_1 = require("./GroupCallRemoteParticipant");
    const Calling_1 = require("../types/Calling");
    exports.CallingPipRemoteVideo = ({ call, conversation, getGroupCallVideoFrameSource, i18n, setRendererCanvas, }) => {
        if (call.callMode === Calling_1.CallMode.Direct) {
            if (!call.hasRemoteVideo) {
                const { avatarPath, color, name, phoneNumber, profileName, title, } = conversation;
                return (react_1.default.createElement("div", { className: "module-calling-pip__video--remote" },
                    react_1.default.createElement(CallBackgroundBlur_1.CallBackgroundBlur, { avatarPath: avatarPath, color: color },
                        react_1.default.createElement("div", { className: "module-calling-pip__video--avatar" },
                            react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color || 'ultramarine', noteToSelf: false, conversationType: "direct", i18n: i18n, name: name, phoneNumber: phoneNumber, profileName: profileName, title: title, size: 52 })))));
            }
            return (react_1.default.createElement("div", { className: "module-calling-pip__video--remote" },
                react_1.default.createElement(DirectCallRemoteParticipant_1.DirectCallRemoteParticipant, { conversation: conversation, hasRemoteVideo: call.hasRemoteVideo, i18n: i18n, setRendererCanvas: setRendererCanvas })));
        }
        if (call.callMode === Calling_1.CallMode.Group) {
            const speaker = call.remoteParticipants[0];
            return (react_1.default.createElement("div", { className: "module-calling-pip__video--remote" },
                react_1.default.createElement(GroupCallRemoteParticipant_1.GroupCallRemoteParticipant, { isInPip: true, key: speaker.demuxId, demuxId: speaker.demuxId, getGroupCallVideoFrameSource: getGroupCallVideoFrameSource, hasRemoteAudio: speaker.hasRemoteAudio, hasRemoteVideo: speaker.hasRemoteVideo })));
        }
        throw new Error('CallingRemoteVideo: Unknown Call Mode');
    };
});