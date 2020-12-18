(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.Message = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const Avatar_1 = window.ts.components.Avatar;
    const Spinner_1 = window.ts.components.Spinner;
    const MessageBody_1 = window.ts.components.conversation.MessageBody;
    const ExpireTimer_1 = window.ts.components.conversation.ExpireTimer;
    const ImageGrid_1 = window.ts.components.conversation.ImageGrid;
    const Image_1 = window.ts.components.conversation.Image;
    const Timestamp_1 = window.ts.components.conversation.Timestamp;
    const ContactName_1 = window.ts.components.conversation.ContactName;
    const Quote_1 = window.ts.components.conversation.Quote;
    const EmbeddedContact_1 = window.ts.components.conversation.EmbeddedContact;
    const Attachment_1 = window.ts.types.Attachment;
    const timer_1 = window.ts.util.timer;
    const isFileDangerous_1 = require_ts_util_isFileDangerous();
    const react_contextmenu_1 = window.react_contextmenu;
    // Same as MIN_WIDTH in ImageGrid.tsx
    const MINIMUM_LINK_PREVIEW_IMAGE_WIDTH = 200;
    const EXPIRATION_CHECK_MINIMUM = 2000;
    const EXPIRED_DELAY = 600;
    class Message extends react_1.default.PureComponent {
        constructor(props) {
            super(props);
            this.captureMenuTriggerBound = this.captureMenuTrigger.bind(this);
            this.showMenuBound = this.showMenu.bind(this);
            this.handleImageErrorBound = this.handleImageError.bind(this);
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
            const increment = timer_1.getIncrement(expirationLength);
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
            const { collapseMetadata, direction, expirationLength, expirationTimestamp, i18n, status, text, textPending, timestamp, } = this.props;
            if (collapseMetadata) {
                return null;
            }
            const isShowingImage = this.isShowingImage();
            const withImageNoCaption = Boolean(!text && isShowingImage);
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
                textPending ? (react_1.default.createElement("div", { className: "module-message__metadata__spinner-container" },
                    react_1.default.createElement(Spinner_1.Spinner, { size: "mini", direction: direction }))) : null,
                !textPending && direction === 'outgoing' && status !== 'error' ? (react_1.default.createElement("div", {
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
            const displayImage = Attachment_1.canDisplayImage(attachments);
            if (displayImage &&
                !imageBroken &&
                ((Attachment_1.isImage(attachments) && Attachment_1.hasImage(attachments)) ||
                    (Attachment_1.isVideo(attachments) && Attachment_1.hasVideoScreenshot(attachments)))) {
                return (react_1.default.createElement("div", {
                    className: classnames_1.default('module-message__attachment-container', withContentAbove
                        ? 'module-message__attachment-container--with-content-above'
                        : null, withContentBelow
                        ? 'module-message__attachment-container--with-content-below'
                        : null)
                },
                    react_1.default.createElement(ImageGrid_1.ImageGrid, { attachments: attachments, withContentAbove: withContentAbove, withContentBelow: withContentBelow, bottomOverlay: !collapseMetadata, i18n: i18n, onError: this.handleImageErrorBound, onClickAttachment: onClickAttachment })));
            }
            else if (!firstAttachment.pending && Attachment_1.isAudio(attachments)) {
                return (react_1.default.createElement("audio", {
                    controls: true, className: classnames_1.default('module-message__audio-attachment', withContentBelow
                        ? 'module-message__audio-attachment--with-content-below'
                        : null, withContentAbove
                        ? 'module-message__audio-attachment--with-content-above'
                        : null), key: firstAttachment.url
                },
                    react_1.default.createElement("source", { src: firstAttachment.url })));
            }
            else {
                const { pending, fileName, fileSize, contentType } = firstAttachment;
                const extension = Attachment_1.getExtensionForDisplay({ contentType, fileName });
                const isDangerous = isFileDangerous_1.isFileDangerous(fileName || '');
                return (react_1.default.createElement("div", {
                    className: classnames_1.default('module-message__generic-attachment', withContentBelow
                        ? 'module-message__generic-attachment--with-content-below'
                        : null, withContentAbove
                        ? 'module-message__generic-attachment--with-content-above'
                        : null)
                },
                    pending ? (react_1.default.createElement("div", { className: "module-message__generic-attachment__spinner-container" },
                        react_1.default.createElement(Spinner_1.Spinner, { size: "small", direction: direction }))) : (react_1.default.createElement("div", { className: "module-message__generic-attachment__icon-container" },
                            react_1.default.createElement("div", { className: "module-message__generic-attachment__icon" }, extension ? (react_1.default.createElement("div", { className: "module-message__generic-attachment__icon__extension" }, extension)) : null),
                            isDangerous ? (react_1.default.createElement("div", { className: "module-message__generic-attachment__icon-dangerous-container" },
                                react_1.default.createElement("div", { className: "module-message__generic-attachment__icon-dangerous" }))) : null)),
                    react_1.default.createElement("div", { className: "module-message__generic-attachment__text" },
                        react_1.default.createElement("div", { className: classnames_1.default('module-message__generic-attachment__file-name', `module-message__generic-attachment__file-name--${direction}`) }, fileName),
                        react_1.default.createElement("div", { className: classnames_1.default('module-message__generic-attachment__file-size', `module-message__generic-attachment__file-size--${direction}`) }, fileSize))));
            }
        }
        // tslint:disable-next-line cyclomatic-complexity
        renderPreview() {
            const { attachments, conversationType, direction, i18n, onClickLinkPreview, previews, quote, } = this.props;
            // Attachments take precedence over Link Previews
            if (attachments && attachments.length) {
                return null;
            }
            if (!previews || previews.length < 1) {
                return null;
            }
            const first = previews[0];
            if (!first) {
                return null;
            }
            const withContentAbove = Boolean(quote) ||
                (conversationType === 'group' && direction === 'incoming');
            const previewHasImage = first.image && Attachment_1.isImageAttachment(first.image);
            const width = first.image && first.image.width;
            const isFullSizeImage = width && width >= MINIMUM_LINK_PREVIEW_IMAGE_WIDTH;
            return (react_1.default.createElement("div", {
                role: "button", className: classnames_1.default('module-message__link-preview', withContentAbove
                    ? 'module-message__link-preview--with-content-above'
                    : null), onClick: () => {
                        if (onClickLinkPreview) {
                            onClickLinkPreview(first.url);
                        }
                    }
            },
                first.image && previewHasImage && isFullSizeImage ? (react_1.default.createElement(ImageGrid_1.ImageGrid, { attachments: [first.image], withContentAbove: withContentAbove, withContentBelow: true, onError: this.handleImageErrorBound, i18n: i18n })) : null,
                react_1.default.createElement("div", {
                    className: classnames_1.default('module-message__link-preview__content', withContentAbove || isFullSizeImage
                        ? 'module-message__link-preview__content--with-content-above'
                        : null)
                },
                    first.image && previewHasImage && !isFullSizeImage ? (react_1.default.createElement("div", { className: "module-message__link-preview__icon_container" },
                        react_1.default.createElement(Image_1.Image, { smallCurveTopLeft: !withContentAbove, softCorners: true, alt: i18n('previewThumbnail', [first.domain]), height: 72, width: 72, url: first.image.url, attachment: first.image, onError: this.handleImageErrorBound, i18n: i18n }))) : null,
                    react_1.default.createElement("div", {
                        className: classnames_1.default('module-message__link-preview__text', previewHasImage && !isFullSizeImage
                            ? 'module-message__link-preview__text--with-icon'
                            : null)
                    },
                        react_1.default.createElement("div", { className: "module-message__link-preview__title" }, first.title),
                        react_1.default.createElement("div", { className: "module-message__link-preview__location" }, first.domain)))));
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
            const { text, textPending, i18n, direction, status } = this.props;
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
                react_1.default.createElement(MessageBody_1.MessageBody, { text: contents || '', i18n: i18n, textPending: textPending })));
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
            const firstAttachment = attachments && attachments[0];
            const downloadButton = !multipleAttachments && firstAttachment && !firstAttachment.pending ? (react_1.default.createElement("div", {
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
        getWidth() {
            const { attachments, previews } = this.props;
            if (attachments && attachments.length) {
                const dimensions = Attachment_1.getGridDimensions(attachments);
                if (dimensions) {
                    return dimensions.width;
                }
            }
            if (previews && previews.length) {
                const first = previews[0];
                if (!first || !first.image) {
                    return;
                }
                const { width } = first.image;
                if (Attachment_1.isImageAttachment(first.image) &&
                    width &&
                    width >= MINIMUM_LINK_PREVIEW_IMAGE_WIDTH) {
                    const dimensions = Attachment_1.getImageDimensions(first.image);
                    if (dimensions) {
                        return dimensions.width;
                    }
                }
            }
            return;
        }
        isShowingImage() {
            const { attachments, previews } = this.props;
            const { imageBroken } = this.state;
            if (imageBroken) {
                return false;
            }
            if (attachments && attachments.length) {
                const displayImage = Attachment_1.canDisplayImage(attachments);
                return (displayImage &&
                    ((Attachment_1.isImage(attachments) && Attachment_1.hasImage(attachments)) ||
                        (Attachment_1.isVideo(attachments) && Attachment_1.hasVideoScreenshot(attachments))));
            }
            if (previews && previews.length) {
                const first = previews[0];
                const { image } = first;
                if (!image) {
                    return false;
                }
                return Attachment_1.isImageAttachment(image);
            }
            return false;
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
            const width = this.getWidth();
            const isShowingImage = this.isShowingImage();
            return (react_1.default.createElement("div", { className: classnames_1.default('module-message', `module-message--${direction}`, expiring ? 'module-message--expired' : null) },
                this.renderError(direction === 'incoming'),
                this.renderMenu(direction === 'outgoing', triggerId),
                react_1.default.createElement("div", {
                    className: classnames_1.default('module-message__container', `module-message__container--${direction}`, direction === 'incoming'
                        ? `module-message__container--incoming-${authorColor}`
                        : null), style: {
                            width: isShowingImage ? width : undefined,
                        }
                },
                    this.renderAuthor(),
                    this.renderQuote(),
                    this.renderAttachment(),
                    this.renderPreview(),
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