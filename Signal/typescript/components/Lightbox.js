require(exports => {
    "use strict";
    // Copyright 2018-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
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
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const is_1 = __importDefault(require("@sindresorhus/is"));
    const GoogleChrome = __importStar(require("../util/GoogleChrome"));
    const MIME = __importStar(require("../types/MIME"));
    const formatDuration_1 = require("../util/formatDuration");
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
        buttonContainer: {
            backgroundColor: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            outline: 'none',
            width: '100%',
            padding: 0,
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
            outline: 'none',
        },
        objectContainer: {
            position: 'relative',
            flexGrow: 1,
            display: 'inline-flex',
            justifyContent: 'center',
        },
        object: {
            flexGrow: 1,
            flexShrink: 1,
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            outline: 'none',
        },
        img: {
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'auto',
            height: 'auto',
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
    const IconButton = ({ i18n, onClick, style, type }) => {
        const clickHandler = (event) => {
            event.preventDefault();
            if (!onClick) {
                return;
            }
            onClick();
        };
        return (react_1.default.createElement("button", { onClick: clickHandler, className: classnames_1.default('iconButton', type), style: style, "aria-label": i18n(type), type: "button" }));
    };
    const IconButtonPlaceholder = () => (react_1.default.createElement("div", { style: styles.iconButtonPlaceholder }));
    const Icon = ({ i18n, onClick, url, }) => (react_1.default.createElement("button", { style: Object.assign(Object.assign(Object.assign({}, styles.object), colorSVG(url, Colors.ICON_SECONDARY)), { maxWidth: 200 }), onClick: onClick, "aria-label": i18n('unsupportedAttachment'), type: "button" }));
    class Lightbox extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.containerRef = react_1.default.createRef();
            this.videoRef = react_1.default.createRef();
            this.focusRef = react_1.default.createRef();
            this.previousFocus = null;
            this.renderObject = ({ objectURL, contentType, i18n, isViewOnce, }) => {
                const isImageTypeSupported = GoogleChrome.isImageTypeSupported(contentType);
                if (isImageTypeSupported) {
                    return (react_1.default.createElement("button", { type: "button", style: styles.buttonContainer, onClick: this.onObjectClick },
                        react_1.default.createElement("img", { alt: i18n('lightboxImageAlt'), style: styles.img, src: objectURL, onContextMenu: this.onContextMenu })));
                }
                const isVideoTypeSupported = GoogleChrome.isVideoTypeSupported(contentType);
                if (isVideoTypeSupported) {
                    return (react_1.default.createElement("video", { ref: this.videoRef, loop: isViewOnce, controls: !isViewOnce, style: styles.object, key: objectURL },
                        react_1.default.createElement("source", { src: objectURL })));
                }
                const isUnsupportedImageType = !isImageTypeSupported && MIME.isImage(contentType);
                const isUnsupportedVideoType = !isVideoTypeSupported && MIME.isVideo(contentType);
                if (isUnsupportedImageType || isUnsupportedVideoType) {
                    const iconUrl = isUnsupportedVideoType
                        ? 'images/movie.svg'
                        : 'images/image.svg';
                    return react_1.default.createElement(Icon, { i18n: i18n, url: iconUrl, onClick: this.onObjectClick });
                }
                window.log.info('Lightbox: Unexpected content type', { contentType });
                return (react_1.default.createElement(Icon, { i18n: i18n, onClick: this.onObjectClick, url: "images/file.svg" }));
            };
            this.onContextMenu = (event) => {
                const { contentType = '' } = this.props;
                // These are the only image types supported by Electron's NativeImage
                if (event &&
                    contentType !== 'image/png' &&
                    !/image\/jpe?g/g.test(contentType)) {
                    event.preventDefault();
                }
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
            this.onKeyDown = (event) => {
                const { onNext, onPrevious } = this.props;
                switch (event.key) {
                    case 'Escape':
                        this.onClose();
                        event.preventDefault();
                        event.stopPropagation();
                        break;
                    case 'ArrowLeft':
                        if (onPrevious) {
                            onPrevious();
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        break;
                    case 'ArrowRight':
                        if (onNext) {
                            onNext();
                            event.preventDefault();
                            event.stopPropagation();
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
            this.onContainerKeyUp = (event) => {
                if ((this.containerRef && event.target !== this.containerRef.current) ||
                    event.keyCode !== 27) {
                    return;
                }
                this.onClose();
            };
            this.onObjectClick = (event) => {
                event.stopPropagation();
                this.onClose();
            };
            this.state = {};
        }
        componentDidMount() {
            this.previousFocus = document.activeElement;
            const { isViewOnce } = this.props;
            const useCapture = true;
            document.addEventListener('keydown', this.onKeyDown, useCapture);
            const video = this.getVideo();
            if (video && isViewOnce) {
                video.addEventListener('timeupdate', this.onTimeUpdate);
            }
            // Wait until we're added to the DOM. ConversationView first creates this view, then
            //   appends its elements into the DOM.
            setTimeout(() => {
                this.playVideo();
                if (this.focusRef && this.focusRef.current) {
                    this.focusRef.current.focus();
                }
            });
        }
        componentWillUnmount() {
            if (this.previousFocus && this.previousFocus.focus) {
                this.previousFocus.focus();
            }
            const { isViewOnce } = this.props;
            const useCapture = true;
            document.removeEventListener('keydown', this.onKeyDown, useCapture);
            const video = this.getVideo();
            if (video && isViewOnce) {
                video.removeEventListener('timeupdate', this.onTimeUpdate);
            }
        }
        getVideo() {
            if (!this.videoRef) {
                return null;
            }
            const { current } = this.videoRef;
            if (!current) {
                return null;
            }
            return current;
        }
        playVideo() {
            const video = this.getVideo();
            if (!video) {
                return;
            }
            if (video.paused) {
                video.play();
            }
            else {
                video.pause();
            }
        }
        render() {
            const { caption, contentType, i18n, isViewOnce, objectURL, onNext, onPrevious, onSave, } = this.props;
            const { videoTime } = this.state;
            return (react_1.default.createElement("div", { className: "module-lightbox", style: styles.container, onClick: this.onContainerClick, onKeyUp: this.onContainerKeyUp, ref: this.containerRef, role: "presentation" },
                react_1.default.createElement("div", { style: styles.mainContainer, tabIndex: -1, ref: this.focusRef },
                    react_1.default.createElement("div", { style: styles.controlsOffsetPlaceholder }),
                    react_1.default.createElement("div", { style: styles.objectContainer },
                        !is_1.default.undefined(contentType)
                            ? this.renderObject({ objectURL, contentType, i18n, isViewOnce })
                            : null,
                        caption ? react_1.default.createElement("div", { style: styles.caption }, caption) : null),
                    react_1.default.createElement("div", { style: styles.controls },
                        react_1.default.createElement(IconButton, { i18n: i18n, type: "close", onClick: this.onClose }),
                        onSave ? (react_1.default.createElement(IconButton, { i18n: i18n, type: "save", onClick: onSave, style: styles.saveButton })) : null)),
                isViewOnce && videoTime && is_1.default.number(videoTime) ? (react_1.default.createElement("div", { style: styles.navigationContainer },
                    react_1.default.createElement("div", { style: styles.timestampPill }, formatDuration_1.formatDuration(videoTime)))) : (react_1.default.createElement("div", { style: styles.navigationContainer },
                        onPrevious ? (react_1.default.createElement(IconButton, { i18n: i18n, type: "previous", onClick: onPrevious })) : (react_1.default.createElement(IconButtonPlaceholder, null)),
                        onNext ? (react_1.default.createElement(IconButton, { i18n: i18n, type: "next", onClick: onNext })) : (react_1.default.createElement(IconButtonPlaceholder, null))))));
        }
    }
    exports.Lightbox = Lightbox;
});