require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    exports.CallBackgroundBlur = ({ avatarPath, children, color, }) => {
        const backgroundProps = avatarPath
            ? {
                style: {
                    backgroundImage: `url("${avatarPath}")`,
                },
            }
            : {
                className: classnames_1.default('module-calling__background', `module-background-color__${color || 'default'}`),
            };
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", Object.assign({ className: "module-calling__background" }, backgroundProps)),
            react_1.default.createElement("div", { className: "module-calling__background--blur" }),
            children));
    };
});