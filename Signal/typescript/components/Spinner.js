(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.Spinner = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    exports.SpinnerSvgSizes = ['small', 'normal'];
    exports.SpinnerDirections = [
        'outgoing',
        'incoming',
        'on-background',
    ];
    exports.Spinner = ({ size, svgSize, direction }) => (react_1.default.createElement("div", {
        className: classnames_1.default('module-spinner__container', `module-spinner__container--${svgSize}`, direction ? `module-spinner__container--${direction}` : null, direction ? `module-spinner__container--${svgSize}-${direction}` : null), style: {
            height: size,
            width: size,
        }
    },
        react_1.default.createElement("div", { className: classnames_1.default('module-spinner__circle', `module-spinner__circle--${svgSize}`, direction ? `module-spinner__circle--${direction}` : null, direction ? `module-spinner__circle--${svgSize}-${direction}` : null) }),
        react_1.default.createElement("div", { className: classnames_1.default('module-spinner__arc', `module-spinner__arc--${svgSize}`, direction ? `module-spinner__arc--${direction}` : null, direction ? `module-spinner__arc--${svgSize}-${direction}` : null) })));
})();