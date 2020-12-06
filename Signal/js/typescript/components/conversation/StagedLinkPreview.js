(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.StagedLinkPreview = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const ImageGrid_1 = window.ts.components.conversation.ImageGrid;
    const Image_1 = window.ts.components.conversation.Image;
    class StagedLinkPreview extends react_1.default.Component {
        render() {
            const { isLoaded, onClose, i18n, title, image, domain } = this.props;
            const isImage = image && ImageGrid_1.isImageAttachment(image);
            return (react_1.default.createElement("div", { className: classnames_1.default('module-staged-link-preview', !isLoaded ? 'module-staged-link-preview--is-loading' : null) },
                !isLoaded ? (react_1.default.createElement("div", { className: "module-staged-link-preview__loading" }, i18n('loadingPreview'))) : null,
                isLoaded && image && isImage ? (react_1.default.createElement("div", { className: "module-staged-link-preview__icon-container" },
                    react_1.default.createElement(Image_1.Image, { alt: i18n('stagedPreviewThumbnail', [domain]), softCorners: true, height: 72, width: 72, url: image.url, attachment: image, i18n: i18n }))) : null,
                isLoaded ? (react_1.default.createElement("div", { className: "module-staged-link-preview__content" },
                    react_1.default.createElement("div", { className: "module-staged-link-preview__title" }, title),
                    react_1.default.createElement("div", { className: "module-staged-link-preview__location" }, domain))) : null,
                react_1.default.createElement("div", { role: "button", className: "module-staged-link-preview__close-button", onClick: onClose })));
        }
    }
    exports.StagedLinkPreview = StagedLinkPreview;
})();