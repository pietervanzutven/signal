(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    window.ts.components.conversation.media_gallery = window.ts.components.conversation.media_gallery || {};
    const exports = window.ts.components.conversation.media_gallery.EmptyState = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @prettier
     */
    const react_1 = __importDefault(window.react);
    class EmptyState extends react_1.default.Component {
        render() {
            const { label } = this.props;
            return react_1.default.createElement("div", { className: "module-empty-state" }, label);
        }
    }
    exports.EmptyState = EmptyState;
})();