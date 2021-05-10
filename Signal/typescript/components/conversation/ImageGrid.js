(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.ImageGrid = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const Attachment_1 = require("../../types/Attachment");
    const Image_1 = require("./Image");
    exports.ImageGrid = ({ attachments, bottomOverlay, i18n, isSticker, stickerSize, onError, onClick, tabIndex, withContentAbove, withContentBelow, }) => {
        const curveTopLeft = !withContentAbove;
        const curveTopRight = curveTopLeft;
        const curveBottom = !withContentBelow;
        const curveBottomLeft = curveBottom;
        const curveBottomRight = curveBottom;
        const withBottomOverlay = Boolean(bottomOverlay && curveBottom);
        if (!attachments || !attachments.length) {
            return null;
        }
        if (attachments.length === 1 || !Attachment_1.areAllAttachmentsVisual(attachments)) {
            const { height, width } = Attachment_1.getImageDimensions(attachments[0], isSticker ? stickerSize : undefined);
            return (react_1.default.createElement("div", { className: classnames_1.default('module-image-grid', 'module-image-grid--one-image', isSticker ? 'module-image-grid--with-sticker' : null) },
                react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[0], i18n), i18n: i18n, blurHash: attachments[0].blurHash, bottomOverlay: withBottomOverlay, noBorder: isSticker, noBackground: isSticker, curveTopLeft: curveTopLeft, curveTopRight: curveTopRight, curveBottomLeft: curveBottomLeft, curveBottomRight: curveBottomRight, attachment: attachments[0], playIconOverlay: Attachment_1.isVideoAttachment(attachments[0]), height: height, width: width, url: Attachment_1.getUrl(attachments[0]), tabIndex: tabIndex, onClick: onClick, onError: onError })));
        }
        if (attachments.length === 2) {
            return (react_1.default.createElement("div", { className: "module-image-grid" },
                react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[0], i18n), i18n: i18n, attachment: attachments[0], blurHash: attachments[0].blurHash, bottomOverlay: withBottomOverlay, noBorder: false, curveTopLeft: curveTopLeft, curveBottomLeft: curveBottomLeft, playIconOverlay: Attachment_1.isVideoAttachment(attachments[0]), height: 149, width: 149, url: Attachment_1.getThumbnailUrl(attachments[0]), onClick: onClick, onError: onError }),
                react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[1], i18n), i18n: i18n, blurHash: attachments[1].blurHash, bottomOverlay: withBottomOverlay, noBorder: false, curveTopRight: curveTopRight, curveBottomRight: curveBottomRight, playIconOverlay: Attachment_1.isVideoAttachment(attachments[1]), height: 149, width: 149, attachment: attachments[1], url: Attachment_1.getThumbnailUrl(attachments[1]), onClick: onClick, onError: onError })));
        }
        if (attachments.length === 3) {
            return (react_1.default.createElement("div", { className: "module-image-grid" },
                react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[0], i18n), i18n: i18n, blurHash: attachments[0].blurHash, bottomOverlay: withBottomOverlay, noBorder: false, curveTopLeft: curveTopLeft, curveBottomLeft: curveBottomLeft, attachment: attachments[0], playIconOverlay: Attachment_1.isVideoAttachment(attachments[0]), height: 200, width: 199, url: Attachment_1.getUrl(attachments[0]), onClick: onClick, onError: onError }),
                react_1.default.createElement("div", { className: "module-image-grid__column" },
                    react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[1], i18n), i18n: i18n, blurHash: attachments[1].blurHash, curveTopRight: curveTopRight, height: 99, width: 99, attachment: attachments[1], playIconOverlay: Attachment_1.isVideoAttachment(attachments[1]), url: Attachment_1.getThumbnailUrl(attachments[1]), onClick: onClick, onError: onError }),
                    react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[2], i18n), i18n: i18n, blurHash: attachments[2].blurHash, bottomOverlay: withBottomOverlay, noBorder: false, curveBottomRight: curveBottomRight, height: 99, width: 99, attachment: attachments[2], playIconOverlay: Attachment_1.isVideoAttachment(attachments[2]), url: Attachment_1.getThumbnailUrl(attachments[2]), onClick: onClick, onError: onError }))));
        }
        if (attachments.length === 4) {
            return (react_1.default.createElement("div", { className: "module-image-grid" },
                react_1.default.createElement("div", { className: "module-image-grid__column" },
                    react_1.default.createElement("div", { className: "module-image-grid__row" },
                        react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[0], i18n), i18n: i18n, blurHash: attachments[0].blurHash, curveTopLeft: curveTopLeft, noBorder: false, attachment: attachments[0], playIconOverlay: Attachment_1.isVideoAttachment(attachments[0]), height: 149, width: 149, url: Attachment_1.getThumbnailUrl(attachments[0]), onClick: onClick, onError: onError }),
                        react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[1], i18n), i18n: i18n, blurHash: attachments[1].blurHash, curveTopRight: curveTopRight, playIconOverlay: Attachment_1.isVideoAttachment(attachments[1]), noBorder: false, height: 149, width: 149, attachment: attachments[1], url: Attachment_1.getThumbnailUrl(attachments[1]), onClick: onClick, onError: onError })),
                    react_1.default.createElement("div", { className: "module-image-grid__row" },
                        react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[2], i18n), i18n: i18n, blurHash: attachments[2].blurHash, bottomOverlay: withBottomOverlay, noBorder: false, curveBottomLeft: curveBottomLeft, playIconOverlay: Attachment_1.isVideoAttachment(attachments[2]), height: 149, width: 149, attachment: attachments[2], url: Attachment_1.getThumbnailUrl(attachments[2]), onClick: onClick, onError: onError }),
                        react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[3], i18n), i18n: i18n, blurHash: attachments[3].blurHash, bottomOverlay: withBottomOverlay, noBorder: false, curveBottomRight: curveBottomRight, playIconOverlay: Attachment_1.isVideoAttachment(attachments[3]), height: 149, width: 149, attachment: attachments[3], url: Attachment_1.getThumbnailUrl(attachments[3]), onClick: onClick, onError: onError })))));
        }
        const moreMessagesOverlay = attachments.length > 5;
        const moreMessagesOverlayText = moreMessagesOverlay
            ? `+${attachments.length - 5}`
            : undefined;
        return (react_1.default.createElement("div", { className: "module-image-grid" },
            react_1.default.createElement("div", { className: "module-image-grid__column" },
                react_1.default.createElement("div", { className: "module-image-grid__row" },
                    react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[0], i18n), i18n: i18n, blurHash: attachments[0].blurHash, curveTopLeft: curveTopLeft, attachment: attachments[0], playIconOverlay: Attachment_1.isVideoAttachment(attachments[0]), height: 149, width: 149, url: Attachment_1.getThumbnailUrl(attachments[0]), onClick: onClick, onError: onError }),
                    react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[1], i18n), i18n: i18n, blurHash: attachments[1].blurHash, curveTopRight: curveTopRight, playIconOverlay: Attachment_1.isVideoAttachment(attachments[1]), height: 149, width: 149, attachment: attachments[1], url: Attachment_1.getThumbnailUrl(attachments[1]), onClick: onClick, onError: onError })),
                react_1.default.createElement("div", { className: "module-image-grid__row" },
                    react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[2], i18n), i18n: i18n, blurHash: attachments[2].blurHash, bottomOverlay: withBottomOverlay, noBorder: isSticker, curveBottomLeft: curveBottomLeft, playIconOverlay: Attachment_1.isVideoAttachment(attachments[2]), height: 99, width: 99, attachment: attachments[2], url: Attachment_1.getThumbnailUrl(attachments[2]), onClick: onClick, onError: onError }),
                    react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[3], i18n), i18n: i18n, blurHash: attachments[3].blurHash, bottomOverlay: withBottomOverlay, noBorder: isSticker, playIconOverlay: Attachment_1.isVideoAttachment(attachments[3]), height: 99, width: 98, attachment: attachments[3], url: Attachment_1.getThumbnailUrl(attachments[3]), onClick: onClick, onError: onError }),
                    react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[4], i18n), i18n: i18n, blurHash: attachments[4].blurHash, bottomOverlay: withBottomOverlay, noBorder: isSticker, curveBottomRight: curveBottomRight, playIconOverlay: Attachment_1.isVideoAttachment(attachments[4]), height: 99, width: 99, darkOverlay: moreMessagesOverlay, overlayText: moreMessagesOverlayText, attachment: attachments[4], url: Attachment_1.getThumbnailUrl(attachments[4]), onClick: onClick, onError: onError })))));
    };
})();