require(exports => {
    "use strict";
    // Copyright 2018-2021 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }));
    var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    });
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Quote = void 0;
    const react_1 = __importStar(require("react"));
    const lodash_1 = require("lodash");
    const classnames_1 = __importDefault(require("classnames"));
    const MIME = __importStar(require("../../types/MIME"));
    const GoogleChrome = __importStar(require("../../util/GoogleChrome"));
    const MessageBody_1 = require("./MessageBody");
    const ContactName_1 = require("./ContactName");
    const getTextWithMentions_1 = require("../../util/getTextWithMentions");
    function validateQuote(quote) {
        if (quote.text) {
            return true;
        }
        if (quote.attachment) {
            return true;
        }
        return false;
    }
    function getObjectUrl(thumbnail) {
        if (thumbnail && thumbnail.objectUrl) {
            return thumbnail.objectUrl;
        }
        return undefined;
    }
    function getTypeLabel({ i18n, contentType, isVoiceMessage, }) {
        if (GoogleChrome.isVideoTypeSupported(contentType)) {
            return i18n('video');
        }
        if (GoogleChrome.isImageTypeSupported(contentType)) {
            return i18n('photo');
        }
        if (MIME.isAudio(contentType) && isVoiceMessage) {
            return i18n('voiceMessage');
        }
        return MIME.isAudio(contentType) ? i18n('audio') : undefined;
    }
    class Quote extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.handleKeyDown = (event) => {
                const { onClick } = this.props;
                // This is important to ensure that using this quote to navigate to the referenced
                //   message doesn't also trigger its parent message's keydown.
                if (onClick && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    event.stopPropagation();
                    onClick();
                }
            };
            this.handleClick = (event) => {
                const { onClick } = this.props;
                if (onClick) {
                    event.preventDefault();
                    event.stopPropagation();
                    onClick();
                }
            };
            this.handleImageError = () => {
                window.console.info('Message: Image failed to load; failing over to placeholder');
                this.setState({
                    imageBroken: true,
                });
            };
            this.state = {
                imageBroken: false,
            };
        }
        renderImage(url, icon) {
            const iconElement = icon ? (react_1.default.createElement("div", { className: "module-quote__icon-container__inner" },
                react_1.default.createElement("div", { className: "module-quote__icon-container__circle-background" },
                    react_1.default.createElement("div", { className: classnames_1.default('module-quote__icon-container__icon', `module-quote__icon-container__icon--${icon}`) })))) : null;
            return (react_1.default.createElement(ThumbnailImage, { src: url, onError: this.handleImageError }, iconElement));
        }
        // eslint-disable-next-line class-methods-use-this
        renderIcon(icon) {
            return (react_1.default.createElement("div", { className: "module-quote__icon-container" },
                react_1.default.createElement("div", { className: "module-quote__icon-container__inner" },
                    react_1.default.createElement("div", { className: "module-quote__icon-container__circle-background" },
                        react_1.default.createElement("div", { className: classnames_1.default('module-quote__icon-container__icon', `module-quote__icon-container__icon--${icon}`) })))));
        }
        renderGenericFile() {
            const { attachment, isIncoming } = this.props;
            if (!attachment) {
                return null;
            }
            const { fileName, contentType } = attachment;
            const isGenericFile = !GoogleChrome.isVideoTypeSupported(contentType) &&
                !GoogleChrome.isImageTypeSupported(contentType) &&
                !MIME.isAudio(contentType);
            if (!isGenericFile) {
                return null;
            }
            return (react_1.default.createElement("div", { className: "module-quote__generic-file" },
                react_1.default.createElement("div", { className: "module-quote__generic-file__icon" }),
                react_1.default.createElement("div", { className: classnames_1.default('module-quote__generic-file__text', isIncoming ? 'module-quote__generic-file__text--incoming' : null) }, fileName)));
        }
        renderIconContainer() {
            const { attachment } = this.props;
            const { imageBroken } = this.state;
            if (!attachment) {
                return null;
            }
            const { contentType, thumbnail } = attachment;
            const objectUrl = getObjectUrl(thumbnail);
            if (GoogleChrome.isVideoTypeSupported(contentType)) {
                return objectUrl && !imageBroken
                    ? this.renderImage(objectUrl, 'play')
                    : this.renderIcon('movie');
            }
            if (GoogleChrome.isImageTypeSupported(contentType)) {
                return objectUrl && !imageBroken
                    ? this.renderImage(objectUrl)
                    : this.renderIcon('image');
            }
            if (MIME.isAudio(contentType)) {
                return this.renderIcon('microphone');
            }
            return null;
        }
        renderText() {
            const { bodyRanges, i18n, text, attachment, isIncoming } = this.props;
            if (text) {
                const quoteText = bodyRanges
                    ? getTextWithMentions_1.getTextWithMentions(bodyRanges, text)
                    : text;
                return (react_1.default.createElement("div", { dir: "auto", className: classnames_1.default('module-quote__primary__text', isIncoming ? 'module-quote__primary__text--incoming' : null) },
                    react_1.default.createElement(MessageBody_1.MessageBody, { disableLinks: true, text: quoteText, i18n: i18n })));
            }
            if (!attachment) {
                return null;
            }
            const { contentType, isVoiceMessage } = attachment;
            const typeLabel = getTypeLabel({ i18n, contentType, isVoiceMessage });
            if (typeLabel) {
                return (react_1.default.createElement("div", { className: classnames_1.default('module-quote__primary__type-label', isIncoming ? 'module-quote__primary__type-label--incoming' : null) }, typeLabel));
            }
            return null;
        }
        renderClose() {
            const { i18n, onClose } = this.props;
            if (!onClose) {
                return null;
            }
            const clickHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                onClose();
            };
            const keyDownHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    e.preventDefault();
                    onClose();
                }
            };
            // We need the container to give us the flexibility to implement the iOS design.
            return (react_1.default.createElement("div", { className: "module-quote__close-container" },
                react_1.default.createElement("div", {
                    tabIndex: 0,
                    // We can't be a button because the overall quote is a button; can't nest them
                    role: "button", className: "module-quote__close-button", "aria-label": i18n('close'), onKeyDown: keyDownHandler, onClick: clickHandler
                })));
        }
        renderAuthor() {
            const { authorProfileName, authorPhoneNumber, authorTitle, authorName, i18n, isFromMe, isIncoming, } = this.props;
            return (react_1.default.createElement("div", { className: classnames_1.default('module-quote__primary__author', isIncoming ? 'module-quote__primary__author--incoming' : null) }, isFromMe ? (i18n('you')) : (react_1.default.createElement(ContactName_1.ContactName, { phoneNumber: authorPhoneNumber, name: authorName, profileName: authorProfileName, title: authorTitle, i18n: i18n }))));
        }
        renderReferenceWarning() {
            const { i18n, isIncoming, referencedMessageNotFound } = this.props;
            if (!referencedMessageNotFound) {
                return null;
            }
            return (react_1.default.createElement("div", { className: classnames_1.default('module-quote__reference-warning', isIncoming ? 'module-quote__reference-warning--incoming' : null) },
                react_1.default.createElement("div", {
                    className: classnames_1.default('module-quote__reference-warning__icon', isIncoming
                        ? 'module-quote__reference-warning__icon--incoming'
                        : null)
                }),
                react_1.default.createElement("div", {
                    className: classnames_1.default('module-quote__reference-warning__text', isIncoming
                        ? 'module-quote__reference-warning__text--incoming'
                        : null)
                }, i18n('originalMessageNotFound'))));
        }
        render() {
            const { authorColor, isIncoming, onClick, referencedMessageNotFound, withContentAbove, } = this.props;
            if (!validateQuote(this.props)) {
                return null;
            }
            return (react_1.default.createElement("div", { className: classnames_1.default('module-quote-container', withContentAbove ? 'module-quote-container--with-content-above' : null) },
                react_1.default.createElement("button", {
                    type: "button", onClick: this.handleClick, onKeyDown: this.handleKeyDown, className: classnames_1.default('module-quote', isIncoming ? 'module-quote--incoming' : 'module-quote--outgoing', isIncoming
                        ? `module-quote--incoming-${authorColor}`
                        : `module-quote--outgoing-${authorColor}`, !onClick ? 'module-quote--no-click' : null, withContentAbove ? 'module-quote--with-content-above' : null, referencedMessageNotFound
                        ? 'module-quote--with-reference-warning'
                        : null)
                },
                    react_1.default.createElement("div", { className: "module-quote__primary" },
                        this.renderAuthor(),
                        this.renderGenericFile(),
                        this.renderText()),
                    this.renderIconContainer(),
                    this.renderClose()),
                this.renderReferenceWarning()));
        }
    }
    exports.Quote = Quote;
    function ThumbnailImage({ src, onError, children, }) {
        const imageRef = react_1.useRef(new Image());
        const [loadedSrc, setLoadedSrc] = react_1.useState(null);
        react_1.useEffect(() => {
            const image = new Image();
            image.onload = () => {
                setLoadedSrc(src);
            };
            image.src = src;
            imageRef.current = image;
            return () => {
                image.onload = lodash_1.noop;
            };
        }, [src]);
        react_1.useEffect(() => {
            setLoadedSrc(null);
        }, [src]);
        react_1.useEffect(() => {
            const image = imageRef.current;
            image.onerror = onError;
            return () => {
                image.onerror = lodash_1.noop;
            };
        }, [onError]);
        return (react_1.default.createElement("div", { className: "module-quote__icon-container", style: loadedSrc ? { backgroundImage: `url('${escape(loadedSrc)}')` } : {} }, children));
    }
});