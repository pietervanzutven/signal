require(exports => {
    "use strict";
    // Copyright 2021 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useGetCallingFrameBuffer = void 0;
    const react_1 = require("react");
    const constants_1 = require("./constants");
    /**
     * A hook that returns a function. This function returns a "singleton" `ArrayBuffer` to be
     * used in call video rendering.
     *
     * This is most useful for group calls, where we can reuse the same frame buffer instead
     * of allocating one per participant. Be careful when using this buffer elsewhere, as it
     * is not cleaned up and may hold stale data.
     */
    function useGetCallingFrameBuffer() {
        const ref = react_1.useRef(null);
        return react_1.useCallback(() => {
            if (!ref.current) {
                ref.current = new ArrayBuffer(constants_1.FRAME_BUFFER_SIZE);
            }
            return ref.current;
        }, []);
    }
    exports.useGetCallingFrameBuffer = useGetCallingFrameBuffer;
});