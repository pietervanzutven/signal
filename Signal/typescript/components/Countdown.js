(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.Countdown = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const CIRCUMFERENCE = 11.013 * 2 * Math.PI;
    class Countdown extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.looping = false;
            this.loop = () => {
                const { onComplete, duration, expiresAt } = this.props;
                if (!this.looping) {
                    return;
                }
                const ratio = getRatio(expiresAt, duration);
                this.setState({ ratio });
                if (ratio === 1) {
                    this.looping = false;
                    if (onComplete) {
                        onComplete();
                    }
                }
                else {
                    requestAnimationFrame(this.loop);
                }
            };
            const { duration, expiresAt } = this.props;
            const ratio = getRatio(expiresAt, duration);
            this.state = { ratio };
        }
        componentDidMount() {
            this.startLoop();
        }
        componentDidUpdate() {
            this.startLoop();
        }
        componentWillUnmount() {
            this.stopLoop();
        }
        startLoop() {
            if (this.looping) {
                return;
            }
            this.looping = true;
            requestAnimationFrame(this.loop);
        }
        stopLoop() {
            this.looping = false;
        }
        render() {
            const { ratio } = this.state;
            const strokeDashoffset = ratio * CIRCUMFERENCE;
            return (react_1.default.createElement("div", { className: "module-countdown" },
                react_1.default.createElement("svg", { viewBox: "0 0 24 24" },
                    react_1.default.createElement("path", {
                        d: "M12,1 A11,11,0,1,1,1,12,11.013,11.013,0,0,1,12,1Z", className: "module-countdown__back-path", style: {
                            strokeDasharray: `${CIRCUMFERENCE}, ${CIRCUMFERENCE}`,
                        }
                    }),
                    react_1.default.createElement("path", {
                        d: "M12,1 A11,11,0,1,1,1,12,11.013,11.013,0,0,1,12,1Z", className: "module-countdown__front-path", style: {
                            strokeDasharray: `${CIRCUMFERENCE}, ${CIRCUMFERENCE}`,
                            strokeDashoffset,
                        }
                    }))));
        }
    }
    exports.Countdown = Countdown;
    function getRatio(expiresAt, duration) {
        const start = expiresAt - duration;
        const end = expiresAt;
        const now = Date.now();
        const totalTime = end - start;
        const elapsed = now - start;
        return Math.min(Math.max(0, elapsed / totalTime), 1);
    }
})();