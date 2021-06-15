require(exports => {
    "use strict";
    // Copyright 2018-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.About = void 0;
    const react_1 = __importDefault(require("react"));
    const Emojify_1 = require("./Emojify");
    const About = ({ text }) => {
        if (!text) {
            return null;
        }
        return (react_1.default.createElement("span", { className: "module-about__text", dir: "auto" },
            react_1.default.createElement(Emojify_1.Emojify, { text: text || '' })));
    };
    exports.About = About;
});