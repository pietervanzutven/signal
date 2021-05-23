"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const classnames_1 = __importDefault(require("classnames"));
const react_tooltip_lite_1 = __importDefault(require("react-tooltip-lite"));
var TooltipDirection;
(function (TooltipDirection) {
    TooltipDirection["UP"] = "up";
    TooltipDirection["RIGHT"] = "right";
    TooltipDirection["DOWN"] = "down";
    TooltipDirection["LEFT"] = "left";
})(TooltipDirection = exports.TooltipDirection || (exports.TooltipDirection = {}));
var CallingButtonType;
(function (CallingButtonType) {
    CallingButtonType["AUDIO_DISABLED"] = "AUDIO_DISABLED";
    CallingButtonType["AUDIO_OFF"] = "AUDIO_OFF";
    CallingButtonType["AUDIO_ON"] = "AUDIO_ON";
    CallingButtonType["HANG_UP"] = "HANG_UP";
    CallingButtonType["VIDEO_DISABLED"] = "VIDEO_DISABLED";
    CallingButtonType["VIDEO_OFF"] = "VIDEO_OFF";
    CallingButtonType["VIDEO_ON"] = "VIDEO_ON";
})(CallingButtonType = exports.CallingButtonType || (exports.CallingButtonType = {}));
exports.CallingButton = ({ buttonType, i18n, onClick, tooltipDirection = TooltipDirection.DOWN, tooltipDistance = 16, }) => {
    let classNameSuffix = '';
    let tooltipContent = '';
    if (buttonType === CallingButtonType.AUDIO_DISABLED) {
        classNameSuffix = 'audio--disabled';
        tooltipContent = i18n('calling__button--audio-disabled');
    }
    else if (buttonType === CallingButtonType.AUDIO_OFF) {
        classNameSuffix = 'audio--off';
        tooltipContent = i18n('calling__button--audio-on');
    }
    else if (buttonType === CallingButtonType.AUDIO_ON) {
        classNameSuffix = 'audio--on';
        tooltipContent = i18n('calling__button--audio-off');
    }
    else if (buttonType === CallingButtonType.VIDEO_DISABLED) {
        classNameSuffix = 'video--disabled';
        tooltipContent = i18n('calling__button--video-disabled');
    }
    else if (buttonType === CallingButtonType.VIDEO_OFF) {
        classNameSuffix = 'video--off';
        tooltipContent = i18n('calling__button--video-on');
    }
    else if (buttonType === CallingButtonType.VIDEO_ON) {
        classNameSuffix = 'video--on';
        tooltipContent = i18n('calling__button--video-off');
    }
    else if (buttonType === CallingButtonType.HANG_UP) {
        classNameSuffix = 'hangup';
        tooltipContent = i18n('calling__hangup');
    }
    const className = classnames_1.default('module-calling-button__icon', `module-calling-button__icon--${classNameSuffix}`);
    return (react_1.default.createElement("button", { "aria-label": tooltipContent, type: "button", className: className, onClick: onClick },
        react_1.default.createElement(react_tooltip_lite_1.default, { arrowSize: 6, content: tooltipContent, direction: tooltipDirection, distance: tooltipDistance, hoverDelay: 0 },
            react_1.default.createElement("div", null))));
};
