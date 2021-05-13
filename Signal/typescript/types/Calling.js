require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ringrtc_1 = require("ringrtc");
    exports.CallState = ringrtc_1.CallState;
    var CallingDeviceType;
    (function (CallingDeviceType) {
        CallingDeviceType[CallingDeviceType["CAMERA"] = 0] = "CAMERA";
        CallingDeviceType[CallingDeviceType["MICROPHONE"] = 1] = "MICROPHONE";
        CallingDeviceType[CallingDeviceType["SPEAKER"] = 2] = "SPEAKER";
    })(CallingDeviceType = exports.CallingDeviceType || (exports.CallingDeviceType = {}));
});