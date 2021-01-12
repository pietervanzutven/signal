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
    const react_dom_1 = __importDefault(window.react_dom);
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
    const STICKER_SIZE = 128;
    const SELECTED_TIMEOUT = 1000;
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
                isSelected: props.isSelected,
                prevSelectedCounter: props.isSelectedCounter,
            };
        }
        static getDerivedStateFromProps(props, state) {
            if (props.isSelected &&
                props.isSelectedCounter !== state.prevSelectedCounter) {
                return Object.assign({}, state, { isSelected: props.isSelected, prevSelectedCounter: props.isSelectedCounter });
            }
            return state;
        }
        componentDidMount() {
            this.startSelectedTimer();
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
            if (this.selectedTimeout) {
                clearInterval(this.selectedTimeout);
            }
            if (this.expirationCheckInterval) {
                clearInterval(this.expirationCheckInterval);
            }
            if (this.expiredTimeout) {
                clearTimeout(this.expiredTimeout);
            }
        }
        componentDidUpdate() {
            this.startSelectedTimer();
            this.checkExpired();
        }
        startSelectedTimer() {
            const { isSelected } = this.state;
            if (!isSelected) {
                return;
            }
            if (!this.selectedTimeout) {
                this.selectedTimeout = setTimeout(() => {
                    this.selectedTimeout = undefined;
                    this.setState({ isSelected: false });
                    this.props.clearSelectedMessage();
                }, SELECTED_TIMEOUT);
            }
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
            const { collapseMetadata, direction, expirationLength, expirationTimestamp, i18n, isSticker, isTapToViewExpired, status, text, textPending, timestamp, } = this.props;
            if (collapseMetadata) {
                return null;
            }
            const isShowingImage = this.isShowingImage();
            const withImageNoCaption = Boolean(!isSticker && !text && isShowingImage);
            const showError = status === 'error' && direction === 'outgoing';
            const metadataDirection = isSticker ? undefined : direction;
            return (react_1.default.createElement("div", {
                className: classnames_1.default('module-message__metadata', withImageNoCaption
                    ? 'module-message__metadata--with-image-no-caption'
                    : null)
            },
                react_1.default.createElement("span", { className: "module-message__metadata__spacer" }),
                showError ? (react_1.default.createElement("span", {
                    className: classnames_1.default('module-message__metadata__date', isSticker ? 'module-message__metadata__date--with-sticker' : null, !isSticker
                        ? `module-message__metadata__date--${direction}`
                        : null, withImageNoCaption
                        ? 'module-message__metadata__date--with-image-no-caption'
                        : null)
                }, i18n('sendFailed'))) : (react_1.default.createElement(Timestamp_1.Timestamp, { i18n: i18n, timestamp: timestamp, extended: true, direction: metadataDirection, withImageNoCaption: withImageNoCaption, withSticker: isSticker, withTapToViewExpired: isTapToViewExpired, module: "module-message__metadata__date" })),
                expirationLength && expirationTimestamp ? (react_1.default.createElement(ExpireTimer_1.ExpireTimer, { direction: metadataDirection, expirationLength: expirationLength, expirationTimestamp: expirationTimestamp, withImageNoCaption: withImageNoCaption, withSticker: isSticker, withTapToViewExpired: isTapToViewExpired })) : null,
                textPending ? (react_1.default.createElement("div", { className: "module-message__metadata__spinner-container" },
                    react_1.default.createElement(Spinner_1.Spinner, { svgSize: "small", size: "14px", direction: direction }))) : null,
                !textPending && direction === 'outgoing' && status !== 'error' ? (react_1.default.createElement("div", {
                    className: classnames_1.default('module-message__metadata__status-icon', `module-message__metadata__status-icon--${status}`, isSticker
                        ? 'module-message__metadata__status-icon--with-sticker'
                        : null, withImageNoCaption
                        ? 'module-message__metadata__status-icon--with-image-no-caption'
                        : null, isTapToViewExpired
                        ? 'module-message__metadata__status-icon--with-tap-to-view-expired'
                        : null)
                })) : null));
        }
        renderAuthor() {
            const { authorName, authorPhoneNumber, authorProfileName, collapseMetadata, conversationType, direction, isSticker, isTapToView, isTapToViewExpired, } = this.props;
            if (collapseMetadata) {
                return;
            }
            const title = authorName ? authorName : authorPhoneNumber;
            if (direction !== 'incoming' || conversationType !== 'group' || !title) {
                return null;
            }
            const withTapToViewExpired = isTapToView && isTapToViewExpired;
            const stickerSuffix = isSticker ? '_with_sticker' : '';
            const tapToViewSuffix = withTapToViewExpired
                ? '--with-tap-to-view-expired'
                : '';
            const moduleName = `module-message__author${stickerSuffix}${tapToViewSuffix}`;
            return (react_1.default.createElement("div", { className: moduleName },
                react_1.default.createElement(ContactName_1.ContactName, { phoneNumber: authorPhoneNumber, name: authorName, profileName: authorProfileName, module: moduleName })));
        }
        // tslint:disable-next-line max-func-body-length cyclomatic-complexity
        renderAttachment() {
            const { attachments, collapseMetadata, conversationType, direction, i18n, id, quote, showVisualAttachment, isSticker, text, } = this.props;
            const { imageBroken, isSelected } = this.state;
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
                const prefix = isSticker ? 'sticker' : 'attachment';
                const bottomOverlay = !isSticker && !collapseMetadata;
                return (react_1.default.createElement("div", {
                    className: classnames_1.default(`module-message__${prefix}-container`, withContentAbove
                        ? `module-message__${prefix}-container--with-content-above`
                        : null, withContentBelow
                        ? 'module-message__attachment-container--with-content-below'
                        : null, isSticker && !collapseMetadata
                        ? 'module-message__sticker-container--with-content-below'
                        : null)
                },
                    react_1.default.createElement(ImageGrid_1.ImageGrid, {
                        attachments: attachments, withContentAbove: isSticker || withContentAbove, withContentBelow: isSticker || withContentBelow, isSticker: isSticker, isSelected: isSticker && isSelected, stickerSize: STICKER_SIZE, bottomOverlay: bottomOverlay, i18n: i18n, onError: this.handleImageErrorBound, onClick: attachment => {
                            showVisualAttachment({ attachment, messageId: id });
                        }
                    })));
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
                        react_1.default.createElement(Spinner_1.Spinner, { svgSize: "small", size: "24px", direction: direction }))) : (react_1.default.createElement("div", { className: "module-message__generic-attachment__icon-container" },
                            react_1.default.createElement("div", { className: "module-message__generic-attachment__icon" }, extension ? (react_1.default.createElement("div", { className: "module-message__generic-attachment__icon__extension" }, extension)) : null),
                            isDangerous ? (react_1.default.createElement("div", { className: "module-message__generic-attachment__icon-dangerous-container" },
                                react_1.default.createElement("div", { className: "module-message__generic-attachment__icon-dangerous" }))) : null)),
                    react_1.default.createElement("div", { className: "module-message__generic-attachment__text" },
                        react_1.default.createElement("div", { className: classnames_1.default('module-message__generic-attachment__file-name', `module-message__generic-attachment__file-name--${direction}`) }, fileName),
                        react_1.default.createElement("div", { className: classnames_1.default('module-message__generic-attachment__file-size', `module-message__generic-attachment__file-size--${direction}`) }, fileSize))));
            }
        }
        // tslint:disable-next-line cyclomatic-complexity max-func-body-length
        renderPreview() {
            const { attachments, conversationType, direction, i18n, openLink, previews, quote, } = this.props;
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
            const isFullSizeImage = !first.isStickerPack &&
                width &&
                width >= MINIMUM_LINK_PREVIEW_IMAGE_WIDTH;
            return (react_1.default.createElement("div", {
                role: "button", className: classnames_1.default('module-message__link-preview', withContentAbove
                    ? 'module-message__link-preview--with-content-above'
                    : null), onClick: () => {
                        openLink(first.url);
                    }
            },
                first.image && previewHasImage && isFullSizeImage ? (react_1.default.createElement(ImageGrid_1.ImageGrid, { attachments: [first.image], withContentAbove: withContentAbove, withContentBelow: true, onError: this.handleImageErrorBound, i18n: i18n })) : null,
                react_1.default.createElement("div", {
                    className: classnames_1.default('module-message__link-preview__content', withContentAbove || isFullSizeImage
                        ? 'module-message__link-preview__content--with-content-above'
                        : null)
                },
                    first.image && previewHasImage && !isFullSizeImage ? (react_1.default.createElement("div", { className: "module-message__link-preview__icon_container" },
                        react_1.default.createElement(Image_1.Image, { smallCurveTopLeft: !withContentAbove, noBorder: true, noBackground: true, softCorners: true, alt: i18n('previewThumbnail', [first.domain]), height: 72, width: 72, url: first.image.url, attachment: first.image, onError: this.handleImageErrorBound, i18n: i18n }))) : null,
                    react_1.default.createElement("div", {
                        className: classnames_1.default('module-message__link-preview__text', previewHasImage && !isFullSizeImage
                            ? 'module-message__link-preview__text--with-icon'
                            : null)
                    },
                        react_1.default.createElement("div", { className: "module-message__link-preview__title" }, first.title),
                        react_1.default.createElement("div", { className: "module-message__link-preview__location" }, first.domain)))));
        }
        renderQuote() {
            const { conversationType, authorColor, direction, disableScroll, i18n, quote, scrollToQuotedMessage, } = this.props;
            if (!quote) {
                return null;
            }
            const withContentAbove = conversationType === 'group' && direction === 'incoming';
            const quoteColor = direction === 'incoming' ? authorColor : quote.authorColor;
            const { referencedMessageNotFound } = quote;
            const clickHandler = disableScroll
                ? undefined
                : () => {
                    scrollToQuotedMessage({
                        author: quote.authorId,
                        sentAt: quote.sentAt,
                    });
                };
            return (react_1.default.createElement(Quote_1.Quote, { i18n: i18n, onClick: clickHandler, text: quote.text, attachment: quote.attachment, isIncoming: direction === 'incoming', authorPhoneNumber: quote.authorPhoneNumber, authorProfileName: quote.authorProfileName, authorName: quote.authorName, authorColor: quoteColor, referencedMessageNotFound: referencedMessageNotFound, isFromMe: quote.isFromMe, withContentAbove: withContentAbove }));
        }
        renderEmbeddedContact() {
            const { collapseMetadata, contact, conversationType, direction, i18n, showContactDetail, text, } = this.props;
            if (!contact) {
                return null;
            }
            const withCaption = Boolean(text);
            const withContentAbove = conversationType === 'group' && direction === 'incoming';
            const withContentBelow = withCaption || !collapseMetadata;
            return (react_1.default.createElement(EmbeddedContact_1.EmbeddedContact, {
                contact: contact, isIncoming: direction === 'incoming', i18n: i18n, onClick: () => {
                    showContactDetail({ contact, signalAccount: contact.signalAccount });
                }, withContentAbove: withContentAbove, withContentBelow: withContentBelow
            }));
        }
        renderSendMessageButton() {
            const { contact, openConversation, i18n } = this.props;
            if (!contact || !contact.signalAccount) {
                return null;
            }
            return (react_1.default.createElement("div", {
                role: "button", onClick: () => {
                    if (contact.signalAccount) {
                        openConversation(contact.signalAccount);
                    }
                }, className: "module-message__send-message-button"
            }, i18n('sendMessageToContact')));
        }
        renderAvatar() {
            const { authorAvatarPath, authorName, authorPhoneNumber, authorProfileName, collapseMetadata, authorColor, conversationType, direction, i18n, } = this.props;
            if (collapseMetadata ||
                conversationType !== 'group' ||
                direction === 'outgoing') {
                return;
            }
            return (react_1.default.createElement("div", { className: "module-message__author-avatar" },
                react_1.default.createElement(Avatar_1.Avatar, { avatarPath: authorAvatarPath, color: authorColor, conversationType: "direct", i18n: i18n, name: authorName, phoneNumber: authorPhoneNumber, profileName: authorProfileName, size: 28 })));
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
            const { attachments, direction, disableMenu, downloadAttachment, id, isSticker, isTapToView, replyToMessage, timestamp, } = this.props;
            if (!isCorrectSide || disableMenu) {
                return null;
            }
            const fileName = attachments && attachments[0] ? attachments[0].fileName : null;
            const isDangerous = isFileDangerous_1.isFileDangerous(fileName || '');
            const multipleAttachments = attachments && attachments.length > 1;
            const firstAttachment = attachments && attachments[0];
            const downloadButton = !isSticker &&
                !multipleAttachments &&
                !isTapToView &&
                firstAttachment &&
                !firstAttachment.pending ? (react_1.default.createElement("div", {
                    onClick: () => {
                        downloadAttachment({
                            isDangerous,
                            attachment: firstAttachment,
                            timestamp,
                        });
                    }, role: "button", className: classnames_1.default('module-message__buttons__download', `module-message__buttons__download--${direction}`)
                })) : null;
            const replyButton = (react_1.default.createElement("div", {
                onClick: () => {
                    replyToMessage(id);
                }, role: "button", className: classnames_1.default('module-message__buttons__reply', `module-message__buttons__download--${direction}`)
            }));
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
            const { attachments, deleteMessage, direction, downloadAttachment, i18n, id, isSticker, isTapToView, replyToMessage, retrySend, showMessageDetail, status, timestamp, } = this.props;
            const showRetry = status === 'error' && direction === 'outgoing';
            const fileName = attachments && attachments[0] ? attachments[0].fileName : null;
            const isDangerous = isFileDangerous_1.isFileDangerous(fileName || '');
            const multipleAttachments = attachments && attachments.length > 1;
            const menu = (react_1.default.createElement(react_contextmenu_1.ContextMenu, { id: triggerId },
                !isSticker &&
                    !multipleAttachments &&
                    !isTapToView &&
                    attachments &&
                    attachments[0] ? (react_1.default.createElement(react_contextmenu_1.MenuItem, {
                        attributes: {
                            className: 'module-message__context__download',
                        }, onClick: () => {
                            downloadAttachment({
                                attachment: attachments[0],
                                timestamp,
                                isDangerous,
                            });
                        }
                    }, i18n('downloadAttachment'))) : null,
                react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    attributes: {
                        className: 'module-message__context__reply',
                    }, onClick: () => {
                        replyToMessage(id);
                    }
                }, i18n('replyToMessage')),
                react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    attributes: {
                        className: 'module-message__context__more-info',
                    }, onClick: () => {
                        showMessageDetail(id);
                    }
                }, i18n('moreInfo')),
                showRetry ? (react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    attributes: {
                        className: 'module-message__context__retry-send',
                    }, onClick: () => {
                        retrySend(id);
                    }
                }, i18n('retrySend'))) : null,
                react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    attributes: {
                        className: 'module-message__context__delete-message',
                    }, onClick: () => {
                        deleteMessage(id);
                    }
                }, i18n('deleteMessage'))));
            return react_dom_1.default.createPortal(menu, document.body);
        }
        getWidth() {
            const { attachments, isSticker, previews } = this.props;
            if (attachments && attachments.length) {
                if (isSticker) {
                    // Padding is 8px, on both sides
                    return STICKER_SIZE + 8 * 2;
                }
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
                if (!first.isStickerPack &&
                    Attachment_1.isImageAttachment(first.image) &&
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
            const { isTapToView, attachments, previews } = this.props;
            const { imageBroken } = this.state;
            if (imageBroken || isTapToView) {
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
        isAttachmentPending() {
            const { attachments } = this.props;
            if (!attachments || attachments.length < 1) {
                return false;
            }
            const first = attachments[0];
            return Boolean(first.pending);
        }
        renderTapToViewIcon() {
            const { direction, isTapToViewExpired } = this.props;
            const isDownloadPending = this.isAttachmentPending();
            return !isTapToViewExpired && isDownloadPending ? (react_1.default.createElement("div", { className: "module-message__tap-to-view__spinner-container" },
                react_1.default.createElement(Spinner_1.Spinner, { svgSize: "small", size: "20px", direction: direction }))) : (react_1.default.createElement("div", {
                    className: classnames_1.default('module-message__tap-to-view__icon', `module-message__tap-to-view__icon--${direction}`, isTapToViewExpired
                        ? 'module-message__tap-to-view__icon--expired'
                        : null)
                }));
        }
        renderTapToViewText() {
            const { attachments, direction, i18n, isTapToViewExpired, isTapToViewError, } = this.props;
            const incomingString = isTapToViewExpired
                ? i18n('Message--tap-to-view-expired')
                : i18n(`Message--tap-to-view--incoming${Attachment_1.isVideo(attachments) ? '-video' : ''}`);
            const outgoingString = i18n('Message--tap-to-view--outgoing');
            const isDownloadPending = this.isAttachmentPending();
            if (isDownloadPending) {
                return;
            }
            return isTapToViewError
                ? i18n('incomingError')
                : direction === 'outgoing'
                    ? outgoingString
                    : incomingString;
        }
        renderTapToView() {
            const { collapseMetadata, conversationType, direction, isTapToViewExpired, isTapToViewError, } = this.props;
            const withContentBelow = !collapseMetadata;
            const withContentAbove = !collapseMetadata &&
                conversationType === 'group' &&
                direction === 'incoming';
            return (react_1.default.createElement("div", {
                className: classnames_1.default('module-message__tap-to-view', withContentBelow
                    ? 'module-message__tap-to-view--with-content-below'
                    : null, withContentAbove
                    ? 'module-message__tap-to-view--with-content-above'
                    : null)
            },
                isTapToViewError ? null : this.renderTapToViewIcon(),
                react_1.default.createElement("div", {
                    className: classnames_1.default('module-message__tap-to-view__text', `module-message__tap-to-view__text--${direction}`, isTapToViewExpired
                        ? `module-message__tap-to-view__text--${direction}-expired`
                        : null, isTapToViewError
                        ? `module-message__tap-to-view__text--${direction}-error`
                        : null)
                }, this.renderTapToViewText())));
        }
        renderContents() {
            const { isTapToView } = this.props;
            if (isTapToView) {
                return (react_1.default.createElement(react_1.default.Fragment, null,
                    this.renderTapToView(),
                    this.renderMetadata()));
            }
            return (react_1.default.createElement(react_1.default.Fragment, null,
                this.renderQuote(),
                this.renderAttachment(),
                this.renderPreview(),
                this.renderEmbeddedContact(),
                this.renderText(),
                this.renderMetadata(),
                this.renderSendMessageButton()));
        }
        // tslint:disable-next-line cyclomatic-complexity
        render() {
            const { authorPhoneNumber, authorColor, attachments, conversationType, direction, displayTapToViewMessage, id, isSticker, isTapToView, isTapToViewExpired, isTapToViewError, timestamp, } = this.props;
            const { expired, expiring, imageBroken, isSelected } = this.state;
            const isAttachmentPending = this.isAttachmentPending();
            const isButton = isTapToView && !isTapToViewExpired && !isAttachmentPending;
            // This id is what connects our triple-dot click with our associated pop-up menu.
            //   It needs to be unique.
            const triggerId = String(id || `${authorPhoneNumber}-${timestamp}`);
            if (expired) {
                return null;
            }
            if (isSticker && (imageBroken || !attachments || !attachments.length)) {
                return null;
            }
            const width = this.getWidth();
            const isShowingImage = this.isShowingImage();
            const role = isButton ? 'button' : undefined;
            const onClick = isButton ? () => displayTapToViewMessage(id) : undefined;
            return (react_1.default.createElement("div", { className: classnames_1.default('module-message', `module-message--${direction}`, expiring ? 'module-message--expired' : null, conversationType === 'group' ? 'module-message--group' : null) },
                this.renderError(direction === 'incoming'),
                this.renderMenu(direction === 'outgoing', triggerId),
                react_1.default.createElement("div", {
                    className: classnames_1.default('module-message__container', isSelected && !isSticker
                        ? 'module-message__container--selected'
                        : null, isSticker ? 'module-message__container--with-sticker' : null, !isSticker ? `module-message__container--${direction}` : null, isTapToView ? 'module-message__container--with-tap-to-view' : null, isTapToView && isTapToViewExpired
                        ? 'module-message__container--with-tap-to-view-expired'
                        : null, !isSticker && direction === 'incoming'
                        ? `module-message__container--incoming-${authorColor}`
                        : null, isTapToView && isAttachmentPending && !isTapToViewExpired
                        ? 'module-message__container--with-tap-to-view-pending'
                        : null, isTapToView && isAttachmentPending && !isTapToViewExpired
                        ? `module-message__container--${direction}-${authorColor}-tap-to-view-pending`
                        : null, isTapToViewError
                        ? 'module-message__container--with-tap-to-view-error'
                        : null), style: {
                            width: isShowingImage ? width : undefined,
                        }, role: role, onClick: onClick
                },
                    this.renderAuthor(),
                    this.renderContents(),
                    this.renderAvatar()),
                this.renderError(direction === 'outgoing'),
                this.renderMenu(direction === 'incoming', triggerId),
                this.renderContextMenu(triggerId)));
        }
    }
    exports.Message = Message;
})();