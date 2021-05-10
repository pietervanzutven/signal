(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.Timestamp = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const moment_1 = __importDefault(require("moment"));
    const formatRelativeTime_1 = require("../../util/formatRelativeTime");
    const UPDATE_FREQUENCY = 60 * 1000;
    class Timestamp extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.interval = null;
        }
        componentDidMount() {
            const update = () => {
                this.setState({
                    // Used to trigger renders
                    // eslint-disable-next-line react/no-unused-state
                    lastUpdated: Date.now(),
                });
            };
            this.interval = setInterval(update, UPDATE_FREQUENCY);
        }
        componentWillUnmount() {
            if (this.interval) {
                clearInterval(this.interval);
            }
        }
        render() {
            const { direction, i18n, module, timestamp, withImageNoCaption, withSticker, withTapToViewExpired, withUnread, extended, } = this.props;
            const moduleName = module || 'module-timestamp';
            if (timestamp === null || timestamp === undefined) {
                return null;
            }
            return (react_1.default.createElement("span", {
                className: classnames_1.default(moduleName, direction ? `${moduleName}--${direction}` : null, withTapToViewExpired && direction
                    ? `${moduleName}--${direction}-with-tap-to-view-expired`
                    : null, withImageNoCaption ? `${moduleName}--with-image-no-caption` : null, withSticker ? `${moduleName}--with-sticker` : null, withUnread ? `${moduleName}--with-unread` : null), title: moment_1.default(timestamp).format('llll')
            }, formatRelativeTime_1.formatRelativeTime(timestamp, { i18n, extended })));
        }
    }
    exports.Timestamp = Timestamp;
})();