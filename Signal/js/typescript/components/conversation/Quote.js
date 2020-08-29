(function () {
    "use strict";

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
            if (GoogleChrome.isVideoTypeSupported(contentType)) {
                return objectUrl
                    ? this.renderImage(objectUrl, 'play')
                    : this.renderIcon('movie');
            }
            if (GoogleChrome.isImageTypeSupported(contentType)) {
                return objectUrl
                    ? this.renderImage(objectUrl)
                    : this.renderIcon('image');
            }
            if (MIME.isAudio(contentType)) {
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
            if (GoogleChrome.isVideoTypeSupported(contentType)) {
                return react_1.default.createElement("div", { className: "type-label" }, i18n('video'));
            }
            if (GoogleChrome.isImageTypeSupported(contentType)) {
                return react_1.default.createElement("div", { className: "type-label" }, i18n('photo'));
            }
            if (MIME.isAudio(contentType) && isVoiceMessage) {
                return react_1.default.createElement("div", { className: "type-label" }, i18n('voiceMessage'));
            }
            if (MIME.isAudio(contentType)) {
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
        renderAuthor() {
            const { authorColor, authorProfileName, authorTitle, i18n, isFromMe, } = this.props;
            const authorProfileElement = authorProfileName
                ? react_1.default.createElement("span", { className: "profile-name" },
                    "~",
                    authorProfileName)
                : null;
            return (react_1.default.createElement("div", { className: classnames_1.default(authorColor, 'author') }, isFromMe
                ? i18n('you')
                : react_1.default.createElement("span", null,
                    authorTitle,
                    ' ',
                    authorProfileElement)));
        }
        render() {
            const { authorColor, onClick, isFromMe, } = this.props;
            if (!validateQuote(this.props)) {
                return null;
            }
            const classes = classnames_1.default(authorColor, 'quoted-message', isFromMe ? 'from-me' : null, !onClick ? 'no-click' : null);
            return (react_1.default.createElement("div", { onClick: onClick, className: classes },
                react_1.default.createElement("div", { className: "primary" },
                    this.renderIOSLabel(),
                    this.renderAuthor(),
                    this.renderText()),
                this.renderIconContainer(),
                this.renderClose()));
        }
    }
    exports.Quote = Quote;
})();