require(exports => {
    "use strict";
    // Copyright 2019-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
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
    // the DOM structure of this Emoji should match the other emoji implementations:
    // ts/components/conversation/Emojify.tsx
    // ts/quill/emoji/blot.tsx
    exports.Emoji = React.memo(React.forwardRef(({ style = {}, size = 28, shortName, skinTone, emoji, className }, ref) => {
        let image = '';
        if (shortName) {
            image = lib_1.getImagePath(shortName, skinTone);
        }
        else if (emoji) {
            image = lib_1.emojiToImage(emoji) || '';
        }
        return (React.createElement("span", { ref: ref, className: classnames_1.default('module-emoji', `module-emoji--${size}px`, className), style: style },
            React.createElement("img", { className: `module-emoji__image--${size}px`, src: image, "aria-label": emoji, title: emoji })));
    }));
});