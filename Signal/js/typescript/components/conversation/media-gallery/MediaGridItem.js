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
    class MediaGridItem extends react_1.default.Component {
        renderContent() {
            const { message, i18n } = this.props;
            if (!message.objectURL) {
                return null;
            }
            return (react_1.default.createElement("img", { alt: i18n('lightboxImageAlt'), className: "module-media-grid-item__image", src: message.objectURL }));
        }
        render() {
            return (react_1.default.createElement("div", { className: "module-media-grid-item", role: "button", onClick: this.props.onClick }, this.renderContent()));
        }
    }
    exports.MediaGridItem = MediaGridItem;
})();