require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const moment_1 = __importDefault(require("moment"));
    // Only applies in the english locales, but it ensures that the format
    //   is what we want.
    function replaceSuffix(time) {
        return time.replace(/ PM$/, 'pm').replace(/ AM$/, 'am');
    }
    const getExtendedFormats = (i18n) => ({
        y: 'lll',
        M: `${i18n('timestampFormat_M') || 'MMM D'} LT`,
        d: 'ddd LT',
    });
    const getShortFormats = (i18n) => ({
        y: 'll',
        M: i18n('timestampFormat_M') || 'MMM D',
        d: 'ddd',
    });
    function isToday(timestamp) {
        const today = moment_1.default().format('ddd');
        const targetDay = moment_1.default(timestamp).format('ddd');
        return today === targetDay;
    }
    function isYear(timestamp) {
        const year = moment_1.default().format('YYYY');
        const targetYear = moment_1.default(timestamp).format('YYYY');
        return year === targetYear;
    }
    function formatRelativeTime(rawTimestamp, options) {
        const { extended, i18n } = options;
        const formats = extended ? getExtendedFormats(i18n) : getShortFormats(i18n);
        const timestamp = moment_1.default(rawTimestamp);
        const now = moment_1.default();
        const diff = moment_1.default.duration(now.diff(timestamp));
        if (diff.years() >= 1 || !isYear(timestamp)) {
            return replaceSuffix(timestamp.format(formats.y));
        }
        if (diff.months() >= 1 || diff.days() > 6) {
            return replaceSuffix(timestamp.format(formats.M));
        }
        if (diff.days() >= 1 || !isToday(timestamp)) {
            return replaceSuffix(timestamp.format(formats.d));
        }
        if (diff.hours() >= 1) {
            return i18n('hoursAgo', [String(diff.hours())]);
        }
        if (diff.minutes() >= 1) {
            return i18n('minutesAgo', [String(diff.minutes())]);
        }
        return i18n('justNow');
    }
    exports.formatRelativeTime = formatRelativeTime;
});