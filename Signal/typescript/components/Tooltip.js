require(exports => {
    "use strict";
    // Copyright 2020-2021 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const lodash_1 = require("lodash");
    const react_popper_1 = require("react-popper");
    const theme_1 = require("../util/theme");
    // React doesn't reliably fire `onMouseLeave` or `onMouseOut` events if wrapping a
    //   disabled button. This uses native browser events to avoid that.
    //
    // See <https://lecstor.com/react-disabled-button-onmouseleave/>.
    const TooltipEventWrapper = react_1.default.forwardRef(({ onHoverChanged, children }, ref) => {
        const wrapperRef = react_1.default.useRef(null);
        react_1.default.useEffect(() => {
            const wrapperEl = wrapperRef.current;
            if (!wrapperEl) {
                return lodash_1.noop;
            }
            const on = () => {
                onHoverChanged(true);
            };
            const off = () => {
                onHoverChanged(false);
            };
            wrapperEl.addEventListener('focus', on);
            wrapperEl.addEventListener('blur', off);
            wrapperEl.addEventListener('mouseenter', on);
            wrapperEl.addEventListener('mouseleave', off);
            return () => {
                wrapperEl.removeEventListener('focus', on);
                wrapperEl.removeEventListener('blur', off);
                wrapperEl.removeEventListener('mouseenter', on);
                wrapperEl.removeEventListener('mouseleave', off);
            };
        }, [onHoverChanged]);
        return (react_1.default.createElement("span", {
            // This is a forward ref that also needs a ref of its own, so we set both here.
            ref: el => {
                wrapperRef.current = el;
                // This is a simplified version of [what React does][0] to set a ref.
                // [0]: https://github.com/facebook/react/blob/29b7b775f2ecf878eaf605be959d959030598b07/packages/react-reconciler/src/ReactFiberCommitWork.js#L661-L677
                if (typeof ref === 'function') {
                    ref(el);
                }
                else if (ref) {
                    // I believe the types for `ref` are wrong in this case, as `ref.current` should
                    //   not be `readonly`. That's why we do this cast. See [the React source][1].
                    // [1]: https://github.com/facebook/react/blob/29b7b775f2ecf878eaf605be959d959030598b07/packages/shared/ReactTypes.js#L78-L80
                    // eslint-disable-next-line no-param-reassign
                    ref.current = el;
                }
            }
        }, children));
    });
    var TooltipPlacement;
    (function (TooltipPlacement) {
        TooltipPlacement["Top"] = "top";
        TooltipPlacement["Right"] = "right";
        TooltipPlacement["Bottom"] = "bottom";
        TooltipPlacement["Left"] = "left";
    })(TooltipPlacement = exports.TooltipPlacement || (exports.TooltipPlacement = {}));
    exports.Tooltip = ({ children, content, direction, sticky, theme, }) => {
        const [isHovering, setIsHovering] = react_1.default.useState(false);
        const showTooltip = isHovering || Boolean(sticky);
        const tooltipThemeClassName = theme
            ? `module-tooltip--${theme_1.themeClassName(theme)}`
            : undefined;
        return (react_1.default.createElement(react_popper_1.Manager, null,
            react_1.default.createElement(react_popper_1.Reference, null, ({ ref }) => (react_1.default.createElement(TooltipEventWrapper, { ref: ref, onHoverChanged: setIsHovering }, children))),
            react_1.default.createElement(react_popper_1.Popper, { placement: direction }, ({ arrowProps, placement, ref, style }) => showTooltip && (react_1.default.createElement("div", { className: classnames_1.default('module-tooltip', tooltipThemeClassName), ref: ref, style: style, "data-placement": placement },
                content,
                react_1.default.createElement("div", { className: "module-tooltip-arrow", ref: arrowProps.ref, style: arrowProps.style }))))));
    };
});