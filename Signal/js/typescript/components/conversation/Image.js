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
    class Image extends react_1.default.Component {
        render() {
            const { alt, attachment, bottomOverlay, curveBottomLeft, curveBottomRight, curveTopLeft, curveTopRight, darkOverlay, height, i18n, onClick, onError, overlayText, playIconOverlay, url, width, } = this.props;
            const { caption } = attachment || { caption: null };
            return (react_1.default.createElement("div", {
                onClick: () => {
                    if (onClick) {
                        onClick(attachment);
                    }
                }, role: "button", className: classnames_1.default('module-image', curveBottomLeft ? 'module-image--curved-bottom-left' : null, curveBottomRight ? 'module-image--curved-bottom-right' : null, curveTopLeft ? 'module-image--curved-top-left' : null, curveTopRight ? 'module-image--curved-top-right' : null)
            },
                react_1.default.createElement("img", { onError: onError, className: "module-image__image", alt: alt, height: height, width: width, src: url }),
                caption ? (react_1.default.createElement("img", { className: "module-image__caption-icon", src: "images/caption-shadow.svg", alt: i18n('imageCaptionIconAlt') })) : null,
                react_1.default.createElement("div", { className: classnames_1.default('module-image__border-overlay', curveTopLeft ? 'module-image--curved-top-left' : null, curveTopRight ? 'module-image--curved-top-right' : null, curveBottomLeft ? 'module-image--curved-bottom-left' : null, curveBottomRight ? 'module-image--curved-bottom-right' : null, darkOverlay ? 'module-image__border-overlay--dark' : null) }),
                bottomOverlay ? (react_1.default.createElement("div", { className: classnames_1.default('module-image__bottom-overlay', curveBottomLeft ? 'module-image--curved-bottom-left' : null, curveBottomRight ? 'module-image--curved-bottom-right' : null) })) : null,
                playIconOverlay ? (react_1.default.createElement("div", { className: "module-image__play-overlay__circle" },
                    react_1.default.createElement("div", { className: "module-image__play-overlay__icon" }))) : null,
                overlayText ? (react_1.default.createElement("div", { className: "module-image__text-container", style: { lineHeight: `${height}px` } }, overlayText)) : null));
        }
    }
    exports.Image = Image;
})();