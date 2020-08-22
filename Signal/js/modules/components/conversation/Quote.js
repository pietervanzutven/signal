(function () {
    "use strict";

    window.components = window.components || {};
    window.components.conversation = window.components.conversation || {};
    const exports = window.components.conversation.quote = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react.react);
    const classnames_1 = __importDefault(window.classnames);
    // @ts-ignore
    const mime_1 = __importDefault(window.types.mime);
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
    class Quote extends react_1.default.Component {
        renderImage(url, icon) {
            const iconElement = icon
                ? react_1.default.createElement("div", { className: classnames_1.default('icon', 'with-image', icon) })
                : null;
            return (react_1.default.createElement("div", { className: "icon-container" },
                react_1.default.createElement("div", { className: "inner" },
                    react_1.default.createElement("img", { src: url }),
                    iconElement)));
        }
        renderIcon(icon) {
            const { authorColor, isIncoming } = this.props;
            const backgroundColor = isIncoming ? 'white' : authorColor;
            const iconColor = isIncoming ? authorColor : 'white';
            return (react_1.default.createElement("div", { className: "icon-container" },
                react_1.default.createElement("div", { className: classnames_1.default('circle-background', backgroundColor) }),
                react_1.default.createElement("div", { className: classnames_1.default('icon', icon, iconColor) })));
        }
        renderIconContainer() {
            const { attachments } = this.props;
            if (!attachments || attachments.length === 0) {
                return null;
            }
            const first = attachments[0];
            const { contentType, thumbnail } = first;
            const objectUrl = getObjectUrl(thumbnail);
            if (mime_1.default.isVideo(contentType)) {
                return objectUrl
                    ? this.renderImage(objectUrl, 'play')
                    : this.renderIcon('movie');
            }
            if (mime_1.default.isImage(contentType)) {
                return objectUrl
                    ? this.renderImage(objectUrl)
                    : this.renderIcon('image');
            }
            if (mime_1.default.isAudio(contentType)) {
                return this.renderIcon('microphone');
            }
            return this.renderIcon('file');
        }
        renderText() {
            const { i18n, text, attachments } = this.props;
            if (text) {
                return react_1.default.createElement("div", { className: "text", dangerouslySetInnerHTML: { __html: text } });
            }
            if (!attachments || attachments.length === 0) {
                return null;
            }
            const first = attachments[0];
            const { contentType, fileName, isVoiceMessage } = first;
            if (mime_1.default.isVideo(contentType)) {
                return react_1.default.createElement("div", { className: "type-label" }, i18n('video'));
            }
            if (mime_1.default.isImage(contentType)) {
                return react_1.default.createElement("div", { className: "type-label" }, i18n('photo'));
            }
            if (mime_1.default.isAudio(contentType) && isVoiceMessage) {
                return react_1.default.createElement("div", { className: "type-label" }, i18n('voiceMessage'));
            }
            if (mime_1.default.isAudio(contentType)) {
                return react_1.default.createElement("div", { className: "type-label" }, i18n('audio'));
            }
            return react_1.default.createElement("div", { className: "filename-label" }, fileName);
        }
        renderIOSLabel() {
            const { i18n, isIncoming, isFromMe, authorTitle, authorProfileName } = this.props;
            const profileString = authorProfileName ? ` ~${authorProfileName}` : '';
            const authorName = `${authorTitle}${profileString}`;
            const label = isFromMe
                ? isIncoming
                    ? i18n('replyingToYou')
                    : i18n('replyingToYourself')
                : i18n('replyingTo', [authorName]);
            return react_1.default.createElement("div", { className: "ios-label" }, label);
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
            return (react_1.default.createElement("div", { className: "close-container" },
                react_1.default.createElement("div", { className: "close-button", onClick: onClick })));
        }
        render() {
            const { authorTitle, authorProfileName, authorColor, onClick, isFromMe, } = this.props;
            if (!validateQuote(this.props)) {
                return null;
            }
            const authorProfileElement = authorProfileName
                ? react_1.default.createElement("span", { className: "profile-name" },
                    "~",
                    authorProfileName)
                : null;
            const classes = classnames_1.default(authorColor, 'quoted-message', isFromMe ? 'from-me' : null, !onClick ? 'no-click' : null);
            return (react_1.default.createElement("div", { onClick: onClick, className: classes },
                react_1.default.createElement("div", { className: "primary" },
                    this.renderIOSLabel(),
                    react_1.default.createElement("div", { className: classnames_1.default(authorColor, 'author') },
                        authorTitle,
                        ' ',
                        authorProfileElement),
                    this.renderText()),
                this.renderIconContainer(),
                this.renderClose()));
        }
    }
    exports.Quote = Quote;
})();