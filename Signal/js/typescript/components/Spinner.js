(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.Spinner = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    class Spinner extends react_1.default.Component {
        render() {
            const { small, direction } = this.props;
            return (react_1.default.createElement("div", {
                className: classnames_1.default('module-spinner__container', direction ? `module-spinner__container--${direction}` : null, small ? 'module-spinner__container--small' : null, small && direction
                    ? `module-spinner__container--small-${direction}`
                    : null)
            },
                react_1.default.createElement("div", {
                    className: classnames_1.default('module-spinner__circle', direction ? `module-spinner__circle--${direction}` : null, small ? 'module-spinner__circle--small' : null, small && direction
                        ? `module-spinner__circle--small-${direction}`
                        : null)
                }),
                react_1.default.createElement("div", {
                    className: classnames_1.default('module-spinner__arc', direction ? `module-spinner__arc--${direction}` : null, small ? 'module-spinner__arc--small' : null, small && direction
                        ? `module-spinner__arc--small-${direction}`
                        : null)
                })));
        }
    }
    exports.Spinner = Spinner;
})();