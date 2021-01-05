(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.emoji = window.ts.components.emoji || {};
    const exports = window.ts.components.emoji.Emoji = {};

    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const lib_1 = window.ts.components.emoji.lib;
    exports.Emoji = React.memo(React.forwardRef(({ style = {}, size = 28, shortName, skinTone, inline, className }, ref) => {
        const image = lib_1.getImagePath(shortName, skinTone);
        return (React.createElement("div", { ref: ref, className: classnames_1.default('module-emoji', `module-emoji--${size}px`, inline ? 'module-emoji--inline' : null, className), style: style },
            React.createElement("img", { className: `module-emoji__image--${size}px`, src: image, alt: shortName })));
    }));
})();