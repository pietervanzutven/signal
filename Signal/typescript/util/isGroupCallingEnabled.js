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
    const version_1 = require("./version");
    const RemoteConfig = __importStar(require("../RemoteConfig"));
    // We can remove this function once group calling has been turned on for everyone.
    function isGroupCallingEnabled() {
        return (RemoteConfig.isEnabled('desktop.groupCalling') ||
            version_1.isBeta(window.getVersion()));
    }
    exports.isGroupCallingEnabled = isGroupCallingEnabled;
});