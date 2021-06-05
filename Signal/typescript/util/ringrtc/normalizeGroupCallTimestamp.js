require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Normalizes group call timestamps (`addedTime` and `speakerTime`) into numbers. We
     * expect RingRTC to send a string, but it sends a malformed number as of this writing,
     * RingRTC 2.8.3.
     *
     * We could probably safely do `Number(fromRingRtc)` and be done, but this is extra-
     * careful.
     */
    function normalizeGroupCallTimestamp(fromRingRtc) {
        let asNumber;
        switch (typeof fromRingRtc) {
            case 'number':
                asNumber = fromRingRtc;
                break;
            case 'string':
                asNumber = parseInt(fromRingRtc.slice(0, 15), 10);
                break;
            case 'bigint':
                asNumber = Number(fromRingRtc);
                break;
            default:
                return undefined;
        }
        if (Number.isNaN(asNumber) || asNumber <= 0) {
            return undefined;
        }
        return asNumber;
    }
    exports.normalizeGroupCallTimestamp = normalizeGroupCallTimestamp;
});