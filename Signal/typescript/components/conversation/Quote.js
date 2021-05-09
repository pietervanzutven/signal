(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.Quote = {};

    // tslint:disable:react-this-binding-issue
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
    const MIME = __importStar(require("../../../ts/types/MIME"));
    const GoogleChrome = __importStar(require("../../../ts/util/GoogleChrome"));
    const MessageBody_1 = require("./MessageBody");
    const ContactName_1 = require("./ContactName");
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
        return;
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
        if (MIME.isAudio(contentType)) {
            return i18n('audio');
        }
        return;
    }
    class Quote extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.state = {
                imageBroken: false,
            };
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
                // tslint:disable-next-line no-console
                console.log('Message: Image failed to load; failing over to placeholder');
                this.setState({
                    imageBroken: true,
                });
            };
        }
        renderImage(url, i18n, icon) {
            const iconElement = icon ? (react_1.default.createElement("div", { className: "module-quote__icon-container__inner" },
                react_1.default.createElement("div", { className: "module-quote__icon-container__circle-background" },
                    react_1.default.createElement("div", { className: classnames_1.default('module-quote__icon-container__icon', `module-quote__icon-container__icon--${icon}`) })))) : null;
            return (react_1.default.createElement("div", { className: "module-quote__icon-container" },
                react_1.default.createElement("img", { src: url, alt: i18n('quoteThumbnailAlt'), onError: this.handleImageError }),
                iconElement));
        }
        renderIcon(icon) {
            return (react_1.default.createElement("div", { className: "module-quote__icon-container" },
                react_1.default.createElement("div", { className: "module-quote__icon-container__inner" },
                    react_1.default.createElement("div", { className: "module-quote__icon-container__circle-background" },
                        react_1.default.createElement("div", { className: classnames_1.default('module-quote__icon-container__icon', `module-quote__icon-container__icon--${icon}`) })))));
        }
        renderGenericFile() {
            const { attachment, isIncoming } = this.props;
            if (!attachment) {
                return;
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
            const { attachment, i18n } = this.props;
            const { imageBroken } = this.state;
            if (!attachment) {
                return null;
            }
            const { contentType, thumbnail } = attachment;
            const objectUrl = getObjectUrl(thumbnail);
            if (GoogleChrome.isVideoTypeSupported(contentType)) {
                return objectUrl && !imageBroken
                    ? this.renderImage(objectUrl, i18n, 'play')
                    : this.renderIcon('movie');
            }
            if (GoogleChrome.isImageTypeSupported(contentType)) {
                return objectUrl && !imageBroken
                    ? this.renderImage(objectUrl, i18n)
                    : this.renderIcon('image');
            }
            if (MIME.isAudio(contentType)) {
                return this.renderIcon('microphone');
            }
            return null;
        }
        renderText() {
            const { bodyRanges, i18n, text, attachment, isIncoming, openConversation, } = this.props;
            if (text) {
                return (react_1.default.createElement("div", { dir: "auto", className: classnames_1.default('module-quote__primary__text', isIncoming ? 'module-quote__primary__text--incoming' : null) },
                    react_1.default.createElement(MessageBody_1.MessageBody, { disableLinks: true, text: text, i18n: i18n, bodyRanges: bodyRanges, openConversation: openConversation })));
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
            const { onClose } = this.props;
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
                    role: "button", className: "module-quote__close-button", onKeyDown: keyDownHandler, onClick: clickHandler
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
                    onClick: this.handleClick, onKeyDown: this.handleKeyDown, className: classnames_1.default('module-quote', isIncoming ? 'module-quote--incoming' : 'module-quote--outgoing', isIncoming
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
})();