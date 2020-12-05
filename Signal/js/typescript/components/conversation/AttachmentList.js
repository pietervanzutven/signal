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
    // import classNames from 'classnames';
    const GoogleChrome_1 = window.ts.util.GoogleChrome;
    const Image_1 = window.ts.components.conversation.Image;
    const StagedGenericAttachment_1 = window.ts.components.conversation.StagedGenericAttachment;
    const IMAGE_WIDTH = 120;
    const IMAGE_HEIGHT = 120;
    class AttachmentList extends react_1.default.Component {
        // tslint:disable-next-line max-func-body-length */
        render() {
            const { attachments, i18n,
                // onError,
                onClickAttachment, onCloseAttachment, onClose, } = this.props;
            if (!attachments.length) {
                return null;
            }
            return (react_1.default.createElement("div", { className: "module-attachments" },
                attachments.length > 1 ? (react_1.default.createElement("div", { className: "module-attachments__header" },
                    react_1.default.createElement("div", { role: "button", onClick: onClose, className: "module-attachments__close-button" }))) : null,
                react_1.default.createElement("div", { className: "module-attachments__rail" }, (attachments || []).map((attachment, index) => {
                    const { contentType } = attachment;
                    if (GoogleChrome_1.isImageTypeSupported(contentType) ||
                        GoogleChrome_1.isVideoTypeSupported(contentType)) {
                        return (react_1.default.createElement(Image_1.Image, { key: getUrl(attachment) || attachment.fileName || index, alt: `TODO: attachment number ${index}`, i18n: i18n, attachment: attachment, softCorners: true, playIconOverlay: isVideoAttachment(attachment), height: IMAGE_HEIGHT, width: IMAGE_WIDTH, url: getUrl(attachment), closeButton: true, onClick: attachments.length > 1 ? onClickAttachment : undefined, onClickClose: onCloseAttachment }));
                    }
                    return (react_1.default.createElement(StagedGenericAttachment_1.StagedGenericAttachment, { key: getUrl(attachment) || attachment.fileName || index, attachment: attachment, i18n: i18n, onClose: onCloseAttachment }));
                }))));
        }
    }
    exports.AttachmentList = AttachmentList;
    function isVideoAttachment(attachment) {
        return (attachment &&
            attachment.contentType &&
            GoogleChrome_1.isVideoTypeSupported(attachment.contentType));
    }
    exports.isVideoAttachment = isVideoAttachment;
    function getUrl(attachment) {
        if (attachment.screenshot) {
            return attachment.screenshot.url;
        }
        return attachment.url;
    }
})();