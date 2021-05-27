require(exports => {
    "use strict";
    // Copyright 2019-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    function noopAction() {
        return {
            type: 'NOOP',
            payload: null,
        };
    }
    exports.noopAction = noopAction;
});