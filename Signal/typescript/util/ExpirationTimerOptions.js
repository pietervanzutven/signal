require(exports => {
    "use strict";
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const Backbone = __importStar(require("backbone"));
    const moment = __importStar(require("moment"));
    const EXPIRATION_TIMES = [
        [0, 'seconds'],
        [5, 'seconds'],
        [10, 'seconds'],
        [30, 'seconds'],
        [1, 'minute'],
        [5, 'minutes'],
        [30, 'minutes'],
        [1, 'hour'],
        [6, 'hours'],
        [12, 'hours'],
        [1, 'day'],
        [1, 'week'],
    ];
    exports.TimerOption = Backbone.Model.extend({
        getName(i18n) {
            return (i18n(['timerOption', this.get('time'), this.get('unit')].join('_')) ||
                moment.duration(this.get('time'), this.get('unit')).humanize());
        },
        getAbbreviated(i18n) {
            return i18n(['timerOption', this.get('time'), this.get('unit'), 'abbreviated'].join('_'));
        },
    });
    exports.ExpirationTimerOptions = new (Backbone.Collection.extend({
        model: exports.TimerOption,
        getName(i18n, seconds = 0) {
            const o = this.findWhere({ seconds });
            if (o) {
                return o.getName(i18n);
            }
            return [seconds, 'seconds'].join(' ');
        },
        getAbbreviated(i18n, seconds = 0) {
            const o = this.findWhere({ seconds });
            if (o) {
                return o.getAbbreviated(i18n);
            }
            return [seconds, 's'].join('');
        },
    }))(EXPIRATION_TIMES.map(o => {
        const duration = moment.duration(o[0], o[1]); // 5, 'seconds'
        return {
            time: o[0],
            unit: o[1],
            seconds: duration.asSeconds(),
        };
    }));
});