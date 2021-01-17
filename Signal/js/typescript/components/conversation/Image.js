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
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const Spinner_1 = window.ts.components.Spinner;
    class Image extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.handleClick = (event) => {
                const { onClick, attachment } = this.props;
                if (onClick) {
                    event.preventDefault();
                    event.stopPropagation();
                    onClick(attachment);
                }
            };
            this.handleKeyDown = (event) => {
                const { onClick, attachment } = this.props;
                if (onClick && (event.key === 'Enter' || event.key === 'Space')) {
                    event.preventDefault();
                    event.stopPropagation();
                    onClick(attachment);
                }
            };
        }
        // tslint:disable-next-line max-func-body-length cyclomatic-complexity
        render() {
            const { alt, attachment, bottomOverlay, closeButton, curveBottomLeft, curveBottomRight, curveTopLeft, curveTopRight, darkOverlay, height, i18n, noBackground, noBorder, onClick, onClickClose, onError, overlayText, playIconOverlay, smallCurveTopLeft, softCorners, tabIndex, url, width, } = this.props;
            const { caption, pending } = attachment || { caption: null, pending: true };
            const canClick = onClick && !pending;
            const overlayClassName = classnames_1.default('module-image__border-overlay', noBorder ? null : 'module-image__border-overlay--with-border', canClick && onClick
                ? 'module-image__border-overlay--with-click-handler'
                : null, curveTopLeft ? 'module-image--curved-top-left' : null, curveTopRight ? 'module-image--curved-top-right' : null, curveBottomLeft ? 'module-image--curved-bottom-left' : null, curveBottomRight ? 'module-image--curved-bottom-right' : null, smallCurveTopLeft ? 'module-image--small-curved-top-left' : null, softCorners ? 'module-image--soft-corners' : null, darkOverlay ? 'module-image__border-overlay--dark' : null);
            let overlay;
            if (canClick && onClick) {
                overlay = (react_1.default.createElement("button", { className: overlayClassName, onClick: this.handleClick, onKeyDown: this.handleKeyDown, tabIndex: tabIndex }));
            }
            else {
                overlay = react_1.default.createElement("div", { className: overlayClassName });
            }
            return (react_1.default.createElement("div", { className: classnames_1.default('module-image', !noBackground ? 'module-image--with-background' : null, curveBottomLeft ? 'module-image--curved-bottom-left' : null, curveBottomRight ? 'module-image--curved-bottom-right' : null, curveTopLeft ? 'module-image--curved-top-left' : null, curveTopRight ? 'module-image--curved-top-right' : null, smallCurveTopLeft ? 'module-image--small-curved-top-left' : null, softCorners ? 'module-image--soft-corners' : null) },
                pending ? (react_1.default.createElement("div", {
                    className: "module-image__loading-placeholder", style: {
                        height: `${height}px`,
                        width: `${width}px`,
                        lineHeight: `${height}px`,
                        textAlign: 'center',
                    }, title: i18n('loading')
                },
                    react_1.default.createElement(Spinner_1.Spinner, { svgSize: "normal" }))) : (react_1.default.createElement("img", { onError: onError, className: "module-image__image", alt: alt, height: height, width: width, src: url })),
                caption ? (react_1.default.createElement("img", { className: "module-image__caption-icon", src: "images/caption-shadow.svg", alt: i18n('imageCaptionIconAlt') })) : null,
                bottomOverlay ? (react_1.default.createElement("div", { className: classnames_1.default('module-image__bottom-overlay', curveBottomLeft ? 'module-image--curved-bottom-left' : null, curveBottomRight ? 'module-image--curved-bottom-right' : null) })) : null,
                !pending && playIconOverlay ? (react_1.default.createElement("div", { className: "module-image__play-overlay__circle" },
                    react_1.default.createElement("div", { className: "module-image__play-overlay__icon" }))) : null,
                overlayText ? (react_1.default.createElement("div", { className: "module-image__text-container", style: { lineHeight: `${height}px` } }, overlayText)) : null,
                overlay,
                closeButton ? (react_1.default.createElement("button", {
                    onClick: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onClickClose) {
                            onClickClose(attachment);
                        }
                    }, className: "module-image__close-button", title: i18n('remove-attachment')
                })) : null));
        }
    }
    exports.Image = Image;
})();