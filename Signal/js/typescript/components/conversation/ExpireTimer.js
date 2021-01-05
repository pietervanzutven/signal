(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.ExpireTimer = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const timer_1 = window.ts.util.timer;
    class ExpireTimer extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.interval = null;
        }
        componentDidMount() {
            const { expirationLength } = this.props;
            const increment = timer_1.getIncrement(expirationLength);
            const updateFrequency = Math.max(increment, 500);
            const update = () => {
                this.setState({
                    lastUpdated: Date.now(),
                });
            };
            this.interval = setInterval(update, updateFrequency);
        }
        componentWillUnmount() {
            if (this.interval) {
                clearInterval(this.interval);
            }
        }
        render() {
            const { direction, expirationLength, expirationTimestamp, withImageNoCaption, withSticker, withTapToViewExpired, } = this.props;
            const bucket = timer_1.getTimerBucket(expirationTimestamp, expirationLength);
            return (react_1.default.createElement("div", {
                className: classnames_1.default('module-expire-timer', `module-expire-timer--${bucket}`, direction ? `module-expire-timer--${direction}` : null, withTapToViewExpired
                    ? `module-expire-timer--${direction}-with-tap-to-view-expired`
                    : null, direction && withImageNoCaption
                    ? 'module-expire-timer--with-image-no-caption'
                    : null, withSticker ? 'module-expire-timer--with-sticker' : null)
            }));
        }
    }
    exports.ExpireTimer = ExpireTimer;
})();