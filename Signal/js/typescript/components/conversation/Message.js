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
    const GoogleChrome_1 = window.ts.util.GoogleChrome;
    const Avatar_1 = window.ts.components.Avatar;
    const MessageBody_1 = window.ts.components.conversation.MessageBody;
    const ExpireTimer_1 = window.ts.components.conversation.ExpireTimer;
    const Timestamp_1 = window.ts.components.conversation.Timestamp;
    const ContactName_1 = window.ts.components.conversation.ContactName;
    const Quote_1 = window.ts.components.conversation.Quote;
    const EmbeddedContact_1 = window.ts.components.conversation.EmbeddedContact;
    const isFileDangerous_1 = window.ts.util.isFileDangerous;
    const react_contextmenu_1 = window.react_contextmenu;
    const MIME = __importStar(window.ts.types.MIME);
    function isImage(attachment) {
        return (attachment &&
            attachment.contentType &&
            GoogleChrome_1.isImageTypeSupported(attachment.contentType));
    }
    function hasImage(attachment) {
        return attachment && attachment.url;
    }
    function isVideo(attachment) {
        return (attachment &&
            attachment.contentType &&
            GoogleChrome_1.isVideoTypeSupported(attachment.contentType));
    }
    function hasVideoScreenshot(attachment) {
        return attachment && attachment.screenshot && attachment.screenshot.url;
    }
    function isAudio(attachment) {
        return (attachment && attachment.contentType && MIME.isAudio(attachment.contentType));
    }
    function canDisplayImage(attachment) {
        const { height, width } = attachment || { height: 0, width: 0 };
        return height > 0 && height <= 4096 && width > 0 && width <= 4096;
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
    const MINIMUM_IMG_HEIGHT = 150;
    const MAXIMUM_IMG_HEIGHT = 300;
    const EXPIRATION_CHECK_MINIMUM = 2000;
    const EXPIRED_DELAY = 600;
    class Message extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.captureMenuTriggerBound = this.captureMenuTrigger.bind(this);
            this.showMenuBound = this.showMenu.bind(this);
            this.handleImageErrorBound = this.handleImageError.bind(this);
            this.menuTriggerRef = null;
            this.expirationCheckInterval = null;
            this.expiredTimeout = null;
            this.state = {
                expiring: false,
                expired: false,
                imageBroken: false,
            };
        }
        componentDidMount() {
            const { expirationLength } = this.props;
            if (!expirationLength) {
                return;
            }
            const increment = ExpireTimer_1.getIncrement(expirationLength);
            const checkFrequency = Math.max(EXPIRATION_CHECK_MINIMUM, increment);
            this.checkExpired();
            this.expirationCheckInterval = setInterval(() => {
                this.checkExpired();
            }, checkFrequency);
        }
        componentWillUnmount() {
            if (this.expirationCheckInterval) {
                clearInterval(this.expirationCheckInterval);
            }
            if (this.expiredTimeout) {
                clearTimeout(this.expiredTimeout);
            }
        }
        componentDidUpdate() {
            this.checkExpired();
        }
        checkExpired() {
            const now = Date.now();
            const { isExpired, expirationTimestamp, expirationLength } = this.props;
            if (!expirationTimestamp || !expirationLength) {
                return;
            }
            if (this.expiredTimeout) {
                return;
            }
            if (isExpired || now >= expirationTimestamp) {
                this.setState({
                    expiring: true,
                });
                const setExpired = () => {
                    this.setState({
                        expired: true,
                    });
                };
                this.expiredTimeout = setTimeout(setExpired, EXPIRED_DELAY);
            }
        }
        handleImageError() {
            // tslint:disable-next-line no-console
            console.log('Message: Image failed to load; failing over to placeholder');
            this.setState({
                imageBroken: true,
            });
        }
        renderMetadata() {
            const { attachment, collapseMetadata, direction, expirationLength, expirationTimestamp, i18n, status, text, timestamp, } = this.props;
            const { imageBroken } = this.state;
            if (collapseMetadata) {
                return null;
            }
            const canDisplayAttachment = canDisplayImage(attachment);
            const withImageNoCaption = Boolean(!text &&
                canDisplayAttachment &&
                !imageBroken &&
                ((isImage(attachment) && hasImage(attachment)) ||
                    (isVideo(attachment) && hasVideoScreenshot(attachment))));
            const showError = status === 'error' && direction === 'outgoing';
            return (react_1.default.createElement("div", {
                className: classnames_1.default('module-message__metadata', withImageNoCaption
                    ? 'module-message__metadata--with-image-no-caption'
                    : null)
            },
                showError ? (react_1.default.createElement("span", {
                    className: classnames_1.default('module-message__metadata__date', `module-message__metadata__date--${direction}`, withImageNoCaption
                        ? 'module-message__metadata__date--with-image-no-caption'
                        : null)
                }, i18n('sendFailed'))) : (react_1.default.createElement(Timestamp_1.Timestamp, { i18n: i18n, timestamp: timestamp, extended: true, direction: direction, withImageNoCaption: withImageNoCaption, module: "module-message__metadata__date" })),
                expirationLength && expirationTimestamp ? (react_1.default.createElement(ExpireTimer_1.ExpireTimer, { direction: direction, expirationLength: expirationLength, expirationTimestamp: expirationTimestamp, withImageNoCaption: withImageNoCaption })) : null,
                react_1.default.createElement("span", { className: "module-message__metadata__spacer" }),
                direction === 'outgoing' && status !== 'error' ? (react_1.default.createElement("div", {
                    className: classnames_1.default('module-message__metadata__status-icon', `module-message__metadata__status-icon--${status}`, withImageNoCaption
                        ? 'module-message__metadata__status-icon--with-image-no-caption'
                        : null)
                })) : null));
        }
        renderAuthor() {
            const { authorName, authorPhoneNumber, authorProfileName, conversationType, direction, i18n, } = this.props;
            const title = authorName ? authorName : authorPhoneNumber;
            if (direction !== 'incoming' || conversationType !== 'group' || !title) {
                return null;
            }
            return (react_1.default.createElement("div", { className: "module-message__author" },
                react_1.default.createElement(ContactName_1.ContactName, { phoneNumber: authorPhoneNumber, name: authorName, profileName: authorProfileName, module: "module-message__author", i18n: i18n })));
        }
        // tslint:disable-next-line max-func-body-length cyclomatic-complexity
        renderAttachment() {
            const { i18n, attachment, text, collapseMetadata, conversationType, direction, quote, onClickAttachment, } = this.props;
            const { imageBroken } = this.state;
            if (!attachment) {
                return null;
            }
            const withCaption = Boolean(text);
            // For attachments which aren't full-frame
            const withContentBelow = withCaption || !collapseMetadata;
            const withContentAbove = quote || (conversationType === 'group' && direction === 'incoming');
            const displayImage = canDisplayImage(attachment);
            if (isImage(attachment) && displayImage && !imageBroken && attachment.url) {
                // Calculating height to prevent reflow when image loads
                const imageHeight = Math.max(MINIMUM_IMG_HEIGHT, attachment.height || 0);
                return (react_1.default.createElement("div", {
                    onClick: onClickAttachment, role: "button", className: classnames_1.default('module-message__attachment-container', withCaption
                        ? 'module-message__attachment-container--with-content-below'
                        : null, withContentAbove
                        ? 'module-message__attachment-container--with-content-above'
                        : null)
                },
                    react_1.default.createElement("img", { onError: this.handleImageErrorBound, className: "module-message__img-attachment", height: Math.min(MAXIMUM_IMG_HEIGHT, imageHeight), src: attachment.url, alt: i18n('imageAttachmentAlt') }),
                    react_1.default.createElement("div", {
                        className: classnames_1.default('module-message__img-border-overlay', withCaption
                            ? 'module-message__img-border-overlay--with-content-below'
                            : null, withContentAbove
                            ? 'module-message__img-border-overlay--with-content-above'
                            : null)
                    }),
                    !withCaption && !collapseMetadata ? (react_1.default.createElement("div", { className: "module-message__img-overlay" })) : null));
            }
            else if (isVideo(attachment) &&
                displayImage &&
                !imageBroken &&
                attachment.screenshot &&
                attachment.screenshot.url) {
                const { screenshot } = attachment;
                // Calculating height to prevent reflow when image loads
                const imageHeight = Math.max(MINIMUM_IMG_HEIGHT, attachment.screenshot.height || 0);
                return (react_1.default.createElement("div", {
                    onClick: onClickAttachment, role: "button", className: classnames_1.default('module-message__attachment-container', withCaption
                        ? 'module-message__attachment-container--with-content-below'
                        : null, withContentAbove
                        ? 'module-message__attachment-container--with-content-above'
                        : null)
                },
                    react_1.default.createElement("img", { onError: this.handleImageErrorBound, className: "module-message__img-attachment", alt: i18n('videoAttachmentAlt'), height: Math.min(MAXIMUM_IMG_HEIGHT, imageHeight), src: screenshot.url }),
                    react_1.default.createElement("div", {
                        className: classnames_1.default('module-message__img-border-overlay', withCaption
                            ? 'module-message__img-border-overlay--with-content-below'
                            : null, withContentAbove
                            ? 'module-message__img-border-overlay--with-content-above'
                            : null)
                    }),
                    !withCaption && !collapseMetadata ? (react_1.default.createElement("div", { className: "module-message__img-overlay" })) : null,
                    react_1.default.createElement("div", { className: "module-message__video-overlay__circle" },
                        react_1.default.createElement("div", { className: "module-message__video-overlay__play-icon" }))));
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
                const isDangerous = isFileDangerous_1.isFileDangerous(fileName || '');
                return (react_1.default.createElement("div", {
                    className: classnames_1.default('module-message__generic-attachment', withContentBelow
                        ? 'module-message__generic-attachment--with-content-below'
                        : null, withContentAbove
                        ? 'module-message__generic-attachment--with-content-above'
                        : null)
                },
                    react_1.default.createElement("div", { className: "module-message__generic-attachment__icon-container" },
                        react_1.default.createElement("div", { className: "module-message__generic-attachment__icon" }, extension ? (react_1.default.createElement("div", { className: "module-message__generic-attachment__icon__extension" }, extension)) : null),
                        isDangerous ? (react_1.default.createElement("div", { className: "module-message__generic-attachment__icon-dangerous-container" },
                            react_1.default.createElement("div", { className: "module-message__generic-attachment__icon-dangerous" }))) : null),
                    react_1.default.createElement("div", { className: "module-message__generic-attachment__text" },
                        react_1.default.createElement("div", { className: classnames_1.default('module-message__generic-attachment__file-name', `module-message__generic-attachment__file-name--${direction}`) }, fileName),
                        react_1.default.createElement("div", { className: classnames_1.default('module-message__generic-attachment__file-size', `module-message__generic-attachment__file-size--${direction}`) }, fileSize))));
            }
        }
        renderQuote() {
            const { conversationType, authorColor, direction, i18n, quote, } = this.props;
            if (!quote) {
                return null;
            }
            const withContentAbove = conversationType === 'group' && direction === 'incoming';
            const quoteColor = direction === 'incoming' ? authorColor : quote.authorColor;
            return (react_1.default.createElement(Quote_1.Quote, { i18n: i18n, onClick: quote.onClick, text: quote.text, attachment: quote.attachment, isIncoming: direction === 'incoming', authorPhoneNumber: quote.authorPhoneNumber, authorProfileName: quote.authorProfileName, authorName: quote.authorName, authorColor: quoteColor, referencedMessageNotFound: quote.referencedMessageNotFound, isFromMe: quote.isFromMe, withContentAbove: withContentAbove }));
        }
        renderEmbeddedContact() {
            const { collapseMetadata, contact, conversationType, direction, i18n, text, } = this.props;
            if (!contact) {
                return null;
            }
            const withCaption = Boolean(text);
            const withContentAbove = conversationType === 'group' && direction === 'incoming';
            const withContentBelow = withCaption || !collapseMetadata;
            return (react_1.default.createElement(EmbeddedContact_1.EmbeddedContact, { contact: contact, hasSignalAccount: contact.hasSignalAccount, isIncoming: direction === 'incoming', i18n: i18n, onClick: contact.onClick, withContentAbove: withContentAbove, withContentBelow: withContentBelow }));
        }
        renderSendMessageButton() {
            const { contact, i18n } = this.props;
            if (!contact || !contact.hasSignalAccount) {
                return null;
            }
            return (react_1.default.createElement("div", { role: "button", onClick: contact.onSendMessage, className: "module-message__send-message-button" }, i18n('sendMessageToContact')));
        }
        renderAvatar() {
            const { authorAvatarPath, authorName, authorPhoneNumber, authorProfileName, collapseMetadata, authorColor, conversationType, direction, i18n, } = this.props;
            if (collapseMetadata ||
                conversationType !== 'group' ||
                direction === 'outgoing') {
                return;
            }
            return (react_1.default.createElement("div", { className: "module-message__author-avatar" },
                react_1.default.createElement(Avatar_1.Avatar, { avatarPath: authorAvatarPath, color: authorColor, conversationType: "direct", i18n: i18n, name: authorName, phoneNumber: authorPhoneNumber, profileName: authorProfileName, size: 36 })));
        }
        renderText() {
            const { text, i18n, direction, status } = this.props;
            const contents = direction === 'incoming' && status === 'error'
                ? i18n('incomingError')
                : text;
            if (!contents) {
                return null;
            }
            return (react_1.default.createElement("div", {
                dir: "auto", className: classnames_1.default('module-message__text', `module-message__text--${direction}`, status === 'error' && direction === 'incoming'
                    ? 'module-message__text--error'
                    : null)
            },
                react_1.default.createElement(MessageBody_1.MessageBody, { text: contents || '', i18n: i18n })));
        }
        renderError(isCorrectSide) {
            const { status, direction } = this.props;
            if (!isCorrectSide || status !== 'error') {
                return null;
            }
            return (react_1.default.createElement("div", { className: "module-message__error-container" },
                react_1.default.createElement("div", { className: classnames_1.default('module-message__error', `module-message__error--${direction}`) })));
        }
        captureMenuTrigger(triggerRef) {
            this.menuTriggerRef = triggerRef;
        }
        showMenu(event) {
            if (this.menuTriggerRef) {
                this.menuTriggerRef.handleContextClick(event);
            }
        }
        renderMenu(isCorrectSide, triggerId) {
            const { attachment, direction, disableMenu, onDownload, onReply, } = this.props;
            if (!isCorrectSide || disableMenu) {
                return null;
            }
            const fileName = attachment ? attachment.fileName : null;
            const isDangerous = isFileDangerous_1.isFileDangerous(fileName || '');
            const downloadButton = attachment ? (react_1.default.createElement("div", {
                onClick: () => {
                    if (onDownload) {
                        onDownload(isDangerous);
                    }
                }, role: "button", className: classnames_1.default('module-message__buttons__download', `module-message__buttons__download--${direction}`)
            })) : null;
            const replyButton = (react_1.default.createElement("div", { onClick: onReply, role: "button", className: classnames_1.default('module-message__buttons__reply', `module-message__buttons__download--${direction}`) }));
            const menuButton = (react_1.default.createElement(react_contextmenu_1.ContextMenuTrigger, { id: triggerId, ref: this.captureMenuTriggerBound },
                react_1.default.createElement("div", { role: "button", onClick: this.showMenuBound, className: classnames_1.default('module-message__buttons__menu', `module-message__buttons__download--${direction}`) })));
            const first = direction === 'incoming' ? downloadButton : menuButton;
            const last = direction === 'incoming' ? menuButton : downloadButton;
            return (react_1.default.createElement("div", { className: classnames_1.default('module-message__buttons', `module-message__buttons--${direction}`) },
                first,
                replyButton,
                last));
        }
        renderContextMenu(triggerId) {
            const { attachment, direction, status, onDelete, onDownload, onReply, onRetrySend, onShowDetail, i18n, } = this.props;
            const showRetry = status === 'error' && direction === 'outgoing';
            return (react_1.default.createElement(react_contextmenu_1.ContextMenu, { id: triggerId },
                attachment ? (react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    attributes: {
                        className: 'module-message__context__download',
                    }, onClick: onDownload
                }, i18n('downloadAttachment'))) : null,
                react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    attributes: {
                        className: 'module-message__context__reply',
                    }, onClick: onReply
                }, i18n('replyToMessage')),
                react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    attributes: {
                        className: 'module-message__context__more-info',
                    }, onClick: onShowDetail
                }, i18n('moreInfo')),
                showRetry ? (react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    attributes: {
                        className: 'module-message__context__retry-send',
                    }, onClick: onRetrySend
                }, i18n('retrySend'))) : null,
                react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    attributes: {
                        className: 'module-message__context__delete-message',
                    }, onClick: onDelete
                }, i18n('deleteMessage'))));
        }
        render() {
            const { authorPhoneNumber, authorColor, direction, id, timestamp, } = this.props;
            const { expired, expiring } = this.state;
            // This id is what connects our triple-dot click with our associated pop-up menu.
            //   It needs to be unique.
            const triggerId = String(id || `${authorPhoneNumber}-${timestamp}`);
            if (expired) {
                return null;
            }
            return (react_1.default.createElement("div", { className: classnames_1.default('module-message', `module-message--${direction}`, expiring ? 'module-message--expired' : null) },
                this.renderError(direction === 'incoming'),
                this.renderMenu(direction === 'outgoing', triggerId),
                react_1.default.createElement("div", {
                    className: classnames_1.default('module-message__container', `module-message__container--${direction}`, direction === 'incoming'
                        ? `module-message__container--incoming-${authorColor}`
                        : null)
                },
                    this.renderAuthor(),
                    this.renderQuote(),
                    this.renderAttachment(),
                    this.renderEmbeddedContact(),
                    this.renderText(),
                    this.renderMetadata(),
                    this.renderSendMessageButton(),
                    this.renderAvatar()),
                this.renderError(direction === 'outgoing'),
                this.renderMenu(direction === 'incoming', triggerId),
                this.renderContextMenu(triggerId)));
        }
    }
    exports.Message = Message;
})();