(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    window.ts.components.conversation.media_gallery = window.ts.components.conversation.media_gallery || {};
    const exports = window.ts.components.conversation.media_gallery.MediaGridItem = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const GoogleChrome_1 = require("../../../util/GoogleChrome");
    class MediaGridItem extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.state = {
                imageBroken: false,
            };
            this.onImageErrorBound = this.onImageError.bind(this);
        }
        onImageError() {
            // tslint:disable-next-line no-console
            console.log('MediaGridItem: Image failed to load; failing over to placeholder');
            this.setState({
                imageBroken: true,
            });
        }
        renderContent() {
            const { mediaItem, i18n } = this.props;
            const { imageBroken } = this.state;
            const { attachment, contentType } = mediaItem;
            if (!attachment) {
                return null;
            }
            if (contentType && GoogleChrome_1.isImageTypeSupported(contentType)) {
                if (imageBroken || !mediaItem.thumbnailObjectUrl) {
                    return (react_1.default.createElement("div", { className: classnames_1.default('module-media-grid-item__icon', 'module-media-grid-item__icon-image') }));
                }
                return (react_1.default.createElement("img", { alt: i18n('lightboxImageAlt'), className: "module-media-grid-item__image", src: mediaItem.thumbnailObjectUrl, onError: this.onImageErrorBound }));
            }
            else if (contentType && GoogleChrome_1.isVideoTypeSupported(contentType)) {
                if (imageBroken || !mediaItem.thumbnailObjectUrl) {
                    return (react_1.default.createElement("div", { className: classnames_1.default('module-media-grid-item__icon', 'module-media-grid-item__icon-video') }));
                }
                return (react_1.default.createElement("div", { className: "module-media-grid-item__image-container" },
                    react_1.default.createElement("img", { alt: i18n('lightboxImageAlt'), className: "module-media-grid-item__image", src: mediaItem.thumbnailObjectUrl, onError: this.onImageErrorBound }),
                    react_1.default.createElement("div", { className: "module-media-grid-item__circle-overlay" },
                        react_1.default.createElement("div", { className: "module-media-grid-item__play-overlay" }))));
            }
            return (react_1.default.createElement("div", { className: classnames_1.default('module-media-grid-item__icon', 'module-media-grid-item__icon-generic') }));
        }
        render() {
            return (react_1.default.createElement("button", { className: "module-media-grid-item", onClick: this.props.onClick }, this.renderContent()));
        }
    }
    exports.MediaGridItem = MediaGridItem;
})();