(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.LightboxGallery = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @prettier
     */
    const react_1 = __importDefault(window.react);
    const Lightbox_1 = window.ts.components.Lightbox;
    class LightboxGallery extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.handlePrevious = () => {
                this.setState(prevState => ({
                    selectedIndex: Math.max(prevState.selectedIndex - 1, 0),
                }));
            };
            this.handleNext = () => {
                this.setState((prevState, props) => ({
                    selectedIndex: Math.min(prevState.selectedIndex + 1, props.media.length - 1),
                }));
            };
            this.handleSave = () => {
                const { media, onSave } = this.props;
                if (!onSave) {
                    return;
                }
                const { selectedIndex } = this.state;
                const mediaItem = media[selectedIndex];
                const { attachment, message, index } = mediaItem;
                onSave({ attachment, message, index });
            };
            this.state = {
                selectedIndex: this.props.selectedIndex,
            };
        }
        render() {
            const { close, media, onSave, i18n } = this.props;
            const { selectedIndex } = this.state;
            const selectedMedia = media[selectedIndex];
            const firstIndex = 0;
            const lastIndex = media.length - 1;
            const onPrevious = selectedIndex > firstIndex ? this.handlePrevious : undefined;
            const onNext = selectedIndex < lastIndex ? this.handleNext : undefined;
            const objectURL = selectedMedia.objectURL || 'images/alert-outline.svg';
            const { attachment } = selectedMedia;
            const saveCallback = onSave ? this.handleSave : undefined;
            const captionCallback = attachment ? attachment.caption : undefined;
            return (react_1.default.createElement(Lightbox_1.Lightbox, { close: close, onPrevious: onPrevious, onNext: onNext, onSave: saveCallback, objectURL: objectURL, caption: captionCallback, contentType: selectedMedia.contentType, i18n: i18n }));
        }
    }
    LightboxGallery.defaultProps = {
        selectedIndex: 0,
    };
    exports.LightboxGallery = LightboxGallery;
})();