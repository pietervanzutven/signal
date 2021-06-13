require(exports => {
    "use strict";
    // Copyright 2019-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    // Matching Whisper.Message API
    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    function getBubbleProps(attributes) {
        const model = new window.Whisper.Message(attributes);
        return model.getPropsForBubble();
    }
    exports.getBubbleProps = getBubbleProps;
    function showSettings() {
        window.showSettings();
    }
    exports.showSettings = showSettings;
});