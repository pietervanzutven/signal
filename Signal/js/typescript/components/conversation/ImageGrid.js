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
    const GoogleChrome_1 = window.ts.util.GoogleChrome;
    const Image_1 = window.ts.components.conversation.Image;
    const MAX_WIDTH = 300;
    const MAX_HEIGHT = MAX_WIDTH * 1.5;
    const MIN_WIDTH = 200;
    const MIN_HEIGHT = 50;
    class ImageGrid extends react_1.default.Component {
        // tslint:disable-next-line max-func-body-length */
        render() {
            const { attachments, bottomOverlay, i18n, onError, onClickAttachment, withContentAbove, withContentBelow, } = this.props;
            const curveTopLeft = !Boolean(withContentAbove);
            const curveTopRight = curveTopLeft;
            const curveBottom = !Boolean(withContentBelow);
            const curveBottomLeft = curveBottom;
            const curveBottomRight = curveBottom;
            if (!attachments || !attachments.length) {
                return null;
            }
            if (attachments.length === 1 || !areAllAttachmentsVisual(attachments)) {
                const { height, width } = getImageDimensions(attachments[0]);
                return (react_1.default.createElement("div", { className: classnames_1.default('module-image-grid', 'module-image-grid--one-image') },
                    react_1.default.createElement(Image_1.Image, { alt: getAlt(attachments[0], i18n), i18n: i18n, bottomOverlay: bottomOverlay && curveBottom, curveTopLeft: curveTopLeft, curveTopRight: curveTopRight, curveBottomLeft: curveBottomLeft, curveBottomRight: curveBottomRight, attachment: attachments[0], playIconOverlay: isVideoAttachment(attachments[0]), height: height, width: width, url: getUrl(attachments[0]), onClick: onClickAttachment, onError: onError })));
            }
            if (attachments.length === 2) {
                return (react_1.default.createElement("div", { className: "module-image-grid" },
                    react_1.default.createElement(Image_1.Image, { alt: getAlt(attachments[0], i18n), i18n: i18n, attachment: attachments[0], bottomOverlay: bottomOverlay && curveBottom, curveTopLeft: curveTopLeft, curveBottomLeft: curveBottomLeft, playIconOverlay: isVideoAttachment(attachments[0]), height: 149, width: 149, url: getThumbnailUrl(attachments[0]), onClick: onClickAttachment, onError: onError }),
                    react_1.default.createElement(Image_1.Image, { alt: getAlt(attachments[1], i18n), i18n: i18n, bottomOverlay: bottomOverlay && curveBottom, curveTopRight: curveTopRight, curveBottomRight: curveBottomRight, playIconOverlay: isVideoAttachment(attachments[1]), height: 149, width: 149, attachment: attachments[1], url: getThumbnailUrl(attachments[1]), onClick: onClickAttachment, onError: onError })));
            }
            if (attachments.length === 3) {
                return (react_1.default.createElement("div", { className: "module-image-grid" },
                    react_1.default.createElement(Image_1.Image, { alt: getAlt(attachments[0], i18n), i18n: i18n, bottomOverlay: bottomOverlay && curveBottom, curveTopLeft: curveTopLeft, curveBottomLeft: curveBottomLeft, attachment: attachments[0], playIconOverlay: isVideoAttachment(attachments[0]), height: 200, width: 199, url: getUrl(attachments[0]), onClick: onClickAttachment, onError: onError }),
                    react_1.default.createElement("div", { className: "module-image-grid__column" },
                        react_1.default.createElement(Image_1.Image, { alt: getAlt(attachments[1], i18n), i18n: i18n, curveTopRight: curveTopRight, height: 99, width: 99, attachment: attachments[1], playIconOverlay: isVideoAttachment(attachments[1]), url: getThumbnailUrl(attachments[1]), onClick: onClickAttachment, onError: onError }),
                        react_1.default.createElement(Image_1.Image, { alt: getAlt(attachments[2], i18n), i18n: i18n, bottomOverlay: bottomOverlay && curveBottom, curveBottomRight: curveBottomRight, height: 99, width: 99, attachment: attachments[2], playIconOverlay: isVideoAttachment(attachments[2]), url: getThumbnailUrl(attachments[2]), onClick: onClickAttachment, onError: onError }))));
            }
            if (attachments.length === 4) {
                return (react_1.default.createElement("div", { className: "module-image-grid" },
                    react_1.default.createElement("div", { className: "module-image-grid__column" },
                        react_1.default.createElement("div", { className: "module-image-grid__row" },
                            react_1.default.createElement(Image_1.Image, { alt: getAlt(attachments[0], i18n), i18n: i18n, curveTopLeft: curveTopLeft, attachment: attachments[0], playIconOverlay: isVideoAttachment(attachments[0]), height: 149, width: 149, url: getThumbnailUrl(attachments[0]), onClick: onClickAttachment, onError: onError }),
                            react_1.default.createElement(Image_1.Image, { alt: getAlt(attachments[1], i18n), i18n: i18n, curveTopRight: curveTopRight, playIconOverlay: isVideoAttachment(attachments[1]), height: 149, width: 149, attachment: attachments[1], url: getThumbnailUrl(attachments[1]), onClick: onClickAttachment, onError: onError })),
                        react_1.default.createElement("div", { className: "module-image-grid__row" },
                            react_1.default.createElement(Image_1.Image, { alt: getAlt(attachments[2], i18n), i18n: i18n, bottomOverlay: bottomOverlay && curveBottom, curveBottomLeft: curveBottomLeft, playIconOverlay: isVideoAttachment(attachments[2]), height: 149, width: 149, attachment: attachments[2], url: getThumbnailUrl(attachments[2]), onClick: onClickAttachment, onError: onError }),
                            react_1.default.createElement(Image_1.Image, { alt: getAlt(attachments[3], i18n), i18n: i18n, bottomOverlay: bottomOverlay && curveBottom, curveBottomRight: curveBottomRight, playIconOverlay: isVideoAttachment(attachments[3]), height: 149, width: 149, attachment: attachments[3], url: getThumbnailUrl(attachments[3]), onClick: onClickAttachment, onError: onError })))));
            }
            return (react_1.default.createElement("div", { className: "module-image-grid" },
                react_1.default.createElement("div", { className: "module-image-grid__column" },
                    react_1.default.createElement("div", { className: "module-image-grid__row" },
                        react_1.default.createElement(Image_1.Image, { alt: getAlt(attachments[0], i18n), i18n: i18n, curveTopLeft: curveTopLeft, attachment: attachments[0], playIconOverlay: isVideoAttachment(attachments[0]), height: 149, width: 149, url: getThumbnailUrl(attachments[0]), onClick: onClickAttachment, onError: onError }),
                        react_1.default.createElement(Image_1.Image, { alt: getAlt(attachments[1], i18n), i18n: i18n, curveTopRight: curveTopRight, playIconOverlay: isVideoAttachment(attachments[1]), height: 149, width: 149, attachment: attachments[1], url: getThumbnailUrl(attachments[1]), onClick: onClickAttachment, onError: onError })),
                    react_1.default.createElement("div", { className: "module-image-grid__row" },
                        react_1.default.createElement(Image_1.Image, { alt: getAlt(attachments[2], i18n), i18n: i18n, bottomOverlay: bottomOverlay && curveBottom, curveBottomLeft: curveBottomLeft, playIconOverlay: isVideoAttachment(attachments[2]), height: 99, width: 99, attachment: attachments[2], url: getThumbnailUrl(attachments[2]), onClick: onClickAttachment, onError: onError }),
                        react_1.default.createElement(Image_1.Image, { alt: getAlt(attachments[3], i18n), i18n: i18n, bottomOverlay: bottomOverlay && curveBottom, playIconOverlay: isVideoAttachment(attachments[3]), height: 99, width: 98, attachment: attachments[3], url: getThumbnailUrl(attachments[3]), onClick: onClickAttachment, onError: onError }),
                        react_1.default.createElement(Image_1.Image, {
                            alt: getAlt(attachments[4], i18n), i18n: i18n, bottomOverlay: bottomOverlay && curveBottom, curveBottomRight: curveBottomRight, playIconOverlay: isVideoAttachment(attachments[4]), height: 99, width: 99, darkOverlay: attachments.length > 5, overlayText: attachments.length > 5
                                ? `+${attachments.length - 5}`
                                : undefined, attachment: attachments[4], url: getThumbnailUrl(attachments[4]), onClick: onClickAttachment, onError: onError
                        })))));
        }
    }
    exports.ImageGrid = ImageGrid;
    function getThumbnailUrl(attachment) {
        if (attachment.thumbnail) {
            return attachment.thumbnail.url;
        }
        return getUrl(attachment);
    }
    function getUrl(attachment) {
        if (attachment.screenshot) {
            return attachment.screenshot.url;
        }
        return attachment.url;
    }
    function isImage(attachments) {
        return (attachments &&
            attachments[0] &&
            attachments[0].contentType &&
            GoogleChrome_1.isImageTypeSupported(attachments[0].contentType));
    }
    exports.isImage = isImage;
    function isImageAttachment(attachment) {
        return (attachment &&
            attachment.contentType &&
            GoogleChrome_1.isImageTypeSupported(attachment.contentType));
    }
    exports.isImageAttachment = isImageAttachment;
    function hasImage(attachments) {
        return attachments && attachments[0] && attachments[0].url;
    }
    exports.hasImage = hasImage;
    function isVideo(attachments) {
        return attachments && isVideoAttachment(attachments[0]);
    }
    exports.isVideo = isVideo;
    function isVideoAttachment(attachment) {
        return (attachment &&
            attachment.contentType &&
            GoogleChrome_1.isVideoTypeSupported(attachment.contentType));
    }
    exports.isVideoAttachment = isVideoAttachment;
    function hasVideoScreenshot(attachments) {
        const firstAttachment = attachments ? attachments[0] : null;
        return (firstAttachment &&
            firstAttachment.screenshot &&
            firstAttachment.screenshot.url);
    }
    exports.hasVideoScreenshot = hasVideoScreenshot;
    function getImageDimensions(attachment) {
        const { height, width } = attachment;
        if (!height || !width) {
            return {
                height: MIN_HEIGHT,
                width: MIN_WIDTH,
            };
        }
        const aspectRatio = height / width;
        const targetWidth = Math.max(Math.min(MAX_WIDTH, width), MIN_WIDTH);
        const candidateHeight = Math.round(targetWidth * aspectRatio);
        return {
            width: targetWidth,
            height: Math.max(Math.min(MAX_HEIGHT, candidateHeight), MIN_HEIGHT),
        };
    }
    function areAllAttachmentsVisual(attachments) {
        if (!attachments) {
            return false;
        }
        const max = attachments.length;
        for (let i = 0; i < max; i += 1) {
            const attachment = attachments[i];
            if (!isImageAttachment(attachment) || !isVideoAttachment(attachment)) {
                return false;
            }
        }
        return true;
    }
    function getGridDimensions(attachments) {
        if (!attachments || !attachments.length) {
            return null;
        }
        if (!isImage(attachments) && !isVideo(attachments)) {
            return null;
        }
        if (attachments.length === 1) {
            return getImageDimensions(attachments[0]);
        }
        if (attachments.length === 2) {
            return {
                height: 150,
                width: 300,
            };
        }
        if (attachments.length === 4) {
            return {
                height: 300,
                width: 300,
            };
        }
        return {
            height: 200,
            width: 300,
        };
    }
    exports.getGridDimensions = getGridDimensions;
    function getAlt(attachment, i18n) {
        return isVideoAttachment(attachment)
            ? i18n('videoAttachmentAlt')
            : i18n('imageAttachmentAlt');
    }
    exports.getAlt = getAlt;
})();