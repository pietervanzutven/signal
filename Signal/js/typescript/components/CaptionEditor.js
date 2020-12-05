(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.CaptionEditor = {};

    // tslint:disable:react-a11y-anchors
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const GoogleChrome = __importStar(window.ts.util.GoogleChrome);
    class CaptionEditor extends react_1.default.Component {
        renderObject() {
            const { url, i18n, attachment } = this.props;
            const { contentType } = attachment || { contentType: null };
            const isImageTypeSupported = GoogleChrome.isImageTypeSupported(contentType);
            if (isImageTypeSupported) {
                return (react_1.default.createElement("img", { className: "module-caption-editor__image", alt: i18n('imageAttachmentAlt'), src: url }));
            }
            const isVideoTypeSupported = GoogleChrome.isVideoTypeSupported(contentType);
            if (isVideoTypeSupported) {
                return (react_1.default.createElement("video", { className: "module-caption-editor__video", controls: true },
                    react_1.default.createElement("source", { src: url })));
            }
            return react_1.default.createElement("div", { className: "module-caption-editor__placeholder" });
        }
        render() {
            const { caption, i18n, close, onChangeCaption } = this.props;
            return (react_1.default.createElement("div", { className: "module-caption-editor" },
                react_1.default.createElement("div", { role: "button", onClick: close, className: "module-caption-editor__close-button" }),
                react_1.default.createElement("div", { className: "module-caption-editor__media-container" }, this.renderObject()),
                react_1.default.createElement("div", { className: "module-caption-editor__bottom-bar" },
                    react_1.default.createElement("div", { className: "module-caption-editor__add-caption-button" }),
                    react_1.default.createElement("input", {
                        type: "text", value: caption || '', maxLength: 200, placeholder: i18n('addACaption'), className: "module-caption-editor__caption-input", onChange: event => {
                            if (onChangeCaption) {
                                onChangeCaption(event.target.value);
                            }
                        }
                    }))));
        }
    }
    exports.CaptionEditor = CaptionEditor;
})();