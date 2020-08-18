(function () {
    "use strict";

    window.html = window.html || {};
    window.html.html = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(window.html.html, "__esModule", { value: true });
    const link_text_1 = __importDefault(window.link_text);
    window.html.html.linkText = (value) => link_text_1.default(value, { target: '_blank' });
    window.html.html.replaceLineBreaks = (value) => value.replace(/\r?\n/g, '<br>');
    // NOTE: How can we use `lodash/fp` `compose` with type checking?
    window.html.html.render = (value) => window.html.html.replaceLineBreaks(window.html.html.linkText(value));
})();