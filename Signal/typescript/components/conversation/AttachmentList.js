require(exports => {
    "use strict";
    // Copyright 2018-2021 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AttachmentList = void 0;
    const react_1 = __importDefault(require("react"));
    const Image_1 = require("./Image");
    const StagedGenericAttachment_1 = require("./StagedGenericAttachment");
    const StagedPlaceholderAttachment_1 = require("./StagedPlaceholderAttachment");
    const Attachment_1 = require("../../types/Attachment");
    const IMAGE_WIDTH = 120;
    const IMAGE_HEIGHT = 120;
    // This is a 1x1 black square.
    const BLANK_VIDEO_THUMBNAIL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQAAAAA3bvkkAAAACklEQVR42mNiAAAABgADm78GJQAAAABJRU5ErkJggg==';
    const AttachmentList = ({ attachments, i18n, onAddAttachment, onClickAttachment, onCloseAttachment, onClose, }) => {
        if (!attachments.length) {
            return null;
        }
        const allVisualAttachments = Attachment_1.areAllAttachmentsVisual(attachments);
        return (react_1.default.createElement("div", { className: "module-attachments" },
            attachments.length > 1 ? (react_1.default.createElement("div", { className: "module-attachments__header" },
                react_1.default.createElement("button", { type: "button", onClick: onClose, className: "module-attachments__close-button", "aria-label": i18n('close') }))) : null,
            react_1.default.createElement("div", { className: "module-attachments__rail" },
                (attachments || []).map((attachment, index) => {
                    const url = Attachment_1.getUrl(attachment);
                    const key = url || attachment.fileName || index;
                    const isImage = Attachment_1.isImageAttachment(attachment);
                    const isVideo = Attachment_1.isVideoAttachment(attachment);
                    if (isImage || isVideo) {
                        const clickCallback = attachments.length > 1 ? onClickAttachment : undefined;
                        const imageUrl = isVideo && !attachment.screenshot ? BLANK_VIDEO_THUMBNAIL : url;
                        return (react_1.default.createElement(Image_1.Image, {
                            key: key, alt: i18n('stagedImageAttachment', [
                                url || attachment.fileName,
                            ]), i18n: i18n, attachment: attachment, softCorners: true, playIconOverlay: isVideo, height: IMAGE_HEIGHT, width: IMAGE_WIDTH, url: imageUrl, closeButton: true, onClick: clickCallback, onClickClose: onCloseAttachment, onError: () => {
                                onCloseAttachment(attachment);
                            }
                        }));
                    }
                    return (react_1.default.createElement(StagedGenericAttachment_1.StagedGenericAttachment, { key: key, attachment: attachment, i18n: i18n, onClose: onCloseAttachment }));
                }),
                allVisualAttachments ? (react_1.default.createElement(StagedPlaceholderAttachment_1.StagedPlaceholderAttachment, { onClick: onAddAttachment, i18n: i18n })) : null)));
    };
    exports.AttachmentList = AttachmentList;
});