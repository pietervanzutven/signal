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
            const { size, direction } = this.props;
            return (react_1.default.createElement("div", { className: classnames_1.default('module-spinner__container', `module-spinner__container--${size}`, direction ? `module-spinner__container--${direction}` : null, direction ? `module-spinner__container--${size}-${direction}` : null) },
                react_1.default.createElement("div", { className: classnames_1.default('module-spinner__circle', `module-spinner__circle--${size}`, direction ? `module-spinner__circle--${direction}` : null, direction ? `module-spinner__circle--${size}-${direction}` : null) }),
                react_1.default.createElement("div", { className: classnames_1.default('module-spinner__arc', `module-spinner__arc--${size}`, direction ? `module-spinner__arc--${direction}` : null, direction ? `module-spinner__arc--${size}-${direction}` : null) })));
        }
    }
    exports.Spinner = Spinner;
})();