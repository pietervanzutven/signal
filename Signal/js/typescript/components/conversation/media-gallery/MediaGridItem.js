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
    const GoogleChrome_1 = window.ts.util.GoogleChrome;
    class MediaGridItem extends react_1.default.Component {
        renderContent() {
            const { message, i18n } = this.props;
            const { attachments } = message;
            if (!message.thumbnailObjectUrl) {
                return null;
            }
            if (!attachments || !attachments.length) {
                return null;
            }
            const first = attachments[0];
            const { contentType } = first;
            if (contentType && GoogleChrome_1.isImageTypeSupported(contentType)) {
                return (react_1.default.createElement("img", { alt: i18n('lightboxImageAlt'), className: "module-media-grid-item__image", src: message.thumbnailObjectUrl }));
            }
            else if (contentType && GoogleChrome_1.isVideoTypeSupported(contentType)) {
                return (react_1.default.createElement("div", { className: "module-media-grid-item__image-container" },
                    react_1.default.createElement("img", { alt: i18n('lightboxImageAlt'), className: "module-media-grid-item__image", src: message.thumbnailObjectUrl }),
                    react_1.default.createElement("div", { className: "module-media-grid-item__circle-overlay" },
                        react_1.default.createElement("div", { className: "module-media-grid-item__play-overlay" }))));
            }
            return null;
        }
        render() {
            return (react_1.default.createElement("div", { className: "module-media-grid-item", role: "button", onClick: this.props.onClick }, this.renderContent()));
        }
    }
    exports.MediaGridItem = MediaGridItem;
})();