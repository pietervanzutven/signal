(function () {
    "use strict";

    window.ts = window.ts || {};
    const exports = window.ts.html = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const link_text_1 = __importDefault(window.link_text);
    exports.linkText = (value) => link_text_1.default(value, { target: '_blank' });
    exports.replaceLineBreaks = (value) => value.replace(/\r?\n/g, '<br>');
    // NOTE: How can we use `lodash/fp` `compose` with type checking?
    exports.render = (value) => exports.replaceLineBreaks(exports.linkText(value));
})();