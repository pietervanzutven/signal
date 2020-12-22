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
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const Attachment_1 = window.ts.types.Attachment;
    const Image_1 = window.ts.components.conversation.Image;
    class ImageGrid extends react_1.default.Component {
        // tslint:disable-next-line max-func-body-length */
        render() {
            const { attachments, bottomOverlay, i18n, onError, onClick, withContentAbove, withContentBelow, } = this.props;
            const curveTopLeft = !Boolean(withContentAbove);
            const curveTopRight = curveTopLeft;
            const curveBottom = !Boolean(withContentBelow);
            const curveBottomLeft = curveBottom;
            const curveBottomRight = curveBottom;
            const withBottomOverlay = Boolean(bottomOverlay && curveBottom);
            if (!attachments || !attachments.length) {
                return null;
            }
            if (attachments.length === 1 || !Attachment_1.areAllAttachmentsVisual(attachments)) {
                const { height, width } = Attachment_1.getImageDimensions(attachments[0]);
                return (react_1.default.createElement("div", { className: classnames_1.default('module-image-grid', 'module-image-grid--one-image') },
                    react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[0], i18n), i18n: i18n, bottomOverlay: withBottomOverlay, curveTopLeft: curveTopLeft, curveTopRight: curveTopRight, curveBottomLeft: curveBottomLeft, curveBottomRight: curveBottomRight, attachment: attachments[0], playIconOverlay: Attachment_1.isVideoAttachment(attachments[0]), height: height, width: width, url: Attachment_1.getUrl(attachments[0]), onClick: onClick, onError: onError })));
            }
            if (attachments.length === 2) {
                return (react_1.default.createElement("div", { className: "module-image-grid" },
                    react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[0], i18n), i18n: i18n, attachment: attachments[0], bottomOverlay: withBottomOverlay, curveTopLeft: curveTopLeft, curveBottomLeft: curveBottomLeft, playIconOverlay: Attachment_1.isVideoAttachment(attachments[0]), height: 149, width: 149, url: Attachment_1.getThumbnailUrl(attachments[0]), onClick: onClick, onError: onError }),
                    react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[1], i18n), i18n: i18n, bottomOverlay: withBottomOverlay, curveTopRight: curveTopRight, curveBottomRight: curveBottomRight, playIconOverlay: Attachment_1.isVideoAttachment(attachments[1]), height: 149, width: 149, attachment: attachments[1], url: Attachment_1.getThumbnailUrl(attachments[1]), onClick: onClick, onError: onError })));
            }
            if (attachments.length === 3) {
                return (react_1.default.createElement("div", { className: "module-image-grid" },
                    react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[0], i18n), i18n: i18n, bottomOverlay: withBottomOverlay, curveTopLeft: curveTopLeft, curveBottomLeft: curveBottomLeft, attachment: attachments[0], playIconOverlay: Attachment_1.isVideoAttachment(attachments[0]), height: 200, width: 199, url: Attachment_1.getUrl(attachments[0]), onClick: onClick, onError: onError }),
                    react_1.default.createElement("div", { className: "module-image-grid__column" },
                        react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[1], i18n), i18n: i18n, curveTopRight: curveTopRight, height: 99, width: 99, attachment: attachments[1], playIconOverlay: Attachment_1.isVideoAttachment(attachments[1]), url: Attachment_1.getThumbnailUrl(attachments[1]), onClick: onClick, onError: onError }),
                        react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[2], i18n), i18n: i18n, bottomOverlay: withBottomOverlay, curveBottomRight: curveBottomRight, height: 99, width: 99, attachment: attachments[2], playIconOverlay: Attachment_1.isVideoAttachment(attachments[2]), url: Attachment_1.getThumbnailUrl(attachments[2]), onClick: onClick, onError: onError }))));
            }
            if (attachments.length === 4) {
                return (react_1.default.createElement("div", { className: "module-image-grid" },
                    react_1.default.createElement("div", { className: "module-image-grid__column" },
                        react_1.default.createElement("div", { className: "module-image-grid__row" },
                            react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[0], i18n), i18n: i18n, curveTopLeft: curveTopLeft, attachment: attachments[0], playIconOverlay: Attachment_1.isVideoAttachment(attachments[0]), height: 149, width: 149, url: Attachment_1.getThumbnailUrl(attachments[0]), onClick: onClick, onError: onError }),
                            react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[1], i18n), i18n: i18n, curveTopRight: curveTopRight, playIconOverlay: Attachment_1.isVideoAttachment(attachments[1]), height: 149, width: 149, attachment: attachments[1], url: Attachment_1.getThumbnailUrl(attachments[1]), onClick: onClick, onError: onError })),
                        react_1.default.createElement("div", { className: "module-image-grid__row" },
                            react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[2], i18n), i18n: i18n, bottomOverlay: withBottomOverlay, curveBottomLeft: curveBottomLeft, playIconOverlay: Attachment_1.isVideoAttachment(attachments[2]), height: 149, width: 149, attachment: attachments[2], url: Attachment_1.getThumbnailUrl(attachments[2]), onClick: onClick, onError: onError }),
                            react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[3], i18n), i18n: i18n, bottomOverlay: withBottomOverlay, curveBottomRight: curveBottomRight, playIconOverlay: Attachment_1.isVideoAttachment(attachments[3]), height: 149, width: 149, attachment: attachments[3], url: Attachment_1.getThumbnailUrl(attachments[3]), onClick: onClick, onError: onError })))));
            }
            const moreMessagesOverlay = attachments.length > 5;
            const moreMessagesOverlayText = moreMessagesOverlay
                ? `+${attachments.length - 5}`
                : undefined;
            return (react_1.default.createElement("div", { className: "module-image-grid" },
                react_1.default.createElement("div", { className: "module-image-grid__column" },
                    react_1.default.createElement("div", { className: "module-image-grid__row" },
                        react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[0], i18n), i18n: i18n, curveTopLeft: curveTopLeft, attachment: attachments[0], playIconOverlay: Attachment_1.isVideoAttachment(attachments[0]), height: 149, width: 149, url: Attachment_1.getThumbnailUrl(attachments[0]), onClick: onClick, onError: onError }),
                        react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[1], i18n), i18n: i18n, curveTopRight: curveTopRight, playIconOverlay: Attachment_1.isVideoAttachment(attachments[1]), height: 149, width: 149, attachment: attachments[1], url: Attachment_1.getThumbnailUrl(attachments[1]), onClick: onClick, onError: onError })),
                    react_1.default.createElement("div", { className: "module-image-grid__row" },
                        react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[2], i18n), i18n: i18n, bottomOverlay: withBottomOverlay, curveBottomLeft: curveBottomLeft, playIconOverlay: Attachment_1.isVideoAttachment(attachments[2]), height: 99, width: 99, attachment: attachments[2], url: Attachment_1.getThumbnailUrl(attachments[2]), onClick: onClick, onError: onError }),
                        react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[3], i18n), i18n: i18n, bottomOverlay: withBottomOverlay, playIconOverlay: Attachment_1.isVideoAttachment(attachments[3]), height: 99, width: 98, attachment: attachments[3], url: Attachment_1.getThumbnailUrl(attachments[3]), onClick: onClick, onError: onError }),
                        react_1.default.createElement(Image_1.Image, { alt: Attachment_1.getAlt(attachments[4], i18n), i18n: i18n, bottomOverlay: withBottomOverlay, curveBottomRight: curveBottomRight, playIconOverlay: Attachment_1.isVideoAttachment(attachments[4]), height: 99, width: 99, darkOverlay: moreMessagesOverlay, overlayText: moreMessagesOverlayText, attachment: attachments[4], url: Attachment_1.getThumbnailUrl(attachments[4]), onClick: onClick, onError: onError })))));
        }
    }
    exports.ImageGrid = ImageGrid;
})();