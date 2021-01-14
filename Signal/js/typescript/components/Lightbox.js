(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.Lightbox = {};

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
    const classnames_1 = __importDefault(window.classnames);
    const is_1 = __importDefault(window.sindresorhus.is);
    const GoogleChrome = __importStar(window.ts.util.GoogleChrome);
    const MIME = __importStar(window.ts.types.MIME);
    const formatDuration_1 = window.ts.util.formatDuration;
    const Colors = {
        ICON_SECONDARY: '#b9b9b9',
    };
    const colorSVG = (url, color) => {
        return {
            WebkitMask: `url(${url}) no-repeat center`,
            WebkitMaskSize: '100%',
            backgroundColor: color,
        };
    };
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
            // To ensure that a large image doesn't overflow the flex layout
            minHeight: '50px',
        },
        objectContainer: {
            position: 'relative',
            flexGrow: 1,
            display: 'inline-flex',
            justifyContent: 'center',
        },
        object: {
            flexGrow: 1,
            flexShrink: 0,
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            outline: 'none',
        },
        caption: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: 'white',
            padding: '1em',
            paddingLeft: '3em',
            paddingRight: '3em',
            backgroundColor: 'rgba(192, 192, 192, .20)',
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
        countdownContainer: {
            padding: 8,
        },
        iconButtonPlaceholder: {
            // Dimensions match `.iconButton`:
            display: 'inline-block',
            width: 50,
            height: 50,
        },
        timestampPill: {
            borderRadius: '15px',
            backgroundColor: '#000000',
            color: '#eeefef',
            fontSize: '16px',
            letterSpacing: '0px',
            lineHeight: '18px',
            // This cast is necessary or typescript chokes
            textAlign: 'center',
            padding: '6px',
            paddingLeft: '18px',
            paddingRight: '18px',
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
        return (react_1.default.createElement("a", { href: "#", onClick: clickHandler, className: classnames_1.default('iconButton', type), role: "button", style: style }));
    };
    const IconButtonPlaceholder = () => (react_1.default.createElement("div", { style: styles.iconButtonPlaceholder }));
    const Icon = ({ onClick, url, }) => (react_1.default.createElement("div", { style: Object.assign({}, styles.object, colorSVG(url, Colors.ICON_SECONDARY), { maxWidth: 200 }), onClick: onClick, role: "button" }));
    class Lightbox extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.renderObject = ({ objectURL, contentType, i18n, isViewOnce, }) => {
                const isImageTypeSupported = GoogleChrome.isImageTypeSupported(contentType);
                if (isImageTypeSupported) {
                    return (react_1.default.createElement("img", { alt: i18n('lightboxImageAlt'), style: styles.object, src: objectURL, onClick: this.onObjectClick }));
                }
                const isVideoTypeSupported = GoogleChrome.isVideoTypeSupported(contentType);
                if (isVideoTypeSupported) {
                    return (react_1.default.createElement("video", { role: "button", ref: this.videoRef, loop: isViewOnce, controls: !isViewOnce, style: styles.object, key: objectURL },
                        react_1.default.createElement("source", { src: objectURL })));
                }
                const isUnsupportedImageType = !isImageTypeSupported && MIME.isImage(contentType);
                const isUnsupportedVideoType = !isVideoTypeSupported && MIME.isVideo(contentType);
                if (isUnsupportedImageType || isUnsupportedVideoType) {
                    const iconUrl = isUnsupportedVideoType
                        ? 'images/movie.svg'
                        : 'images/image.svg';
                    return react_1.default.createElement(Icon, { url: iconUrl, onClick: this.onObjectClick });
                }
                // tslint:disable-next-line no-console
                console.log('Lightbox: Unexpected content type', { contentType });
                return react_1.default.createElement(Icon, { onClick: this.onObjectClick, url: "images/file.svg" });
            };
            this.onClose = () => {
                const { close } = this.props;
                if (!close) {
                    return;
                }
                close();
            };
            this.onTimeUpdate = () => {
                const video = this.getVideo();
                if (!video) {
                    return;
                }
                this.setState({
                    videoTime: video.currentTime,
                });
            };
            this.onKeyUp = (event) => {
                const { onNext, onPrevious } = this.props;
                switch (event.key) {
                    case 'Escape':
                        this.onClose();
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
                }
            };
            this.onContainerClick = (event) => {
                if (this.containerRef && event.target !== this.containerRef.current) {
                    return;
                }
                this.onClose();
            };
            this.onObjectClick = (event) => {
                event.stopPropagation();
                this.onClose();
            };
            this.videoRef = react_1.default.createRef();
            this.containerRef = react_1.default.createRef();
            this.state = {
                videoTime: undefined,
            };
        }
        componentDidMount() {
            const { isViewOnce } = this.props;
            const useCapture = true;
            document.addEventListener('keyup', this.onKeyUp, useCapture);
            const video = this.getVideo();
            if (video && isViewOnce) {
                video.addEventListener('timeupdate', this.onTimeUpdate);
            }
            this.playVideo();
        }
        componentWillUnmount() {
            const { isViewOnce } = this.props;
            const useCapture = true;
            document.removeEventListener('keyup', this.onKeyUp, useCapture);
            const video = this.getVideo();
            if (video && isViewOnce) {
                video.removeEventListener('timeupdate', this.onTimeUpdate);
            }
        }
        getVideo() {
            if (!this.videoRef) {
                return;
            }
            const { current } = this.videoRef;
            if (!current) {
                return;
            }
            return current;
        }
        playVideo() {
            const video = this.getVideo();
            if (!video) {
                return;
            }
            if (video.paused) {
                // tslint:disable-next-line no-floating-promises
                video.play();
            }
            else {
                video.pause();
            }
        }
        render() {
            const { caption, contentType, i18n, isViewOnce, objectURL, onNext, onPrevious, onSave, } = this.props;
            const { videoTime } = this.state;
            return (react_1.default.createElement("div", { style: styles.container, onClick: this.onContainerClick, ref: this.containerRef, role: "dialog" },
                react_1.default.createElement("div", { style: styles.mainContainer },
                    react_1.default.createElement("div", { style: styles.controlsOffsetPlaceholder }),
                    react_1.default.createElement("div", { style: styles.objectContainer },
                        !is_1.default.undefined(contentType)
                            ? this.renderObject({ objectURL, contentType, i18n, isViewOnce })
                            : null,
                        caption ? react_1.default.createElement("div", { style: styles.caption }, caption) : null),
                    react_1.default.createElement("div", { style: styles.controls },
                        react_1.default.createElement(IconButton, { type: "close", onClick: this.onClose }),
                        onSave ? (react_1.default.createElement(IconButton, { type: "save", onClick: onSave, style: styles.saveButton })) : null)),
                isViewOnce && is_1.default.number(videoTime) ? (react_1.default.createElement("div", { style: styles.navigationContainer },
                    react_1.default.createElement("div", { style: styles.timestampPill }, formatDuration_1.formatDuration(videoTime)))) : (react_1.default.createElement("div", { style: styles.navigationContainer },
                        onPrevious ? (react_1.default.createElement(IconButton, { type: "previous", onClick: onPrevious })) : (react_1.default.createElement(IconButtonPlaceholder, null)),
                        onNext ? (react_1.default.createElement(IconButton, { type: "next", onClick: onNext })) : (react_1.default.createElement(IconButtonPlaceholder, null))))));
        }
    }
    exports.Lightbox = Lightbox;
})();