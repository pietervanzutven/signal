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
    const Avatar_1 = require("./Avatar");
    exports.DirectCallRemoteParticipant = ({ conversation, hasRemoteVideo, i18n, setRendererCanvas, }) => {
        const remoteVideoRef = react_1.useRef(null);
        react_1.useEffect(() => {
            setRendererCanvas({ element: remoteVideoRef });
            return () => {
                setRendererCanvas({ element: undefined });
            };
        }, [setRendererCanvas]);
        return hasRemoteVideo ? (react_1.default.createElement("canvas", { className: "module-ongoing-call__remote-video-enabled", ref: remoteVideoRef })) : (renderAvatar(i18n, conversation));
    };
    function renderAvatar(i18n, { avatarPath, color, name, phoneNumber, profileName, title, }) {
        return (react_1.default.createElement("div", { className: "module-ongoing-call__remote-video-disabled" },
            react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color || 'ultramarine', noteToSelf: false, conversationType: "direct", i18n: i18n, name: name, phoneNumber: phoneNumber, profileName: profileName, title: title, size: 112 })));
    }
});