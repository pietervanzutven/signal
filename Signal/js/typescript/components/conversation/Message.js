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
    const EXPIRATION_CHECK_MINIMUM = 2000;
    const EXPIRED_DELAY = 600;
    class Message extends react_1.default.PureComponent {
        constructor() {
            super(...arguments);
            this.focusRef = react_1.default.createRef();
            this.audioRef = react_1.default.createRef();
            this.state = {
                expiring: false,
                expired: false,
                imageBroken: false,
            };
            this.captureMenuTrigger = (triggerRef) => {
                this.menuTriggerRef = triggerRef;
            };
            this.showMenu = (event) => {
                if (this.menuTriggerRef) {
                    this.menuTriggerRef.handleContextClick(event);
                }
            };
            this.handleImageError = () => {
                const { id } = this.props;
                // tslint:disable-next-line no-console
                console.log(`Message ${id}: Image failed to load; failing over to placeholder`);
                this.setState({
                    imageBroken: true,
                });
            };
            this.setSelected = () => {
                const { id, conversationId, selectMessage } = this.props;
                selectMessage(id, conversationId);
            };
            this.setFocus = () => {
                if (this.focusRef.current) {
                    this.focusRef.current.focus();
                }
            };
            // tslint:disable-next-line cyclomatic-complexity
            this.handleOpen = (event) => {
                const { attachments, displayTapToViewMessage, id, isTapToView, isTapToViewExpired, showVisualAttachment, } = this.props;
                const { imageBroken } = this.state;
                const isAttachmentPending = this.isAttachmentPending();
                if (isTapToView) {
                    if (!isTapToViewExpired && !isAttachmentPending) {
                        event.preventDefault();
                        event.stopPropagation();
                        displayTapToViewMessage(id);
                    }
                    return;
                }
                if (!imageBroken &&
                    attachments &&
                    attachments.length > 0 &&
                    !isAttachmentPending &&
                    Attachment_1.canDisplayImage(attachments) &&
                    ((Attachment_1.isImage(attachments) && Attachment_1.hasImage(attachments)) ||
                        (Attachment_1.isVideo(attachments) && Attachment_1.hasVideoScreenshot(attachments)))) {
                    event.preventDefault();
                    event.stopPropagation();
                    const attachment = attachments[0];
                    showVisualAttachment({ attachment, messageId: id });
                    return;
                }
                if (attachments &&
                    attachments.length === 1 &&
                    !isAttachmentPending &&
                    !Attachment_1.isAudio(attachments)) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.openGenericAttachment();
                    return;
                }
                if (!isAttachmentPending &&
                    Attachment_1.isAudio(attachments) &&
                    this.audioRef &&
                    this.audioRef.current) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (this.audioRef.current.paused) {
                        // tslint:disable-next-line no-floating-promises
                        this.audioRef.current.play();
                    }
                    else {
                        // tslint:disable-next-line no-floating-promises
                        this.audioRef.current.pause();
                    }
                }
            };
            this.openGenericAttachment = (event) => {
                const { attachments, downloadAttachment, timestamp } = this.props;
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                if (!attachments || attachments.length !== 1) {
                    return;
                }
                const attachment = attachments[0];
                const { fileName } = attachment;
                const isDangerous = isFileDangerous_1.isFileDangerous(fileName || '');
                downloadAttachment({
                    isDangerous,
                    attachment,
                    timestamp,
                });
            };
            this.handleKeyDown = (event) => {
                if (event.key !== 'Enter' && event.key !== 'Space') {
                    return;
                }
                this.handleOpen(event);
            };
            this.handleClick = (event) => {
                // We don't want clicks on body text to result in the 'default action' for the message
                const { text } = this.props;
                if (text && text.length > 0) {
                    return;
                }
                this.handleOpen(event);
            };
        }
        componentDidMount() {
            const { isSelected } = this.props;
            if (isSelected) {
                this.setFocus();
            }
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
        componentDidUpdate(prevProps) {
            if (!prevProps.isSelected && this.props.isSelected) {
                this.setFocus();
            }
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
                const prefix = isSticker ? 'sticker' : 'attachment';
                const bottomOverlay = !isSticker && !collapseMetadata;
                // We only want users to tab into this if there's more than one
                const tabIndex = attachments.length > 1 ? 0 : -1;
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
                        attachments: attachments, withContentAbove: isSticker || withContentAbove, withContentBelow: isSticker || withContentBelow, isSticker: isSticker, stickerSize: STICKER_SIZE, bottomOverlay: bottomOverlay, i18n: i18n, onError: this.handleImageError, tabIndex: tabIndex, onClick: attachment => {
                            showVisualAttachment({ attachment, messageId: id });
                        }
                    })));
            }
            else if (!firstAttachment.pending && Attachment_1.isAudio(attachments)) {
                return (react_1.default.createElement("audio", {
                    ref: this.audioRef, controls: true, className: classnames_1.default('module-message__audio-attachment', withContentBelow
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
                return (react_1.default.createElement("button", {
                    className: classnames_1.default('module-message__generic-attachment', withContentBelow
                        ? 'module-message__generic-attachment--with-content-below'
                        : null, withContentAbove
                        ? 'module-message__generic-attachment--with-content-above'
                        : null),
                    // There's only ever one of these, so we don't want users to tab into it
                    tabIndex: -1, onClick: (event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        this.openGenericAttachment();
                    }
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
            return (react_1.default.createElement("button", {
                className: classnames_1.default('module-message__link-preview', withContentAbove
                    ? 'module-message__link-preview--with-content-above'
                    : null), onKeyDown: (event) => {
                        if (event.key === 'Enter' || event.key === 'Space') {
                            event.stopPropagation();
                            event.preventDefault();
                            openLink(first.url);
                        }
                    }, onClick: (event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        openLink(first.url);
                    }
            },
                first.image && previewHasImage && isFullSizeImage ? (react_1.default.createElement(ImageGrid_1.ImageGrid, { attachments: [first.image], withContentAbove: withContentAbove, withContentBelow: true, onError: this.handleImageError, i18n: i18n })) : null,
                react_1.default.createElement("div", {
                    className: classnames_1.default('module-message__link-preview__content', withContentAbove || isFullSizeImage
                        ? 'module-message__link-preview__content--with-content-above'
                        : null)
                },
                    first.image && previewHasImage && !isFullSizeImage ? (react_1.default.createElement("div", { className: "module-message__link-preview__icon_container" },
                        react_1.default.createElement(Image_1.Image, { smallCurveTopLeft: !withContentAbove, noBorder: true, noBackground: true, softCorners: true, alt: i18n('previewThumbnail', [first.domain]), height: 72, width: 72, url: first.image.url, attachment: first.image, onError: this.handleImageError, i18n: i18n }))) : null,
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
            return (react_1.default.createElement("button", {
                onClick: () => {
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
        renderMenu(isCorrectSide, triggerId) {
            const { attachments, direction, disableMenu, id, isSticker, isTapToView, replyToMessage, } = this.props;
            if (!isCorrectSide || disableMenu) {
                return null;
            }
            const multipleAttachments = attachments && attachments.length > 1;
            const firstAttachment = attachments && attachments[0];
            const downloadButton = !isSticker &&
                !multipleAttachments &&
                !isTapToView &&
                firstAttachment &&
                !firstAttachment.pending ? (react_1.default.createElement("div", {
                    onClick: this.openGenericAttachment,
                    // This a menu meant for mouse use only
                    role: "button", className: classnames_1.default('module-message__buttons__download', `module-message__buttons__download--${direction}`)
                })) : null;
            const replyButton = (react_1.default.createElement("div", {
                onClick: (event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    replyToMessage(id);
                },
                // This a menu meant for mouse use only
                role: "button", className: classnames_1.default('module-message__buttons__reply', `module-message__buttons__download--${direction}`)
            }));
            const menuButton = (react_1.default.createElement(react_contextmenu_1.ContextMenuTrigger, { id: triggerId, ref: this.captureMenuTrigger },
                react_1.default.createElement("div", {
                    // This a menu meant for mouse use only
                    role: "button", onClick: this.showMenu, className: classnames_1.default('module-message__buttons__menu', `module-message__buttons__download--${direction}`)
                })));
            const first = direction === 'incoming' ? downloadButton : menuButton;
            const last = direction === 'incoming' ? menuButton : downloadButton;
            return (react_1.default.createElement("div", { className: classnames_1.default('module-message__buttons', `module-message__buttons--${direction}`) },
                first,
                replyButton,
                last));
        }
        renderContextMenu(triggerId) {
            const { attachments, deleteMessage, direction, i18n, id, isSticker, isTapToView, replyToMessage, retrySend, showMessageDetail, status, } = this.props;
            const showRetry = status === 'error' && direction === 'outgoing';
            const multipleAttachments = attachments && attachments.length > 1;
            const menu = (react_1.default.createElement(react_contextmenu_1.ContextMenu, { id: triggerId },
                !isSticker &&
                    !multipleAttachments &&
                    !isTapToView &&
                    attachments &&
                    attachments[0] ? (react_1.default.createElement(react_contextmenu_1.MenuItem, {
                        attributes: {
                            className: 'module-message__context__download',
                        }, onClick: this.openGenericAttachment
                    }, i18n('downloadAttachment'))) : null,
                react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    attributes: {
                        className: 'module-message__context__reply',
                    }, onClick: (event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        replyToMessage(id);
                    }
                }, i18n('replyToMessage')),
                react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    attributes: {
                        className: 'module-message__context__more-info',
                    }, onClick: (event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        showMessageDetail(id);
                    }
                }, i18n('moreInfo')),
                showRetry ? (react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    attributes: {
                        className: 'module-message__context__retry-send',
                    }, onClick: (event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        retrySend(id);
                    }
                }, i18n('retrySend'))) : null,
                react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    attributes: {
                        className: 'module-message__context__delete-message',
                    }, onClick: (event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        deleteMessage(id);
                    }
                }, i18n('deleteMessage'))));
            return react_dom_1.default.createPortal(menu, document.body);
        }
        getWidth() {
            const { attachments, isSticker, previews } = this.props;
            if (attachments && attachments.length) {
                if (isSticker) {
                    // Padding is 8px, on both sides, plus two for 1px border
                    return STICKER_SIZE + 8 * 2 + 2;
                }
                const dimensions = Attachment_1.getGridDimensions(attachments);
                if (dimensions) {
                    // Add two for 1px border
                    return dimensions.width + 2;
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
                        // Add two for 1px border
                        return dimensions.width + 2;
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
        renderContainer() {
            const { authorColor, direction, isSelected, isSticker, isTapToView, isTapToViewExpired, isTapToViewError, } = this.props;
            const isAttachmentPending = this.isAttachmentPending();
            const width = this.getWidth();
            const isShowingImage = this.isShowingImage();
            const containerClassnames = classnames_1.default('module-message__container', isSelected && !isSticker ? 'module-message__container--selected' : null, isSticker ? 'module-message__container--with-sticker' : null, !isSticker ? `module-message__container--${direction}` : null, isTapToView ? 'module-message__container--with-tap-to-view' : null, isTapToView && isTapToViewExpired
                ? 'module-message__container--with-tap-to-view-expired'
                : null, !isSticker && direction === 'incoming'
                ? `module-message__container--incoming-${authorColor}`
                : null, isTapToView && isAttachmentPending && !isTapToViewExpired
                ? 'module-message__container--with-tap-to-view-pending'
                : null, isTapToView && isAttachmentPending && !isTapToViewExpired
                ? `module-message__container--${direction}-${authorColor}-tap-to-view-pending`
                : null, isTapToViewError
                ? 'module-message__container--with-tap-to-view-error'
                : null);
            const containerStyles = {
                width: isShowingImage ? width : undefined,
            };
            return (react_1.default.createElement("div", { className: containerClassnames, style: containerStyles },
                this.renderAuthor(),
                this.renderContents(),
                this.renderAvatar()));
        }
        // tslint:disable-next-line cyclomatic-complexity
        render() {
            const { authorPhoneNumber, attachments, conversationType, direction, id, isSticker, timestamp, } = this.props;
            const { expired, expiring, imageBroken } = this.state;
            // This id is what connects our triple-dot click with our associated pop-up menu.
            //   It needs to be unique.
            const triggerId = String(id || `${authorPhoneNumber}-${timestamp}`);
            if (expired) {
                return null;
            }
            if (isSticker && (imageBroken || !attachments || !attachments.length)) {
                return null;
            }
            return (react_1.default.createElement("div", {
                className: classnames_1.default('module-message', `module-message--${direction}`, expiring ? 'module-message--expired' : null, conversationType === 'group' ? 'module-message--group' : null), tabIndex: 0,
                // We pretend to be a button because we sometimes contain buttons and a button
                //   cannot be within another button
                role: "button", onKeyDown: this.handleKeyDown, onClick: this.handleClick, onFocus: this.setSelected, ref: this.focusRef
            },
                this.renderError(direction === 'incoming'),
                this.renderMenu(direction === 'outgoing', triggerId),
                this.renderContainer(),
                this.renderError(direction === 'outgoing'),
                this.renderMenu(direction === 'incoming', triggerId),
                this.renderContextMenu(triggerId)));
        }
    }
    exports.Message = Message;
})();