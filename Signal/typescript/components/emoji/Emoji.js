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
    const React = __importStar(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const lib_1 = require("./lib");
    exports.EmojiSizes = [16, 18, 20, 24, 28, 32, 48, 64, 66];
    exports.Emoji = React.memo(React.forwardRef(({ style = {}, size = 28, shortName, skinTone, emoji, inline, className, children, }, ref) => {
        let image = '';
        if (shortName) {
            image = lib_1.getImagePath(shortName, skinTone);
        }
        else if (emoji) {
            image = lib_1.emojiToImage(emoji) || '';
        }
        const backgroundStyle = inline
            ? { backgroundImage: `url('${image}')` }
            : {};
        return (React.createElement("span", { ref: ref, className: classnames_1.default('module-emoji', `module-emoji--${size}px`, inline ? `module-emoji--${size}px--inline` : null, className), style: Object.assign(Object.assign({}, style), backgroundStyle) }, inline ? (
            // When using this component as in a CompositionInput it is very
            // important that these children are the only elements to render
            children) : (React.createElement("img", { className: `module-emoji__image--${size}px`, src: image, alt: shortName }))));
    }));
})();