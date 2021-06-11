require(exports => {
    "use strict";
    // Copyright 2018-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
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
    const react_dom_1 = __importStar(require("react-dom"));
    const classnames_1 = __importDefault(require("classnames"));
    const react_measure_1 = __importDefault(require("react-measure"));
    const lodash_1 = require("lodash");
    const react_contextmenu_1 = require("react-contextmenu");
    const react_popper_1 = require("react-popper");
    const Avatar_1 = require("../Avatar");
    const Spinner_1 = require("../Spinner");
    const MessageBody_1 = require("./MessageBody");
    const ExpireTimer_1 = require("./ExpireTimer");
    const ImageGrid_1 = require("./ImageGrid");
    const Image_1 = require("./Image");
    const Timestamp_1 = require("./Timestamp");
    const ContactName_1 = require("./ContactName");
    const Quote_1 = require("./Quote");
    const EmbeddedContact_1 = require("./EmbeddedContact");
    const ReactionViewer_1 = require("./ReactionViewer");
    const Emoji_1 = require("../emoji/Emoji");
    const LinkPreviewDate_1 = require("./LinkPreviewDate");
    const Attachment_1 = require("../../types/Attachment");
    const timer_1 = require("../../util/timer");
    const isFileDangerous_1 = require("../../util/isFileDangerous");
    const _util_1 = require("../_util");
    const lib_1 = require("../emoji/lib");
    const ReactionPicker_1 = require("../../state/smart/ReactionPicker");
    // Same as MIN_WIDTH in ImageGrid.tsx
    const MINIMUM_LINK_PREVIEW_IMAGE_WIDTH = 200;
    const STICKER_SIZE = 200;
    const SELECTED_TIMEOUT = 1000;
    const THREE_HOURS = 3 * 60 * 60 * 1000;
    exports.MessageStatuses = [
        'delivered',
        'error',
        'partial-sent',
        'read',
        'sending',
        'sent',
    ];
    exports.InteractionModes = ['mouse', 'keyboard'];
    exports.Directions = ['incoming', 'outgoing'];
    exports.ConversationTypes = ['direct', 'group'];
    const EXPIRATION_CHECK_MINIMUM = 2000;
    const EXPIRED_DELAY = 600;
    class Message extends react_1.default.PureComponent {
        constructor(props) {
            super(props);
            this.audioRef = react_1.default.createRef();
            this.focusRef = react_1.default.createRef();
            this.reactionsContainerRef = react_1.default.createRef();
            this.reactionsContainerRefMerger = _util_1.createRefMerger();
            this.handleWideMlChange = (event) => {
                this.setState({ isWide: event.matches });
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
                window.log.info(`Message ${id}: Image failed to load; failing over to placeholder`);
                this.setState({
                    imageBroken: true,
                });
            };
            this.handleFocus = () => {
                const { interactionMode } = this.props;
                if (interactionMode === 'keyboard') {
                    this.setSelected();
                }
            };
            this.setSelected = () => {
                const { id, conversationId, selectMessage } = this.props;
                if (selectMessage) {
                    selectMessage(id, conversationId);
                }
            };
            this.setFocus = () => {
                const container = this.focusRef.current;
                if (container && !container.contains(document.activeElement)) {
                    container.focus();
                }
            };
            this.toggleReactionViewer = (onlyRemove = false) => {
                this.setState(({ reactionViewerRoot }) => {
                    if (reactionViewerRoot) {
                        document.body.removeChild(reactionViewerRoot);
                        document.body.removeEventListener('click', this.handleClickOutsideReactionViewer, true);
                        return { reactionViewerRoot: null };
                    }
                    if (!onlyRemove) {
                        const root = document.createElement('div');
                        document.body.appendChild(root);
                        document.body.addEventListener('click', this.handleClickOutsideReactionViewer, true);
                        return {
                            reactionViewerRoot: root,
                        };
                    }
                    return { reactionViewerRoot: null };
                });
            };
            this.toggleReactionPicker = (onlyRemove = false) => {
                this.setState(({ reactionPickerRoot }) => {
                    if (reactionPickerRoot) {
                        document.body.removeChild(reactionPickerRoot);
                        document.body.removeEventListener('click', this.handleClickOutsideReactionPicker, true);
                        return { reactionPickerRoot: null };
                    }
                    if (!onlyRemove) {
                        const root = document.createElement('div');
                        document.body.appendChild(root);
                        document.body.addEventListener('click', this.handleClickOutsideReactionPicker, true);
                        return {
                            reactionPickerRoot: root,
                        };
                    }
                    return { reactionPickerRoot: null };
                });
            };
            this.handleClickOutsideReactionViewer = (e) => {
                const { reactionViewerRoot } = this.state;
                const { current: reactionsContainer } = this.reactionsContainerRef;
                if (reactionViewerRoot && reactionsContainer) {
                    if (!reactionViewerRoot.contains(e.target) &&
                        !reactionsContainer.contains(e.target)) {
                        this.toggleReactionViewer(true);
                    }
                }
            };
            this.handleClickOutsideReactionPicker = (e) => {
                const { reactionPickerRoot } = this.state;
                if (reactionPickerRoot) {
                    if (!reactionPickerRoot.contains(e.target)) {
                        this.toggleReactionPicker(true);
                    }
                }
            };
            this.handleOpen = (event) => {
                const { attachments, contact, displayTapToViewMessage, direction, id, isTapToView, isTapToViewExpired, openConversation, showContactDetail, showVisualAttachment, showExpiredIncomingTapToViewToast, showExpiredOutgoingTapToViewToast, } = this.props;
                const { imageBroken } = this.state;
                const isAttachmentPending = this.isAttachmentPending();
                if (isTapToView) {
                    if (isAttachmentPending) {
                        return;
                    }
                    if (isTapToViewExpired) {
                        const action = direction === 'outgoing'
                            ? showExpiredOutgoingTapToViewToast
                            : showExpiredIncomingTapToViewToast;
                        action();
                    }
                    else {
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
                        this.audioRef.current.play();
                    }
                    else {
                        this.audioRef.current.pause();
                    }
                }
                if (contact && contact.signalAccount) {
                    openConversation(contact.signalAccount);
                    event.preventDefault();
                    event.stopPropagation();
                }
                if (contact) {
                    showContactDetail({ contact, signalAccount: contact.signalAccount });
                    event.preventDefault();
                    event.stopPropagation();
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
                // Do not allow reactions to error messages
                const { canReply } = this.props;
                if ((event.key === 'E' || event.key === 'e') &&
                    (event.metaKey || event.ctrlKey) &&
                    event.shiftKey &&
                    canReply) {
                    this.toggleReactionPicker();
                }
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
                // If there an incomplete attachment, do not execute the default action
                const { attachments } = this.props;
                if (attachments && attachments.length > 0) {
                    const [firstAttachment] = attachments;
                    if (!firstAttachment.url) {
                        return;
                    }
                }
                this.handleOpen(event);
            };
            this.wideMl = window.matchMedia('(min-width: 926px)');
            this.wideMl.addEventListener('change', this.handleWideMlChange);
            this.state = {
                expiring: false,
                expired: false,
                imageBroken: false,
                isSelected: props.isSelected,
                prevSelectedCounter: props.isSelectedCounter,
                reactionViewerRoot: null,
                reactionPickerRoot: null,
                isWide: this.wideMl.matches,
                containerWidth: 0,
                canDeleteForEveryone: props.canDeleteForEveryone,
            };
        }
        static getDerivedStateFromProps(props, state) {
            const newState = Object.assign(Object.assign({}, state), { canDeleteForEveryone: props.canDeleteForEveryone && state.canDeleteForEveryone });
            if (!props.isSelected) {
                return Object.assign(Object.assign({}, newState), { isSelected: false, prevSelectedCounter: 0 });
            }
            if (props.isSelected &&
                props.isSelectedCounter !== state.prevSelectedCounter) {
                return Object.assign(Object.assign({}, newState), { isSelected: props.isSelected, prevSelectedCounter: props.isSelectedCounter });
            }
            return newState;
        }
        componentDidMount() {
            this.startSelectedTimer();
            this.startDeleteForEveryoneTimer();
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
                clearTimeout(this.selectedTimeout);
            }
            if (this.expirationCheckInterval) {
                clearInterval(this.expirationCheckInterval);
            }
            if (this.expiredTimeout) {
                clearTimeout(this.expiredTimeout);
            }
            if (this.deleteForEveryoneTimeout) {
                clearTimeout(this.deleteForEveryoneTimeout);
            }
            this.toggleReactionViewer(true);
            this.toggleReactionPicker(true);
            this.wideMl.removeEventListener('change', this.handleWideMlChange);
        }
        componentDidUpdate(prevProps) {
            const { canDeleteForEveryone, isSelected } = this.props;
            this.startSelectedTimer();
            if (!prevProps.isSelected && isSelected) {
                this.setFocus();
            }
            this.checkExpired();
            if (canDeleteForEveryone !== prevProps.canDeleteForEveryone) {
                this.startDeleteForEveryoneTimer();
            }
        }
        startSelectedTimer() {
            const { clearSelectedMessage, interactionMode } = this.props;
            const { isSelected } = this.state;
            if (interactionMode === 'keyboard' || !isSelected) {
                return;
            }
            if (!this.selectedTimeout) {
                this.selectedTimeout = setTimeout(() => {
                    this.selectedTimeout = undefined;
                    this.setState({ isSelected: false });
                    clearSelectedMessage();
                }, SELECTED_TIMEOUT);
            }
        }
        startDeleteForEveryoneTimer() {
            if (this.deleteForEveryoneTimeout) {
                clearTimeout(this.deleteForEveryoneTimeout);
            }
            const { canDeleteForEveryone } = this.props;
            if (!canDeleteForEveryone) {
                return;
            }
            const { timestamp } = this.props;
            const timeToDeletion = timestamp - Date.now() + THREE_HOURS;
            if (timeToDeletion <= 0) {
                this.setState({ canDeleteForEveryone: false });
            }
            else {
                this.deleteForEveryoneTimeout = setTimeout(() => {
                    this.setState({ canDeleteForEveryone: false });
                }, timeToDeletion);
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
        renderTimestamp() {
            const { direction, i18n, id, isSticker, isTapToViewExpired, showMessageDetail, status, text, timestamp, } = this.props;
            const isShowingImage = this.isShowingImage();
            const withImageNoCaption = Boolean(!isSticker && !text && isShowingImage);
            const isError = status === 'error' && direction === 'outgoing';
            const isPartiallySent = status === 'partial-sent' && direction === 'outgoing';
            if (isError || isPartiallySent) {
                return (react_1.default.createElement("span", {
                    className: classnames_1.default({
                        'module-message__metadata__date': true,
                        'module-message__metadata__date--with-sticker': isSticker,
                        [`module-message__metadata__date--${direction}`]: !isSticker,
                        'module-message__metadata__date--with-image-no-caption': withImageNoCaption,
                    })
                }, isError ? (i18n('sendFailed')) : (react_1.default.createElement("button", {
                    type: "button", className: "module-message__metadata__tapable", onClick: (event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        showMessageDetail(id);
                    }
                }, i18n('partiallySent')))));
            }
            const metadataDirection = isSticker ? undefined : direction;
            return (react_1.default.createElement(Timestamp_1.Timestamp, { i18n: i18n, timestamp: timestamp, extended: true, direction: metadataDirection, withImageNoCaption: withImageNoCaption, withSticker: isSticker, withTapToViewExpired: isTapToViewExpired, module: "module-message__metadata__date" }));
        }
        renderMetadata() {
            const { collapseMetadata, direction, expirationLength, expirationTimestamp, isSticker, isTapToViewExpired, reactions, status, text, textPending, } = this.props;
            if (collapseMetadata) {
                return null;
            }
            const isShowingImage = this.isShowingImage();
            const withImageNoCaption = Boolean(!isSticker && !text && isShowingImage);
            const withReactions = reactions && reactions.length > 0;
            const metadataDirection = isSticker ? undefined : direction;
            return (react_1.default.createElement("div", {
                className: classnames_1.default('module-message__metadata', `module-message__metadata--${direction}`, withReactions ? 'module-message__metadata--with-reactions' : null, withImageNoCaption
                    ? 'module-message__metadata--with-image-no-caption'
                    : null)
            },
                this.renderTimestamp(),
                expirationLength && expirationTimestamp ? (react_1.default.createElement(ExpireTimer_1.ExpireTimer, { direction: metadataDirection, expirationLength: expirationLength, expirationTimestamp: expirationTimestamp, withImageNoCaption: withImageNoCaption, withSticker: isSticker, withTapToViewExpired: isTapToViewExpired })) : null,
                textPending ? (react_1.default.createElement("div", { className: "module-message__metadata__spinner-container" },
                    react_1.default.createElement(Spinner_1.Spinner, { svgSize: "small", size: "14px", direction: direction }))) : null,
                !textPending &&
                    direction === 'outgoing' &&
                    status !== 'error' &&
                    status !== 'partial-sent' ? (react_1.default.createElement("div", {
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
            const { authorTitle, authorName, authorPhoneNumber, authorProfileName, collapseMetadata, conversationType, direction, i18n, isSticker, isTapToView, isTapToViewExpired, } = this.props;
            if (collapseMetadata) {
                return null;
            }
            if (direction !== 'incoming' ||
                conversationType !== 'group' ||
                !authorTitle) {
                return null;
            }
            const withTapToViewExpired = isTapToView && isTapToViewExpired;
            const stickerSuffix = isSticker ? '_with_sticker' : '';
            const tapToViewSuffix = withTapToViewExpired
                ? '--with-tap-to-view-expired'
                : '';
            const moduleName = `module-message__author${stickerSuffix}${tapToViewSuffix}`;
            return (react_1.default.createElement("div", { className: moduleName },
                react_1.default.createElement(ContactName_1.ContactName, { title: authorTitle, phoneNumber: authorPhoneNumber, name: authorName, profileName: authorProfileName, module: moduleName, i18n: i18n })));
        }
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
            if (!firstAttachment.pending && Attachment_1.isAudio(attachments)) {
                return (react_1.default.createElement("audio", {
                    ref: this.audioRef, controls: true, className: classnames_1.default('module-message__audio-attachment', withContentBelow
                        ? 'module-message__audio-attachment--with-content-below'
                        : null, withContentAbove
                        ? 'module-message__audio-attachment--with-content-above'
                        : null), key: firstAttachment.url
                },
                    react_1.default.createElement("source", { src: firstAttachment.url })));
            }
            const { pending, fileName, fileSize, contentType } = firstAttachment;
            const extension = Attachment_1.getExtensionForDisplay({ contentType, fileName });
            const isDangerous = isFileDangerous_1.isFileDangerous(fileName || '');
            return (react_1.default.createElement("button", {
                type: "button", className: classnames_1.default('module-message__generic-attachment', withContentBelow
                    ? 'module-message__generic-attachment--with-content-below'
                    : null, withContentAbove
                    ? 'module-message__generic-attachment--with-content-above'
                    : null, !firstAttachment.url
                    ? 'module-message__generic-attachment--not-active'
                    : null),
                // There's only ever one of these, so we don't want users to tab into it
                tabIndex: -1, onClick: (event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    if (!firstAttachment.url) {
                        return;
                    }
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
            const linkPreviewDate = first.date || null;
            return (react_1.default.createElement("button", {
                type: "button", className: classnames_1.default('module-message__link-preview', `module-message__link-preview--${direction}`, withContentAbove
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
                        first.description && (react_1.default.createElement("div", { className: "module-message__link-preview__description" }, first.description)),
                        react_1.default.createElement("div", { className: "module-message__link-preview__footer" },
                            react_1.default.createElement("div", { className: "module-message__link-preview__location" }, first.domain),
                            react_1.default.createElement(LinkPreviewDate_1.LinkPreviewDate, { date: linkPreviewDate, className: "module-message__link-preview__date" }))))));
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
                        authorId: quote.authorId,
                        sentAt: quote.sentAt,
                    });
                };
            return (react_1.default.createElement(Quote_1.Quote, { i18n: i18n, onClick: clickHandler, text: quote.text, attachment: quote.attachment, isIncoming: direction === 'incoming', authorPhoneNumber: quote.authorPhoneNumber, authorProfileName: quote.authorProfileName, authorName: quote.authorName, authorColor: quoteColor, authorTitle: quote.authorTitle, bodyRanges: quote.bodyRanges, referencedMessageNotFound: referencedMessageNotFound, isFromMe: quote.isFromMe, withContentAbove: withContentAbove }));
        }
        renderEmbeddedContact() {
            const { collapseMetadata, contact, conversationType, direction, i18n, showContactDetail, text, } = this.props;
            if (!contact) {
                return null;
            }
            const withCaption = Boolean(text);
            const withContentAbove = conversationType === 'group' && direction === 'incoming';
            const withContentBelow = withCaption || !collapseMetadata;
            const otherContent = (contact && contact.signalAccount) || withCaption;
            const tabIndex = otherContent ? 0 : -1;
            return (react_1.default.createElement(EmbeddedContact_1.EmbeddedContact, {
                contact: contact, isIncoming: direction === 'incoming', i18n: i18n, onClick: () => {
                    showContactDetail({ contact, signalAccount: contact.signalAccount });
                }, withContentAbove: withContentAbove, withContentBelow: withContentBelow, tabIndex: tabIndex
            }));
        }
        renderSendMessageButton() {
            const { contact, openConversation, i18n } = this.props;
            if (!contact || !contact.signalAccount) {
                return null;
            }
            return (react_1.default.createElement("button", {
                type: "button", onClick: () => {
                    if (contact.signalAccount) {
                        openConversation(contact.signalAccount);
                    }
                }, className: "module-message__send-message-button"
            }, i18n('sendMessageToContact')));
        }
        renderAvatar() {
            const { authorAvatarPath, authorId, authorName, authorPhoneNumber, authorProfileName, authorTitle, collapseMetadata, authorColor, conversationType, direction, i18n, showContactModal, } = this.props;
            if (collapseMetadata ||
                conversationType !== 'group' ||
                direction === 'outgoing') {
                return undefined;
            }
            return (react_1.default.createElement("button", { type: "button", className: "module-message__author-avatar", onClick: () => showContactModal(authorId), tabIndex: 0 },
                react_1.default.createElement(Avatar_1.Avatar, { avatarPath: authorAvatarPath, color: authorColor, conversationType: "direct", i18n: i18n, name: authorName, phoneNumber: authorPhoneNumber, profileName: authorProfileName, title: authorTitle, size: 28 })));
        }
        renderText() {
            const { bodyRanges, deletedForEveryone, direction, i18n, openConversation, status, text, textPending, } = this.props;
            // eslint-disable-next-line no-nested-ternary
            const contents = deletedForEveryone
                ? i18n('message--deletedForEveryone')
                : direction === 'incoming' && status === 'error'
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
                react_1.default.createElement(MessageBody_1.MessageBody, { bodyRanges: bodyRanges, direction: direction, i18n: i18n, openConversation: openConversation, text: contents || '', textPending: textPending })));
        }
        renderError(isCorrectSide) {
            const { status, direction } = this.props;
            if (!isCorrectSide || (status !== 'error' && status !== 'partial-sent')) {
                return null;
            }
            return (react_1.default.createElement("div", { className: "module-message__error-container" },
                react_1.default.createElement("div", { className: classnames_1.default('module-message__error', `module-message__error--${direction}`) })));
        }
        renderMenu(isCorrectSide, triggerId) {
            const { attachments, canDownload, canReply, direction, disableMenu, i18n, id, isSticker, isTapToView, reactToMessage, renderEmojiPicker, replyToMessage, selectedReaction, } = this.props;
            if (!isCorrectSide || disableMenu) {
                return null;
            }
            const { reactionPickerRoot, isWide } = this.state;
            const multipleAttachments = attachments && attachments.length > 1;
            const firstAttachment = attachments && attachments[0];
            const downloadButton = !isSticker &&
                !multipleAttachments &&
                !isTapToView &&
                firstAttachment &&
                !firstAttachment.pending ? (
                // This a menu meant for mouse use only
                // eslint-disable-next-line max-len
                // eslint-disable-next-line jsx-a11y/interactive-supports-focus, jsx-a11y/click-events-have-key-events
                react_1.default.createElement("div", { onClick: this.openGenericAttachment, role: "button", "aria-label": i18n('downloadAttachment'), className: classnames_1.default('module-message__buttons__download', `module-message__buttons__download--${direction}`) })) : null;
            const reactButton = (react_1.default.createElement(react_popper_1.Reference, null, ({ ref: popperRef }) => {
                // Only attach the popper reference to the reaction button if it is
                // visible in the page (it is hidden when the page is narrow)
                const maybePopperRef = isWide ? popperRef : undefined;
                return (
                    // This a menu meant for mouse use only
                    // eslint-disable-next-line max-len
                    // eslint-disable-next-line jsx-a11y/interactive-supports-focus, jsx-a11y/click-events-have-key-events
                    react_1.default.createElement("div", {
                        ref: maybePopperRef, onClick: (event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            this.toggleReactionPicker();
                        }, role: "button", className: "module-message__buttons__react", "aria-label": i18n('reactToMessage')
                    }));
            }));
            const replyButton = (
                // This a menu meant for mouse use only
                // eslint-disable-next-line max-len
                // eslint-disable-next-line jsx-a11y/interactive-supports-focus, jsx-a11y/click-events-have-key-events
                react_1.default.createElement("div", {
                    onClick: (event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        replyToMessage(id);
                    },
                    // This a menu meant for mouse use only
                    role: "button", "aria-label": i18n('replyToMessage'), className: classnames_1.default('module-message__buttons__reply', `module-message__buttons__download--${direction}`)
                }));
            // This a menu meant for mouse use only
            /* eslint-disable jsx-a11y/interactive-supports-focus */
            /* eslint-disable jsx-a11y/click-events-have-key-events */
            const menuButton = (react_1.default.createElement(react_popper_1.Reference, null, ({ ref: popperRef }) => {
                // Only attach the popper reference to the collapsed menu button if
                // the reaction button is not visible in the page (it is hidden when
                // the page is narrow)
                const maybePopperRef = !isWide ? popperRef : undefined;
                return (react_1.default.createElement(react_contextmenu_1.ContextMenuTrigger, {
                    id: triggerId,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ref: this.captureMenuTrigger
                },
                    react_1.default.createElement("div", { ref: maybePopperRef, role: "button", onClick: this.showMenu, "aria-label": i18n('messageContextMenuButton'), className: classnames_1.default('module-message__buttons__menu', `module-message__buttons__download--${direction}`) })));
            }));
            /* eslint-enable jsx-a11y/interactive-supports-focus */
            /* eslint-enable jsx-a11y/click-events-have-key-events */
            return (react_1.default.createElement(react_popper_1.Manager, null,
                react_1.default.createElement("div", { className: classnames_1.default('module-message__buttons', `module-message__buttons--${direction}`) },
                    canReply ? reactButton : null,
                    canDownload ? downloadButton : null,
                    canReply ? replyButton : null,
                    menuButton),
                reactionPickerRoot &&
                react_dom_1.createPortal(
                    // eslint-disable-next-line consistent-return
                    react_1.default.createElement(react_popper_1.Popper, { placement: "top" }, ({ ref, style }) => (react_1.default.createElement(ReactionPicker_1.SmartReactionPicker, {
                        ref: ref, style: style, selected: selectedReaction, onClose: this.toggleReactionPicker, onPick: emoji => {
                            this.toggleReactionPicker(true);
                            reactToMessage(id, {
                                emoji,
                                remove: emoji === selectedReaction,
                            });
                        }, renderEmojiPicker: renderEmojiPicker
                    }))), reactionPickerRoot)));
        }
        renderContextMenu(triggerId) {
            const { attachments, canDownload, canReply, deleteMessage, deleteMessageForEveryone, direction, i18n, id, isSticker, isTapToView, replyToMessage, retrySend, showMessageDetail, status, } = this.props;
            const { canDeleteForEveryone } = this.state;
            const showRetry = (status === 'error' || status === 'partial-sent') &&
                direction === 'outgoing';
            const multipleAttachments = attachments && attachments.length > 1;
            const menu = (react_1.default.createElement(react_contextmenu_1.ContextMenu, { id: triggerId },
                canDownload &&
                    !isSticker &&
                    !multipleAttachments &&
                    !isTapToView &&
                    attachments &&
                    attachments[0] ? (react_1.default.createElement(react_contextmenu_1.MenuItem, {
                        attributes: {
                            className: 'module-message__context--icon module-message__context__download',
                        }, onClick: this.openGenericAttachment
                    }, i18n('downloadAttachment'))) : null,
                canReply ? (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement(react_contextmenu_1.MenuItem, {
                        attributes: {
                            className: 'module-message__context--icon module-message__context__reply',
                        }, onClick: (event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            replyToMessage(id);
                        }
                    }, i18n('replyToMessage')),
                    react_1.default.createElement(react_contextmenu_1.MenuItem, {
                        attributes: {
                            className: 'module-message__context--icon module-message__context__react',
                        }, onClick: (event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            this.toggleReactionPicker();
                        }
                    }, i18n('reactToMessage')))) : null,
                react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    attributes: {
                        className: 'module-message__context--icon module-message__context__more-info',
                    }, onClick: (event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        showMessageDetail(id);
                    }
                }, i18n('moreInfo')),
                showRetry ? (react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    attributes: {
                        className: 'module-message__context--icon module-message__context__retry-send',
                    }, onClick: (event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        retrySend(id);
                    }
                }, i18n('retrySend'))) : null,
                react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    attributes: {
                        className: 'module-message__context--icon module-message__context__delete-message',
                    }, onClick: (event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        deleteMessage(id);
                    }
                }, i18n('deleteMessage')),
                canDeleteForEveryone ? (react_1.default.createElement(react_contextmenu_1.MenuItem, {
                    attributes: {
                        className: 'module-message__context--icon module-message__context__delete-message-for-everyone',
                    }, onClick: (event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        deleteMessageForEveryone(id);
                    }
                }, i18n('deleteMessageForEveryone'))) : null));
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
                    return undefined;
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
            return undefined;
        }
        // Messy return here.
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
            // eslint-disable-next-line consistent-return, no-nested-ternary
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
        renderReactions(outgoing) {
            const { reactions, i18n } = this.props;
            if (!reactions || (reactions && reactions.length === 0)) {
                return null;
            }
            const reactionsWithEmojiData = reactions.map(reaction => (Object.assign(Object.assign({}, reaction), lib_1.emojiToData(reaction.emoji))));
            // Group by emoji and order each group by timestamp descending
            const groupedAndSortedReactions = Object.values(lodash_1.groupBy(reactionsWithEmojiData, 'short_name')).map(groupedReactions => lodash_1.orderBy(groupedReactions, [reaction => reaction.from.isMe, 'timestamp'], ['desc', 'desc']));
            // Order groups by length and subsequently by most recent reaction
            const ordered = lodash_1.orderBy(groupedAndSortedReactions, ['length', ([{ timestamp }]) => timestamp], ['desc', 'desc']);
            // Take the first three groups for rendering
            const toRender = lodash_1.take(ordered, 3).map(res => ({
                emoji: res[0].emoji,
                count: res.length,
                isMe: res.some(re => Boolean(re.from.isMe)),
            }));
            const someNotRendered = ordered.length > 3;
            // We only drop two here because the third emoji would be replaced by the
            // more button
            const maybeNotRendered = lodash_1.drop(ordered, 2);
            const maybeNotRenderedTotal = maybeNotRendered.reduce((sum, res) => sum + res.length, 0);
            const notRenderedIsMe = someNotRendered &&
                maybeNotRendered.some(res => res.some(re => Boolean(re.from.isMe)));
            const { reactionViewerRoot, containerWidth } = this.state;
            // Calculate the width of the reactions container
            const reactionsWidth = toRender.reduce((sum, res, i, arr) => {
                if (someNotRendered && i === arr.length - 1) {
                    return sum + 28;
                }
                if (res.count > 1) {
                    return sum + 40;
                }
                return sum + 28;
            }, 0);
            const reactionsXAxisOffset = Math.max(containerWidth - reactionsWidth - 6, 6);
            const popperPlacement = outgoing ? 'bottom-end' : 'bottom-start';
            return (react_1.default.createElement(react_popper_1.Manager, null,
                react_1.default.createElement(react_popper_1.Reference, null, ({ ref: popperRef }) => (react_1.default.createElement("div", {
                    ref: this.reactionsContainerRefMerger(this.reactionsContainerRef, popperRef), className: classnames_1.default('module-message__reactions', outgoing
                        ? 'module-message__reactions--outgoing'
                        : 'module-message__reactions--incoming'), style: {
                            [outgoing ? 'right' : 'left']: `${reactionsXAxisOffset}px`,
                        }
                }, toRender.map((re, i) => {
                    const isLast = i === toRender.length - 1;
                    const isMore = isLast && someNotRendered;
                    const isMoreWithMe = isMore && notRenderedIsMe;
                    return (react_1.default.createElement("button", {
                        type: "button",
                        // eslint-disable-next-line react/no-array-index-key
                        key: `${re.emoji}-${i}`, className: classnames_1.default('module-message__reactions__reaction', re.count > 1
                            ? 'module-message__reactions__reaction--with-count'
                            : null, outgoing
                            ? 'module-message__reactions__reaction--outgoing'
                            : 'module-message__reactions__reaction--incoming', isMoreWithMe || (re.isMe && !isMoreWithMe)
                            ? 'module-message__reactions__reaction--is-me'
                            : null), onClick: e => {
                                e.stopPropagation();
                                e.preventDefault();
                                this.toggleReactionViewer(false);
                            }, onKeyDown: e => {
                                // Prevent enter key from opening stickers/attachments
                                if (e.key === 'Enter') {
                                    e.stopPropagation();
                                }
                            }
                    }, isMore ? (react_1.default.createElement("span", {
                        className: classnames_1.default('module-message__reactions__reaction__count', 'module-message__reactions__reaction__count--no-emoji', isMoreWithMe
                            ? 'module-message__reactions__reaction__count--is-me'
                            : null)
                    },
                        "+",
                        maybeNotRenderedTotal)) : (react_1.default.createElement(react_1.default.Fragment, null,
                            react_1.default.createElement(Emoji_1.Emoji, { size: 16, emoji: re.emoji }),
                            re.count > 1 ? (react_1.default.createElement("span", {
                                className: classnames_1.default('module-message__reactions__reaction__count', re.isMe
                                    ? 'module-message__reactions__reaction__count--is-me'
                                    : null)
                            }, re.count)) : null))));
                })))),
                reactionViewerRoot &&
                react_dom_1.createPortal(react_1.default.createElement(react_popper_1.Popper, { placement: popperPlacement }, ({ ref, style }) => (react_1.default.createElement(ReactionViewer_1.ReactionViewer, { ref: ref, style: Object.assign(Object.assign({}, style), { zIndex: 2 }), reactions: reactions, i18n: i18n, onClose: this.toggleReactionViewer }))), reactionViewerRoot)));
        }
        renderContents() {
            const { isTapToView, deletedForEveryone } = this.props;
            if (deletedForEveryone) {
                return this.renderText();
            }
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
            const { authorColor, deletedForEveryone, direction, isSticker, isTapToView, isTapToViewExpired, isTapToViewError, reactions, } = this.props;
            const { isSelected } = this.state;
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
                : null, reactions && reactions.length > 0
                ? 'module-message__container--with-reactions'
                : null, deletedForEveryone
                ? 'module-message__container--deleted-for-everyone'
                : null);
            const containerStyles = {
                width: isShowingImage ? width : undefined,
            };
            return (react_1.default.createElement(react_measure_1.default, {
                bounds: true, onResize: ({ bounds = { width: 0 } }) => {
                    this.setState({ containerWidth: bounds.width });
                }
            }, ({ measureRef }) => (react_1.default.createElement("div", { ref: measureRef, className: containerClassnames, style: containerStyles },
                this.renderAuthor(),
                this.renderContents(),
                this.renderAvatar()))));
        }
        render() {
            const { authorPhoneNumber, attachments, conversationType, direction, id, isSticker, timestamp, } = this.props;
            const { expired, expiring, imageBroken, isSelected } = this.state;
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
                className: classnames_1.default('module-message', `module-message--${direction}`, isSelected ? 'module-message--selected' : null, expiring ? 'module-message--expired' : null, conversationType === 'group' ? 'module-message--group' : null), tabIndex: 0,
                // We pretend to be a button because we sometimes contain buttons and a button
                //   cannot be within another button
                role: "button", onKeyDown: this.handleKeyDown, onClick: this.handleClick, onFocus: this.handleFocus, ref: this.focusRef
            },
                this.renderError(direction === 'incoming'),
                this.renderMenu(direction === 'outgoing', triggerId),
                this.renderContainer(),
                this.renderError(direction === 'outgoing'),
                this.renderMenu(direction === 'incoming', triggerId),
                this.renderContextMenu(triggerId),
                this.renderReactions(direction === 'outgoing')));
        }
    }
    exports.Message = Message;
});