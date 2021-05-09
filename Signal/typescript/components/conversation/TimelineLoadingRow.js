(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.TimelineLoadingRow = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const lodash_1 = require("lodash");
    const Countdown_1 = require("../Countdown");
    const Spinner_1 = require("../Spinner");
    const FAKE_DURATION = 1000;
    class TimelineLoadingRow extends react_1.default.PureComponent {
        renderContents() {
            const { state, duration, expiresAt, onComplete } = this.props;
            if (state === 'idle') {
                const fakeExpiresAt = Date.now() - FAKE_DURATION;
                return react_1.default.createElement(Countdown_1.Countdown, { duration: FAKE_DURATION, expiresAt: fakeExpiresAt });
            }
            if (state === 'countdown' && lodash_1.isNumber(duration) && lodash_1.isNumber(expiresAt)) {
                return (react_1.default.createElement(Countdown_1.Countdown, { duration: duration, expiresAt: expiresAt, onComplete: onComplete }));
            }
            return react_1.default.createElement(Spinner_1.Spinner, { size: "24", svgSize: "small", direction: "on-background" });
        }
        render() {
            return (react_1.default.createElement("div", { className: "module-timeline-loading-row" }, this.renderContents()));
        }
    }
    exports.TimelineLoadingRow = TimelineLoadingRow;
})();