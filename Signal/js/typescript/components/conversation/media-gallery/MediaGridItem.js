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
    /**
     * @prettier
     */
    const react_1 = __importDefault(window.react);
    const size = {
        width: 94,
        height: 94,
    };
    const styles = {
        container: Object.assign({}, size, { cursor: 'pointer', backgroundColor: '#f3f3f3', marginRight: 4, marginBottom: 4 }),
        image: Object.assign({}, size, { backgroundSize: 'cover' }),
    };
    class MediaGridItem extends react_1.default.Component {
        renderContent() {
            const { message } = this.props;
            if (!message.objectURL) {
                return null;
            }
            return (react_1.default.createElement("div", { style: Object.assign({}, styles.container, styles.image, { backgroundImage: `url("${message.objectURL}")` }) }));
        }
        render() {
            return (react_1.default.createElement("div", { style: styles.container, onClick: this.props.onClick }, this.renderContent()));
        }
    }
    exports.MediaGridItem = MediaGridItem;
})();