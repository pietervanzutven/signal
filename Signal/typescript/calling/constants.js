require(exports => {
    "use strict";
    // Copyright 2020-2021 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FRAME_BUFFER_SIZE = exports.MAX_FRAME_SIZE = exports.REQUESTED_VIDEO_FRAMERATE = exports.REQUESTED_VIDEO_HEIGHT = exports.REQUESTED_VIDEO_WIDTH = void 0;
    exports.REQUESTED_VIDEO_WIDTH = 640;
    exports.REQUESTED_VIDEO_HEIGHT = 480;
    exports.REQUESTED_VIDEO_FRAMERATE = 30;
    exports.MAX_FRAME_SIZE = 1920 * 1080;
    exports.FRAME_BUFFER_SIZE = exports.MAX_FRAME_SIZE * 4;
});