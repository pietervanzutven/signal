require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const react_popper_1 = require("react-popper");
    var TooltipPlacement;
    (function (TooltipPlacement) {
        TooltipPlacement["Top"] = "top";
        TooltipPlacement["Right"] = "right";
        TooltipPlacement["Bottom"] = "bottom";
        TooltipPlacement["Left"] = "left";
    })(TooltipPlacement = exports.TooltipPlacement || (exports.TooltipPlacement = {}));
    exports.Tooltip = ({ children, content, direction, sticky, }) => {
        const isSticky = Boolean(sticky);
        const [showTooltip, setShowTooltip] = react_1.default.useState(isSticky);
        return (react_1.default.createElement(react_popper_1.Manager, null,
            react_1.default.createElement(react_popper_1.Reference, null, ({ ref }) => (react_1.default.createElement("span", {
                onBlur: () => {
                    if (!isSticky) {
                        setShowTooltip(false);
                    }
                }, onFocus: () => {
                    if (!isSticky) {
                        setShowTooltip(true);
                    }
                }, onMouseEnter: () => {
                    if (!isSticky) {
                        setShowTooltip(true);
                    }
                }, onMouseLeave: () => {
                    if (!isSticky) {
                        setShowTooltip(false);
                    }
                }, ref: ref
            }, children))),
            react_1.default.createElement(react_popper_1.Popper, { placement: direction }, ({ arrowProps, placement, ref, style }) => showTooltip && (react_1.default.createElement("div", { className: "module-tooltip", ref: ref, style: style, "data-placement": placement },
                content,
                react_1.default.createElement("div", { className: "module-tooltip-arrow", ref: arrowProps.ref, style: arrowProps.style }))))));
    };
});