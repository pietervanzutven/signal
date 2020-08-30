(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.Lightbox = {};

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
    const classnames_1 = __importDefault(window.classnames);
    const is_1 = __importDefault(window.sindresorhus.is);
    const GoogleChrome = __importStar(window.ts.util.GoogleChrome);
    const CONTROLS_WIDTH = 50;
    const CONTROLS_SPACING = 10;
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
        },
        mainContainer: {
            display: 'flex',
            flexDirection: 'row',
            flexGrow: 1,
            paddingTop: 40,
            paddingLeft: 40,
            paddingRight: 40,
            paddingBottom: 0,
        },
        objectContainer: {
            flexGrow: 1,
            display: 'inline-flex',
            justifyContent: 'center',
        },
        image: {
            flexGrow: 1,
            flexShrink: 0,
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
        },
        controlsOffsetPlaceholder: {
            width: CONTROLS_WIDTH,
            marginRight: CONTROLS_SPACING,
            flexShrink: 0,
        },
        controls: {
            width: CONTROLS_WIDTH,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            marginLeft: CONTROLS_SPACING,
        },
        navigationContainer: {
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            padding: 10,
        },
        saveButton: {
            marginTop: 10,
        },
        iconButtonPlaceholder: {
            // Dimensions match `.iconButton`:
            display: 'inline-block',
            width: 50,
            height: 50,
        },
    };
    const IconButton = ({ onClick, style, type }) => {
        const clickHandler = (event) => {
            event.preventDefault();
            if (!onClick) {
                return;
            }
            onClick();
        };
        return (react_1.default.createElement("a", { href: "#", onClick: clickHandler, className: classnames_1.default('iconButton', type), style: style }));
    };
    const IconButtonPlaceholder = () => (react_1.default.createElement("div", { style: styles.iconButtonPlaceholder }));
    class Lightbox extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.containerRef = null;
            this.renderObject = ({ objectURL, contentType, }) => {
                const isImage = GoogleChrome.isImageTypeSupported(contentType);
                if (isImage) {
                    return (react_1.default.createElement("img", { style: styles.image, src: objectURL, onClick: this.onObjectClick }));
                }
                const isVideo = GoogleChrome.isVideoTypeSupported(contentType);
                if (isVideo) {
                    return (react_1.default.createElement("video", { controls: true },
                        react_1.default.createElement("source", { src: objectURL })));
                }
                // tslint:disable-next-line no-console
                console.log('Lightbox: Unexpected content type', { contentType });
                return null;
            };
            this.setContainerRef = (value) => {
                this.containerRef = value;
            };
            this.onClose = () => {
                const { close } = this.props;
                if (!close) {
                    return;
                }
                close();
            };
            this.onKeyUp = (event) => {
                const { onClose } = this;
                const { onNext, onPrevious } = this.props;
                switch (event.key) {
                    case 'Escape':
                        onClose();
                        break;
                    case 'ArrowLeft':
                        if (onPrevious) {
                            onPrevious();
                        }
                        break;
                    case 'ArrowRight':
                        if (onNext) {
                            onNext();
                        }
                        break;
                    default:
                        break;
                }
            };
            this.onContainerClick = (event) => {
                if (event.target !== this.containerRef) {
                    return;
                }
                this.onClose();
            };
            this.onObjectClick = (event) => {
                event.stopPropagation();
                this.onClose();
            };
        }
        componentDidMount() {
            const useCapture = true;
            document.addEventListener('keyup', this.onKeyUp, useCapture);
        }
        componentWillUnmount() {
            const useCapture = true;
            document.removeEventListener('keyup', this.onKeyUp, useCapture);
        }
        render() {
            const { contentType, objectURL, onNext, onPrevious, onSave } = this.props;
            return (react_1.default.createElement("div", { style: styles.container, onClick: this.onContainerClick, ref: this.setContainerRef },
                react_1.default.createElement("div", { style: styles.mainContainer },
                    react_1.default.createElement("div", { style: styles.controlsOffsetPlaceholder }),
                    react_1.default.createElement("div", { style: styles.objectContainer }, !is_1.default.undefined(contentType)
                        ? this.renderObject({ objectURL, contentType })
                        : null),
                    react_1.default.createElement("div", { style: styles.controls },
                        react_1.default.createElement(IconButton, { type: "close", onClick: this.onClose }),
                        onSave ? (react_1.default.createElement(IconButton, { type: "save", onClick: onSave, style: styles.saveButton })) : null)),
                react_1.default.createElement("div", { style: styles.navigationContainer },
                    onPrevious ? (react_1.default.createElement(IconButton, { type: "previous", onClick: onPrevious })) : (react_1.default.createElement(IconButtonPlaceholder, null)),
                    onNext ? (react_1.default.createElement(IconButton, { type: "next", onClick: onNext })) : (react_1.default.createElement(IconButtonPlaceholder, null)))));
        }
    }
    exports.Lightbox = Lightbox;
})();