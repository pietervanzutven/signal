(function () {
    "use strict";
    // tslint:disable:react-this-binding-issue

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.Quote = {};

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
    const MIME = __importStar(window.ts.types.MIME);
    const GoogleChrome = __importStar(window.ts.util.GoogleChrome);
    const Emojify_1 = window.ts.components.conversation.Emojify;
    const MessageBody_1 = window.ts.components.conversation.MessageBody;
    function validateQuote(quote) {
        if (quote.text) {
            return true;
        }
        if (quote.attachments && quote.attachments.length > 0) {
            return true;
        }
        return false;
    }
    function getObjectUrl(thumbnail) {
        if (thumbnail && thumbnail.objectUrl) {
            return thumbnail.objectUrl;
        }
        return null;
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
        return null;
    }
    class Quote extends react_1.default.Component {
        renderImage(url, i18n, icon) {
            const iconElement = icon ? (react_1.default.createElement("div", { className: "module-quote__icon-container__inner" },
                react_1.default.createElement("div", { className: "module-quote__icon-container__circle-background" },
                    react_1.default.createElement("div", { className: classnames_1.default('module-quote__icon-container__icon', `module-quote__icon-container__icon--${icon}`) })))) : null;
            return (react_1.default.createElement("div", { className: "module-quote__icon-container" },
                react_1.default.createElement("img", { src: url, alt: i18n('quoteThumbnailAlt') }),
                iconElement));
        }
        renderIcon(icon) {
            return (react_1.default.createElement("div", { className: "module-quote__icon-container" },
                react_1.default.createElement("div", { className: "module-quote__icon-container__inner" },
                    react_1.default.createElement("div", { className: "module-quote__icon-container__circle-background" },
                        react_1.default.createElement("div", { className: classnames_1.default('module-quote__icon-container__icon', `module-quote__icon-container__icon--${icon}`) })))));
        }
        renderGenericFile() {
            const { attachments } = this.props;
            if (!attachments || !attachments.length) {
                return;
            }
            const first = attachments[0];
            const { fileName, contentType } = first;
            const isGenericFile = !GoogleChrome.isVideoTypeSupported(contentType) &&
                !GoogleChrome.isImageTypeSupported(contentType) &&
                !MIME.isAudio(contentType);
            if (!isGenericFile) {
                return null;
            }
            return (react_1.default.createElement("div", { className: "module-quote__generic-file" },
                react_1.default.createElement("div", { className: "module-quote__generic-file__icon" }),
                react_1.default.createElement("div", { className: "module-quote__generic-file__text" }, fileName)));
        }
        renderIconContainer() {
            const { attachments, i18n } = this.props;
            if (!attachments || attachments.length === 0) {
                return null;
            }
            const first = attachments[0];
            const { contentType, thumbnail } = first;
            const objectUrl = getObjectUrl(thumbnail);
            if (GoogleChrome.isVideoTypeSupported(contentType)) {
                return objectUrl
                    ? this.renderImage(objectUrl, i18n, 'play')
                    : this.renderIcon('movie');
            }
            if (GoogleChrome.isImageTypeSupported(contentType)) {
                return objectUrl
                    ? this.renderImage(objectUrl, i18n)
                    : this.renderIcon('image');
            }
            if (MIME.isAudio(contentType)) {
                return this.renderIcon('microphone');
            }
            return null;
        }
        renderText() {
            const { i18n, text, attachments } = this.props;
            if (text) {
                return (react_1.default.createElement("div", { className: "module-quote__primary__text" },
                    react_1.default.createElement(MessageBody_1.MessageBody, { text: text, i18n: i18n })));
            }
            if (!attachments || attachments.length === 0) {
                return null;
            }
            const first = attachments[0];
            const { contentType, isVoiceMessage } = first;
            const typeLabel = getTypeLabel({ i18n, contentType, isVoiceMessage });
            if (typeLabel) {
                return (react_1.default.createElement("div", { className: "module-quote__primary__type-label" }, typeLabel));
            }
            return null;
        }
        renderClose() {
            const { onClose } = this.props;
            if (!onClose) {
                return null;
            }
            // We don't want the overall click handler for the quote to fire, so we stop
            //   propagation before handing control to the caller's callback.
            const onClick = (e) => {
                e.stopPropagation();
                onClose();
            };
            // We need the container to give us the flexibility to implement the iOS design.
            return (react_1.default.createElement("div", { className: "module-quote__close-container" },
                react_1.default.createElement("div", { className: "module-quote__close-button", role: "button", onClick: onClick })));
        }
        renderAuthor() {
            const { authorProfileName, authorTitle, i18n, isFromMe } = this.props;
            const authorProfileElement = authorProfileName ? (react_1.default.createElement("span", { className: "module-quote__primary__profile-name" },
                "~",
                react_1.default.createElement(Emojify_1.Emojify, { text: authorProfileName, i18n: i18n }))) : null;
            return (react_1.default.createElement("div", { className: "module-quote__primary__author" }, isFromMe ? (i18n('you')) : (react_1.default.createElement("span", null,
                react_1.default.createElement(Emojify_1.Emojify, { text: authorTitle, i18n: i18n }),
                " ",
                authorProfileElement))));
        }
        render() {
            const { color, isIncoming, onClick, withContentAbove } = this.props;
            if (!validateQuote(this.props)) {
                return null;
            }
            return (react_1.default.createElement("div", { onClick: onClick, role: "button", className: classnames_1.default('module-quote', isIncoming ? 'module-quote--incoming' : 'module-quote--outgoing', !isIncoming ? `module-quote--outgoing-${color}` : null, !onClick ? 'module-quote--no-click' : null, withContentAbove ? 'module-quote--with-content-above' : null) },
                react_1.default.createElement("div", { className: "module-quote__primary" },
                    this.renderAuthor(),
                    this.renderGenericFile(),
                    this.renderText()),
                this.renderIconContainer(),
                this.renderClose()));
        }
    }
    exports.Quote = Quote;
})();