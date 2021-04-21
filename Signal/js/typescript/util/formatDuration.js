require(exports => {
    'use strict';

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const moment_1 = __importDefault(window.moment);
    const HOUR = 1000 * 60 * 60;
    function formatDuration(seconds) {
        const time = moment_1.default.utc(seconds * 1000);
        if (seconds > HOUR) {
            return time.format('H:mm:ss');
        }
        return time.format('m:ss');
    }
    exports.formatDuration = formatDuration;
});