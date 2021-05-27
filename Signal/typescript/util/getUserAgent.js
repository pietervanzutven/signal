require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const getOwn_1 = require("./getOwn");
    const PLATFORM_STRINGS = {
        win32: 'Windows',
        darwin: 'macOS',
        linux: 'Linux',
    };
    function getUserAgent(appVersion) {
        // `process.platform` could be missing if someone figures out how to compile Signal on
        //   an unsupported OS and forgets to update this file. We'd rather send nothing than
        //   crash.
        const platformString = getOwn_1.getOwn(PLATFORM_STRINGS, process.platform);
        const platformStringWithSpace = platformString ? ` ${platformString}` : '';
        return `Signal-Desktop/${appVersion}${platformStringWithSpace}`;
    }
    exports.getUserAgent = getUserAgent;
});