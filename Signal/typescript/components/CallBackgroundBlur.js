require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    exports.CallBackgroundBlur = ({ avatarPath, children, color, }) => {
        return (react_1.default.createElement("div", {
            className: classnames_1.default('module-calling__background', {
                [`module-background-color__${color || 'default'}`]: !avatarPath,
            })
        },
            avatarPath && (react_1.default.createElement("div", {
                className: "module-calling__background--blur", style: {
                    backgroundImage: `url("${avatarPath}")`,
                }
            })),
            children));
    };
});