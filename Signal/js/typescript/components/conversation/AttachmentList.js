(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.AttachmentList = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const GoogleChrome_1 = window.ts.util.GoogleChrome;
    const Image_1 = window.ts.components.conversation.Image;
    const StagedGenericAttachment_1 = window.ts.components.conversation.StagedGenericAttachment;
    const StagedPlaceholderAttachment_1 = window.ts.components.conversation.StagedPlaceholderAttachment;
    const Attachment_1 = window.ts.types.Attachment;
    const IMAGE_WIDTH = 120;
    const IMAGE_HEIGHT = 120;
    class AttachmentList extends react_1.default.Component {
        // tslint:disable-next-line max-func-body-length */
        render() {
            const { attachments, i18n, onAddAttachment, onClickAttachment, onCloseAttachment, onClose, } = this.props;
            if (!attachments.length) {
                return null;
            }
            const allVisualAttachments = Attachment_1.areAllAttachmentsVisual(attachments);
            return (react_1.default.createElement("div", { className: "module-attachments" },
                attachments.length > 1 ? (react_1.default.createElement("div", { className: "module-attachments__header" },
                    react_1.default.createElement("div", { role: "button", onClick: onClose, className: "module-attachments__close-button" }))) : null,
                react_1.default.createElement("div", { className: "module-attachments__rail" },
                    (attachments || []).map((attachment, index) => {
                        const { contentType } = attachment;
                        if (GoogleChrome_1.isImageTypeSupported(contentType) ||
                            GoogleChrome_1.isVideoTypeSupported(contentType)) {
                            const imageKey = Attachment_1.getUrl(attachment) || attachment.fileName || index;
                            const clickCallback = attachments.length > 1 ? onClickAttachment : undefined;
                            return (react_1.default.createElement(Image_1.Image, {
                                key: imageKey, alt: i18n('stagedImageAttachment', [
                                    Attachment_1.getUrl(attachment) || attachment.fileName,
                                ]), i18n: i18n, attachment: attachment, softCorners: true, playIconOverlay: Attachment_1.isVideoAttachment(attachment), height: IMAGE_HEIGHT, width: IMAGE_WIDTH, url: Attachment_1.getUrl(attachment), closeButton: true, onClick: clickCallback, onClickClose: onCloseAttachment, onError: () => {
                                    onCloseAttachment(attachment);
                                }
                            }));
                        }
                        const genericKey = Attachment_1.getUrl(attachment) || attachment.fileName || index;
                        return (react_1.default.createElement(StagedGenericAttachment_1.StagedGenericAttachment, { key: genericKey, attachment: attachment, i18n: i18n, onClose: onCloseAttachment }));
                    }),
                    allVisualAttachments ? (react_1.default.createElement(StagedPlaceholderAttachment_1.StagedPlaceholderAttachment, { onClick: onAddAttachment })) : null)));
        }
    }
    exports.AttachmentList = AttachmentList;
})();