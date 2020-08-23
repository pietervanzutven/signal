(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.Lightbox = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @prettier
     */
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'row',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            padding: 40,
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
        controls: {
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            marginLeft: 10,
        },
    };
    const IconButton = ({ onClick, type }) => (react_1.default.createElement("a", { href: "#", onClick: onClick, className: classnames_1.default('iconButton', type) }));
    class Lightbox extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.containerRef = null;
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
                if (event.key !== 'Escape') {
                    return;
                }
                this.onClose();
            };
            this.onContainerClick = (event) => {
                if (event.target !== this.containerRef) {
                    return;
                }
                this.onClose();
            };
            this.onImageClick = (event) => {
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
            const { imageURL } = this.props;
            return (react_1.default.createElement("div", { style: styles.container, onClick: this.onContainerClick, ref: this.setContainerRef },
                react_1.default.createElement("div", { style: styles.objectContainer },
                    react_1.default.createElement("img", { style: styles.image, src: imageURL, onClick: this.onImageClick })),
                react_1.default.createElement("div", { style: styles.controls },
                    react_1.default.createElement(IconButton, { type: "close", onClick: this.onClose }),
                    this.props.onSave ? (react_1.default.createElement(IconButton, { type: "save", onClick: this.props.onSave })) : null,
                    this.props.onPrevious ? (react_1.default.createElement(IconButton, { type: "previous", onClick: this.props.onPrevious })) : null,
                    this.props.onNext ? (react_1.default.createElement(IconButton, { type: "next", onClick: this.props.onNext })) : null)));
        }
    }
    exports.Lightbox = Lightbox;
})();