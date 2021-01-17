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
        constructor(props) {
            super(props);
            const { caption } = props;
            this.state = {
                caption: caption || '',
            };
            this.handleKeyDownBound = this.handleKeyDown.bind(this);
            this.setFocusBound = this.setFocus.bind(this);
            this.onChangeBound = this.onChange.bind(this);
            this.onSaveBound = this.onSave.bind(this);
            this.inputRef = react_1.default.createRef();
        }
        componentDidMount() {
            // Forcing focus after a delay due to some focus contention with ConversationView
            setTimeout(() => {
                this.setFocus();
            }, 200);
        }
        handleKeyDown(event) {
            const { close, onSave } = this.props;
            if (close && event.key === 'Escape') {
                close();
                event.stopPropagation();
                event.preventDefault();
            }
            if (onSave && event.key === 'Enter') {
                const { caption } = this.state;
                onSave(caption);
                event.stopPropagation();
                event.preventDefault();
            }
        }
        setFocus() {
            if (this.inputRef.current) {
                this.inputRef.current.focus();
            }
        }
        onSave() {
            const { onSave } = this.props;
            const { caption } = this.state;
            if (onSave) {
                onSave(caption);
            }
        }
        onChange(event) {
            // @ts-ignore
            const { value } = event.target;
            this.setState({
                caption: value,
            });
        }
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
            const { i18n, close } = this.props;
            const { caption } = this.state;
            const onKeyDown = close ? this.handleKeyDownBound : undefined;
            return (react_1.default.createElement("div", { role: "dialog", onClick: this.setFocusBound, className: "module-caption-editor" },
                react_1.default.createElement("div", {
                    // Okay that this isn't a button; the escape key can be used to close this view
                    role: "button", onClick: close, className: "module-caption-editor__close-button"
                }),
                react_1.default.createElement("div", { className: "module-caption-editor__media-container" }, this.renderObject()),
                react_1.default.createElement("div", { className: "module-caption-editor__bottom-bar" },
                    react_1.default.createElement("div", { className: "module-caption-editor__input-container" },
                        react_1.default.createElement("input", { type: "text", ref: this.inputRef, value: caption, maxLength: 200, placeholder: i18n('addACaption'), className: "module-caption-editor__caption-input", onKeyDown: onKeyDown, onChange: this.onChangeBound }),
                        caption ? (react_1.default.createElement("button", { onClick: this.onSaveBound, className: "module-caption-editor__save-button" }, i18n('save'))) : null))));
        }
    }
    exports.CaptionEditor = CaptionEditor;
})();