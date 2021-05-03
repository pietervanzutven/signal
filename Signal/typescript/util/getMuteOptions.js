require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const moment_1 = __importDefault(require("moment"));
    function getMuteOptions(i18n) {
        return [
            {
                name: i18n('muteHour'),
                value: moment_1.default.duration(1, 'hour').as('milliseconds'),
            },
            {
                name: i18n('muteDay'),
                value: moment_1.default.duration(1, 'day').as('milliseconds'),
            },
            {
                name: i18n('muteWeek'),
                value: moment_1.default.duration(1, 'week').as('milliseconds'),
            },
            {
                name: i18n('muteYear'),
                value: moment_1.default.duration(1, 'year').as('milliseconds'),
            },
        ];
    }
    exports.getMuteOptions = getMuteOptions;
});