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
        // tslint:disable-next-line max-func-body-length cyclomatic-complexity
        render() {
            const { alt, attachment, bottomOverlay, closeButton, curveBottomLeft, curveBottomRight, curveTopLeft, curveTopRight, darkOverlay, height, i18n, onClick, onClickClose, onError, overlayText, playIconOverlay, smallCurveTopLeft, softCorners, url, width, } = this.props;
            const { caption, pending } = attachment || { caption: null, pending: true };
            const canClick = onClick && !pending;
            const role = canClick ? 'button' : undefined;
            return (react_1.default.createElement("div", {
                role: role, onClick: () => {
                    if (canClick && onClick) {
                        onClick(attachment);
                    }
                }, className: classnames_1.default('module-image', canClick ? 'module-image__with-click-handler' : null, curveBottomLeft ? 'module-image--curved-bottom-left' : null, curveBottomRight ? 'module-image--curved-bottom-right' : null, curveTopLeft ? 'module-image--curved-top-left' : null, curveTopRight ? 'module-image--curved-top-right' : null, smallCurveTopLeft ? 'module-image--small-curved-top-left' : null, softCorners ? 'module-image--soft-corners' : null)
            },
                pending ? (react_1.default.createElement("div", {
                    className: "module-image__loading-placeholder", style: {
                        height: `${height}px`,
                        width: `${width}px`,
                        lineHeight: `${height}px`,
                        textAlign: 'center',
                    }
                },
                    react_1.default.createElement(Spinner_1.Spinner, null))) : (react_1.default.createElement("img", { onError: onError, className: "module-image__image", alt: alt, height: height, width: width, src: url })),
                caption ? (react_1.default.createElement("img", { className: "module-image__caption-icon", src: "images/caption-shadow.svg", alt: i18n('imageCaptionIconAlt') })) : null,
                react_1.default.createElement("div", { className: classnames_1.default('module-image__border-overlay', curveTopLeft ? 'module-image--curved-top-left' : null, curveTopRight ? 'module-image--curved-top-right' : null, curveBottomLeft ? 'module-image--curved-bottom-left' : null, curveBottomRight ? 'module-image--curved-bottom-right' : null, smallCurveTopLeft ? 'module-image--small-curved-top-left' : null, softCorners ? 'module-image--soft-corners' : null, darkOverlay ? 'module-image__border-overlay--dark' : null) }),
                closeButton ? (react_1.default.createElement("div", {
                    role: "button", onClick: (e) => {
                        e.stopPropagation();
                        if (onClickClose) {
                            onClickClose(attachment);
                        }
                    }, className: "module-image__close-button"
                })) : null,
                bottomOverlay ? (react_1.default.createElement("div", { className: classnames_1.default('module-image__bottom-overlay', curveBottomLeft ? 'module-image--curved-bottom-left' : null, curveBottomRight ? 'module-image--curved-bottom-right' : null) })) : null,
                !pending && playIconOverlay ? (react_1.default.createElement("div", { className: "module-image__play-overlay__circle" },
                    react_1.default.createElement("div", { className: "module-image__play-overlay__icon" }))) : null,
                overlayText ? (react_1.default.createElement("div", { className: "module-image__text-container", style: { lineHeight: `${height}px` } }, overlayText)) : null));
        }
    }
    exports.Image = Image;
})();