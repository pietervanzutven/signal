require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const uuid_1 = require("uuid");
    function getDefaultConversation(overrideProps) {
        if (window.STORYBOOK_ENV !== 'react') {
            throw new Error('getDefaultConversation is for storybook only');
        }
        return Object.assign({ id: 'guid-1', lastUpdated: Date.now(), markedUnread: Boolean(overrideProps.markedUnread), e164: '+1300555000', title: 'Alice', type: 'direct', uuid: uuid_1.v4() }, overrideProps);
    }
    exports.getDefaultConversation = getDefaultConversation;
});