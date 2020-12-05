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
    const Avatar_1 = window.ts.components.Avatar;
    const MessageBody_1 = window.ts.components.conversation.MessageBody;
    const ExpireTimer_1 = window.ts.components.conversation.ExpireTimer;
    const ImageGrid_1 = window.ts.components.conversation.ImageGrid;
    const Timestamp_1 = window.ts.components.conversation.Timestamp;
    const ContactName_1 = window.ts.components.conversation.ContactName;
    const Quote_1 = window.ts.components.conversation.Quote;
    const EmbeddedContact_1 = window.ts.components.conversation.EmbeddedContact;
    const MIME = __importStar(window.ts.types.MIME);
    const isFileDangerous_1 = require_ts_util_isFileDangerous();
    const react_contextmenu_1 = window.react_contextmenu;
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
            const { attachments, collapseMetadata, direction, expirationLength, expirationTimestamp, i18n, status, text, timestamp, } = this.props;
            const { imageBroken } = this.state;
            if (collapseMetadata) {
                return null;
            }
            const canDisplayAttachment = canDisplayImage(attachments);
            const withImageNoCaption = Boolean(!text &&
                canDisplayAttachment &&
                !imageBroken &&
                ((ImageGrid_1.isImage(attachments) && ImageGrid_1.hasImage(attachments)) ||
                    (ImageGrid_1.isVideo(attachments) && ImageGrid_1.hasVideoScreenshot(attachments))));
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
            const { attachments, text, collapseMetadata, conversationType, direction, i18n, quote, onClickAttachment, } = this.props;
            const { imageBroken } = this.state;
            if (!attachments || !attachments[0]) {
                return null;
            }
            const firstAttachment = attachments[0];
            // For attachments which aren't full-frame
            const withContentBelow = Boolean(text);
            const withContentAbove = Boolean(quote) ||
                (conversationType === 'group' && direction === 'incoming');
            const displayImage = canDisplayImage(attachments);
            if (displayImage &&
                !imageBroken &&
                ((ImageGrid_1.isImage(attachments) && ImageGrid_1.hasImage(attachments)) ||
                    (ImageGrid_1.isVideo(attachments) && ImageGrid_1.hasVideoScreenshot(attachments)))) {
                return (react_1.default.createElement("div", {
                    className: classnames_1.default('module-message__attachment-container', withContentAbove
                        ? 'module-message__attachment-container--with-content-above'
                        : null, withContentBelow
                        ? 'module-message__attachment-container--with-content-below'
                        : null)
                },
                    react_1.default.createElement(ImageGrid_1.ImageGrid, { attachments: attachments, withContentAbove: withContentAbove, withContentBelow: withContentBelow, bottomOverlay: !collapseMetadata, i18n: i18n, onError: this.handleImageErrorBound, onClickAttachment: onClickAttachment })));
            }
            else if (isAudio(attachments)) {
                return (react_1.default.createElement("audio", {
                    controls: true, className: classnames_1.default('module-message__audio-attachment', withContentBelow
                        ? 'module-message__audio-attachment--with-content-below'
                        : null, withContentAbove
                        ? 'module-message__audio-attachment--with-content-above'
                        : null)
                },
                    react_1.default.createElement("source", { src: firstAttachment.url })));
            }
            else {
                const { fileName, fileSize, contentType } = firstAttachment;
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
            const { attachments, direction, disableMenu, onDownload, onReply, } = this.props;
            if (!isCorrectSide || disableMenu) {
                return null;
            }
            const fileName = attachments && attachments[0] ? attachments[0].fileName : null;
            const isDangerous = isFileDangerous_1.isFileDangerous(fileName || '');
            const multipleAttachments = attachments && attachments.length > 1;
            const downloadButton = !multipleAttachments && attachments && attachments[0] ? (react_1.default.createElement("div", {
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
            const { attachments, direction, status, onDelete, onDownload, onReply, onRetrySend, onShowDetail, i18n, } = this.props;
            const showRetry = status === 'error' && direction === 'outgoing';
            const fileName = attachments && attachments[0] ? attachments[0].fileName : null;
            const isDangerous = isFileDangerous_1.isFileDangerous(fileName || '');
            const multipleAttachments = attachments && attachments.length > 1;
            return (react_1.default.createElement(react_contextmenu_1.ContextMenu, { id: triggerId },
                !multipleAttachments && attachments && attachments[0] ? (react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    attributes: {
                        className: 'module-message__context__download',
                    }, onClick: () => {
                        if (onDownload) {
                            onDownload(isDangerous);
                        }
                    }
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
            const { attachments, authorPhoneNumber, authorColor, direction, id, timestamp, } = this.props;
            const { expired, expiring, imageBroken } = this.state;
            // This id is what connects our triple-dot click with our associated pop-up menu.
            //   It needs to be unique.
            const triggerId = String(id || `${authorPhoneNumber}-${timestamp}`);
            if (expired) {
                return null;
            }
            const displayImage = canDisplayImage(attachments);
            const showingImage = displayImage &&
                !imageBroken &&
                ((ImageGrid_1.isImage(attachments) && ImageGrid_1.hasImage(attachments)) ||
                    (ImageGrid_1.isVideo(attachments) && ImageGrid_1.hasVideoScreenshot(attachments)));
            const { width } = ImageGrid_1.getGridDimensions(attachments) || { width: undefined };
            return (react_1.default.createElement("div", {
                className: classnames_1.default('module-message', `module-message--${direction}`, expiring ? 'module-message--expired' : null), style: {
                    width: showingImage ? width : undefined,
                }
            },
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
    exports.getExtension = getExtension;
    function isAudio(attachments) {
        return (attachments &&
            attachments[0] &&
            attachments[0].contentType &&
            MIME.isAudio(attachments[0].contentType));
    }
    function canDisplayImage(attachments) {
        const { height, width } = attachments && attachments[0] ? attachments[0] : { height: 0, width: 0 };
        return (height &&
            height > 0 &&
            height <= 4096 &&
            width &&
            width > 0 &&
            width <= 4096);
    }
})();