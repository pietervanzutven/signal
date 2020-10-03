(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.Message = {};

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
    const moment_1 = __importDefault(window.moment);
    const lodash_1 = window.lodash;
    const formatRelativeTime_1 = window.ts.util.formatRelativeTime;
    const GoogleChrome_1 = window.ts.util.GoogleChrome;
    const Emojify_1 = window.ts.components.conversation.Emojify;
    const Quote_1 = window.ts.components.conversation.Quote;
    const EmbeddedContact_1 = window.ts.components.conversation.EmbeddedContact;
    const MIME = __importStar(window.ts.types.MIME);
    function isImage(attachment) {
        return (attachment &&
            attachment.contentType &&
            GoogleChrome_1.isImageTypeSupported(attachment.contentType));
    }
    function isVideo(attachment) {
        return (attachment &&
            attachment.contentType &&
            GoogleChrome_1.isVideoTypeSupported(attachment.contentType));
    }
    function isAudio(attachment) {
        return (attachment && attachment.contentType && MIME.isAudio(attachment.contentType));
    }
    function getTimerBucket(expiration, length) {
        const delta = expiration - Date.now();
        if (delta < 0) {
            return '00';
        }
        if (delta > length) {
            return '60';
        }
        const increment = Math.round(delta / length * 12);
        return lodash_1.padStart(String(increment * 5), 2, '0');
    }
    function getExtension({ fileName, contentType, }) {
        if (fileName && fileName.indexOf('.') >= 0) {
            const lastPeriod = fileName.lastIndexOf('.');
            const extension = fileName.slice(lastPeriod + 1);
            if (extension.length) {
                return extension;
            }
        }
        const slash = contentType.indexOf('/');
        if (slash >= 0) {
            return contentType.slice(slash + 1);
        }
        return null;
    }
    class Message extends react_1.default.Component {
        renderTimer() {
            const { attachment, direction, expirationLength, expirationTimestamp, text, } = this.props;
            if (!expirationLength || !expirationTimestamp) {
                return null;
            }
            const withImageNoCaption = !text && isImage(attachment);
            const bucket = getTimerBucket(expirationTimestamp, expirationLength);
            return (react_1.default.createElement("div", {
                className: classnames_1.default('module-message__metadata__timer', `module-message__metadata__timer--${bucket}`, `module-message__metadata__timer--${direction}`, withImageNoCaption
                    ? 'module-message__metadata__timer--with-image-no-caption'
                    : null)
            }));
        }
        renderMetadata() {
            const { collapseMetadata, color, direction, i18n, status, timestamp, text, attachment, } = this.props;
            if (collapseMetadata) {
                return null;
            }
            // We're not showing metadata on top of videos since they still have native controls
            if (!text && isVideo(attachment)) {
                return null;
            }
            const withImageNoCaption = !text && isImage(attachment);
            return (react_1.default.createElement("div", {
                className: classnames_1.default('module-message__metadata', withImageNoCaption
                    ? 'module-message__metadata--with-image-no-caption'
                    : null)
            },
                react_1.default.createElement("span", {
                    className: classnames_1.default('module-message__metadata__date', `module-message__metadata__date--${direction}`, withImageNoCaption
                        ? 'module-message__metadata__date--with-image-no-caption'
                        : null), title: moment_1.default(timestamp).format('llll')
                }, formatRelativeTime_1.formatRelativeTime(timestamp, { i18n, extended: true })),
                this.renderTimer(),
                react_1.default.createElement("span", { className: "module-message__metadata__spacer" }),
                direction === 'outgoing' ? (react_1.default.createElement("div", {
                    className: classnames_1.default('module-message__metadata__status-icon', `module-message__metadata__status-icon-${status}`, status === 'read'
                        ? `module-message__metadata__status-icon-${color}`
                        : null, withImageNoCaption
                        ? 'module-message__metadata__status-icon--with-image-no-caption'
                        : null, withImageNoCaption && status === 'read'
                        ? 'module-message__metadata__status-icon--read-with-image-no-caption'
                        : null)
                })) : null));
        }
        renderAuthor() {
            const { authorName, conversationType, direction, i18n, authorPhoneNumber, authorProfileName, } = this.props;
            const title = authorName ? authorName : authorPhoneNumber;
            if (direction !== 'incoming' || conversationType !== 'group' || !title) {
                return null;
            }
            const profileElement = authorProfileName && !authorName ? (react_1.default.createElement("span", { className: "module-message__author__profile-name" },
                "~",
                react_1.default.createElement(Emojify_1.Emojify, { text: authorProfileName, i18n: i18n }))) : null;
            return (react_1.default.createElement("div", { className: "module-message__author" },
                react_1.default.createElement(Emojify_1.Emojify, { text: title, i18n: i18n }),
                " ",
                profileElement));
        }
        // tslint:disable-next-line max-func-body-length
        renderAttachment() {
            const { i18n, attachment, text, collapseMetadata, conversationType, direction, quote, onClickAttachment, } = this.props;
            if (!attachment) {
                return null;
            }
            const withCaption = Boolean(text);
            // For attachments which aren't full-frame
            const withContentBelow = withCaption || !collapseMetadata;
            const withContentAbove = quote || (conversationType === 'group' && direction === 'incoming');
            if (isImage(attachment)) {
                return (react_1.default.createElement("div", { className: "module-message__attachment-container" },
                    react_1.default.createElement("img", {
                        className: classnames_1.default('module-message__img-attachment', withCaption
                            ? 'module-message__img-attachment--with-content-below'
                            : null, withContentAbove
                            ? 'module-message__img-attachment--with-content-above'
                            : null), src: attachment.url, alt: i18n('imageAttachmentAlt'), onClick: onClickAttachment
                    }),
                    !withCaption && !collapseMetadata ? (react_1.default.createElement("div", { className: "module-message__img-overlay" })) : null));
            }
            else if (isVideo(attachment)) {
                return (react_1.default.createElement("video", {
                    controls: true, className: classnames_1.default('module-message__img-attachment', withCaption
                        ? 'module-message__img-attachment--with-content-below'
                        : null, withContentAbove
                        ? 'module-message__img-attachment--with-content-above'
                        : null)
                },
                    react_1.default.createElement("source", { src: attachment.url })));
            }
            else if (isAudio(attachment)) {
                return (react_1.default.createElement("audio", {
                    controls: true, className: classnames_1.default('module-message__audio-attachment', withContentBelow
                        ? 'module-message__audio-attachment--with-content-below'
                        : null, withContentAbove
                        ? 'module-message__audio-attachment--with-content-above'
                        : null)
                },
                    react_1.default.createElement("source", { src: attachment.url })));
            }
            else {
                const { fileName, fileSize, contentType } = attachment;
                const extension = getExtension({ contentType, fileName });
                return (react_1.default.createElement("div", {
                    className: classnames_1.default('module-message__generic-attachment', withContentBelow
                        ? 'module-message__generic-attachment--with-content-below'
                        : null, withContentAbove
                        ? 'module-message__generic-attachment--with-content-above'
                        : null)
                },
                    react_1.default.createElement("div", { className: "module-message__generic-attachment__icon" }, extension ? (react_1.default.createElement("div", { className: "module-message__generic-attachment__icon__extension" }, extension)) : null),
                    react_1.default.createElement("div", { className: "module-message__generic-attachment__text" },
                        react_1.default.createElement("div", { className: classnames_1.default('module-message__generic-attachment__file-name', `module-message__generic-attachment__file-name--${direction}`) }, fileName),
                        react_1.default.createElement("div", { className: classnames_1.default('module-message__generic-attachment__file-size', `module-message__generic-attachment__file-size--${direction}`) }, fileSize))));
            }
        }
        renderQuote() {
            const { color, conversationType, direction, i18n, onClickQuote, quote, } = this.props;
            if (!quote) {
                return null;
            }
            const authorTitle = quote.authorName
                ? quote.authorName
                : quote.authorPhoneNumber;
            const authorProfileName = !quote.authorName
                ? quote.authorProfileName
                : undefined;
            const withContentAbove = conversationType === 'group' && direction === 'incoming';
            return (react_1.default.createElement(Quote_1.Quote, { i18n: i18n, onClick: onClickQuote, color: color, text: quote.text, attachments: quote.attachments, isIncoming: direction === 'incoming', authorTitle: authorTitle || '', authorProfileName: authorProfileName, isFromMe: quote.isFromMe, withContentAbove: withContentAbove }));
        }
        renderEmbeddedContact() {
            const { collapseMetadata, contactHasSignalAccount, contacts, conversationType, direction, i18n, onClickContact, onSendMessageToContact, text, } = this.props;
            const first = contacts && contacts[0];
            if (!first) {
                return null;
            }
            const withCaption = Boolean(text);
            const withContentAbove = conversationType === 'group' && direction === 'incoming';
            const withContentBelow = withCaption || !collapseMetadata;
            return (react_1.default.createElement(EmbeddedContact_1.EmbeddedContact, { contact: first, hasSignalAccount: contactHasSignalAccount, isIncoming: direction === 'incoming', i18n: i18n, onSendMessage: onSendMessageToContact, onClickContact: onClickContact, withContentAbove: withContentAbove, withContentBelow: withContentBelow }));
        }
        renderSendMessageButton() {
            const { contactHasSignalAccount, contacts, i18n, onSendMessageToContact, } = this.props;
            const first = contacts && contacts[0];
            if (!first || !contactHasSignalAccount) {
                return null;
            }
            return (react_1.default.createElement("div", { role: "button", onClick: onSendMessageToContact, className: "module-message__send-message-button" }, i18n('sendMessageToContact')));
        }
        renderAvatar() {
            const { authorName, authorPhoneNumber, authorProfileName, authorAvatarPath, collapseMetadata, color, conversationType, direction, i18n, } = this.props;
            const title = `${authorName || authorPhoneNumber}${!authorName && authorProfileName ? ` ~${authorProfileName}` : ''}`;
            if (collapseMetadata ||
                conversationType !== 'group' ||
                direction === 'outgoing') {
                return;
            }
            if (!authorAvatarPath) {
                return (react_1.default.createElement("div", { className: classnames_1.default('module-message__author-default-avatar', `module-message__author-default-avatar--${color}`) },
                    react_1.default.createElement("div", { className: "module-message__author-default-avatar__label" }, "#")));
            }
            return (react_1.default.createElement("div", { className: "module-message__author-avatar" },
                react_1.default.createElement("img", { alt: i18n('contactAvatarAlt', [title]), src: authorAvatarPath })));
        }
        renderText() {
            const { text, i18n, direction } = this.props;
            if (!text) {
                return null;
            }
            return (react_1.default.createElement("div", { className: classnames_1.default('module-message__text', `module-message__text--${direction}`) },
                react_1.default.createElement(MessageBody_1.MessageBody, { text: text || '', i18n: i18n })));
        }
        render() {
            const { attachment, color, conversationType, direction, id, quote, text, } = this.props;
            const imageAndNothingElse = !text && isImage(attachment) && conversationType !== 'group' && !quote;
            return (react_1.default.createElement("li", null,
                react_1.default.createElement("div", {
                    id: id, className: classnames_1.default('module-message', `module-message--${direction}`, imageAndNothingElse ? 'module-message--with-image-only' : null, direction === 'incoming'
                        ? `module-message--incoming-${color}`
                        : null)
                },
                    this.renderAuthor(),
                    this.renderQuote(),
                    this.renderAttachment(),
                    this.renderEmbeddedContact(),
                    this.renderText(),
                    this.renderMetadata(),
                    this.renderSendMessageButton(),
                    this.renderAvatar())));
        }
    }
    exports.Message = Message;
})();