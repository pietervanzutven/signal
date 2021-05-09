(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.Image = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const react_blurhash_1 = require("react-blurhash");
    const Spinner_1 = require("../Spinner");
    class Image extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.handleClick = (event) => {
                if (!this.canClick()) {
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
                const { onClick, attachment } = this.props;
                if (onClick) {
                    event.preventDefault();
                    event.stopPropagation();
                    onClick(attachment);
                }
            };
            this.handleKeyDown = (event) => {
                if (!this.canClick()) {
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
                const { onClick, attachment } = this.props;
                if (onClick && (event.key === 'Enter' || event.key === 'Space')) {
                    event.preventDefault();
                    event.stopPropagation();
                    onClick(attachment);
                }
            };
        }
        canClick() {
            const { onClick, attachment, url } = this.props;
            const { pending } = attachment || { pending: true };
            return Boolean(onClick && !pending && url);
        }
        render() {
            const { alt, attachment, blurHash, bottomOverlay, closeButton, curveBottomLeft, curveBottomRight, curveTopLeft, curveTopRight, darkOverlay, height = 0, i18n, noBackground, noBorder, onClickClose, onError, overlayText, playIconOverlay, smallCurveTopLeft, softCorners, tabIndex, url, width = 0, } = this.props;
            const { caption, pending } = attachment || { caption: null, pending: true };
            const canClick = this.canClick();
            const overlayClassName = classnames_1.default('module-image__border-overlay', noBorder ? null : 'module-image__border-overlay--with-border', canClick ? 'module-image__border-overlay--with-click-handler' : null, curveTopLeft ? 'module-image--curved-top-left' : null, curveTopRight ? 'module-image--curved-top-right' : null, curveBottomLeft ? 'module-image--curved-bottom-left' : null, curveBottomRight ? 'module-image--curved-bottom-right' : null, smallCurveTopLeft ? 'module-image--small-curved-top-left' : null, softCorners ? 'module-image--soft-corners' : null, darkOverlay ? 'module-image__border-overlay--dark' : null);
            const overlay = canClick ? (
                // Not sure what this button does.
                // eslint-disable-next-line jsx-a11y/control-has-associated-label
                react_1.default.createElement("button", { type: "button", className: overlayClassName, onClick: this.handleClick, onKeyDown: this.handleKeyDown, tabIndex: tabIndex })) : null;
            /* eslint-disable no-nested-ternary */
            return (react_1.default.createElement("div", { className: classnames_1.default('module-image', !noBackground ? 'module-image--with-background' : null, curveBottomLeft ? 'module-image--curved-bottom-left' : null, curveBottomRight ? 'module-image--curved-bottom-right' : null, curveTopLeft ? 'module-image--curved-top-left' : null, curveTopRight ? 'module-image--curved-top-right' : null, smallCurveTopLeft ? 'module-image--small-curved-top-left' : null, softCorners ? 'module-image--soft-corners' : null) },
                pending ? (react_1.default.createElement("div", {
                    className: "module-image__loading-placeholder", style: {
                        height: `${height}px`,
                        width: `${width}px`,
                        lineHeight: `${height}px`,
                        textAlign: 'center',
                    }, title: i18n('loading')
                },
                    react_1.default.createElement(Spinner_1.Spinner, { svgSize: "normal" }))) : url ? (react_1.default.createElement("img", { onError: onError, className: "module-image__image", alt: alt, height: height, width: width, src: url })) : blurHash ? (react_1.default.createElement(react_blurhash_1.Blurhash, { hash: blurHash, width: width, height: height, style: { display: 'block' } })) : null,
                caption ? (react_1.default.createElement("img", { className: "module-image__caption-icon", src: "images/caption-shadow.svg", alt: i18n('imageCaptionIconAlt') })) : null,
                bottomOverlay ? (react_1.default.createElement("div", { className: classnames_1.default('module-image__bottom-overlay', curveBottomLeft ? 'module-image--curved-bottom-left' : null, curveBottomRight ? 'module-image--curved-bottom-right' : null) })) : null,
                !pending && playIconOverlay ? (react_1.default.createElement("div", { className: "module-image__play-overlay__circle" },
                    react_1.default.createElement("div", { className: "module-image__play-overlay__icon" }))) : null,
                overlayText ? (react_1.default.createElement("div", { className: "module-image__text-container", style: { lineHeight: `${height}px` } }, overlayText)) : null,
                overlay,
                closeButton ? (react_1.default.createElement("button", {
                    type: "button", onClick: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onClickClose) {
                            onClickClose(attachment);
                        }
                    }, className: "module-image__close-button", title: i18n('remove-attachment'), "aria-label": i18n('remove-attachment')
                })) : null));
            /* eslint-enable no-nested-ternary */
        }
    }
    exports.Image = Image;
})();