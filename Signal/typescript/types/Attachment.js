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
    const is_1 = __importDefault(require("@sindresorhus/is"));
    const moment_1 = __importDefault(require("moment"));
    const lodash_1 = require("lodash");
    const MIME = __importStar(require("./MIME"));
    const protobuf_1 = require("../protobuf");
    const GoogleChrome_1 = require("../util/GoogleChrome");
    const MAX_WIDTH = 300;
    const MAX_HEIGHT = MAX_WIDTH * 1.5;
    const MIN_WIDTH = 200;
    const MIN_HEIGHT = 50;
    // UI-focused functions
    function getExtensionForDisplay({ fileName, contentType, }) {
        if (fileName && fileName.indexOf('.') >= 0) {
            const lastPeriod = fileName.lastIndexOf('.');
            const extension = fileName.slice(lastPeriod + 1);
            if (extension.length) {
                return extension;
            }
        }
        if (!contentType) {
            return undefined;
        }
        const slash = contentType.indexOf('/');
        if (slash >= 0) {
            return contentType.slice(slash + 1);
        }
        return undefined;
    }
    exports.getExtensionForDisplay = getExtensionForDisplay;
    function isAudio(attachments) {
        return (attachments &&
            attachments[0] &&
            attachments[0].contentType &&
            MIME.isAudio(attachments[0].contentType));
    }
    exports.isAudio = isAudio;
    function canDisplayImage(attachments) {
        const { height, width } = attachments && attachments[0] ? attachments[0] : { height: 0, width: 0 };
        return (height &&
            height > 0 &&
            height <= 4096 &&
            width &&
            width > 0 &&
            width <= 4096);
    }
    exports.canDisplayImage = canDisplayImage;
    function getThumbnailUrl(attachment) {
        if (attachment.thumbnail) {
            return attachment.thumbnail.url;
        }
        return getUrl(attachment);
    }
    exports.getThumbnailUrl = getThumbnailUrl;
    function getUrl(attachment) {
        if (attachment.screenshot) {
            return attachment.screenshot.url;
        }
        return attachment.url;
    }
    exports.getUrl = getUrl;
    function isImage(attachments) {
        return (attachments &&
            attachments[0] &&
            attachments[0].contentType &&
            GoogleChrome_1.isImageTypeSupported(attachments[0].contentType));
    }
    exports.isImage = isImage;
    function isImageAttachment(attachment) {
        return Boolean(attachment &&
            attachment.contentType &&
            GoogleChrome_1.isImageTypeSupported(attachment.contentType));
    }
    exports.isImageAttachment = isImageAttachment;
    function hasImage(attachments) {
        return (attachments &&
            attachments[0] &&
            (attachments[0].url || attachments[0].pending || attachments[0].blurHash));
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
    function getImageDimensions(attachment, forcedWidth) {
        const { height, width } = attachment;
        if (!height || !width) {
            return {
                height: MIN_HEIGHT,
                width: MIN_WIDTH,
            };
        }
        const aspectRatio = height / width;
        const targetWidth = forcedWidth || Math.max(Math.min(MAX_WIDTH, width), MIN_WIDTH);
        const candidateHeight = Math.round(targetWidth * aspectRatio);
        return {
            width: targetWidth,
            height: Math.max(Math.min(MAX_HEIGHT, candidateHeight), MIN_HEIGHT),
        };
    }
    exports.getImageDimensions = getImageDimensions;
    function areAllAttachmentsVisual(attachments) {
        if (!attachments) {
            return false;
        }
        const max = attachments.length;
        for (let i = 0; i < max; i += 1) {
            const attachment = attachments[i];
            if (!isImageAttachment(attachment) && !isVideoAttachment(attachment)) {
                return false;
            }
        }
        return true;
    }
    exports.areAllAttachmentsVisual = areAllAttachmentsVisual;
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
    exports.isVisualMedia = (attachment) => {
        const { contentType } = attachment;
        if (is_1.default.undefined(contentType)) {
            return false;
        }
        if (exports.isVoiceMessage(attachment)) {
            return false;
        }
        return MIME.isImage(contentType) || MIME.isVideo(contentType);
    };
    exports.isFile = (attachment) => {
        const { contentType } = attachment;
        if (is_1.default.undefined(contentType)) {
            return false;
        }
        if (exports.isVisualMedia(attachment)) {
            return false;
        }
        if (exports.isVoiceMessage(attachment)) {
            return false;
        }
        return true;
    };
    exports.isVoiceMessage = (attachment) => {
        const flag = protobuf_1.SignalService.AttachmentPointer.Flags.VOICE_MESSAGE;
        const hasFlag =
            // eslint-disable-next-line no-bitwise
            !is_1.default.undefined(attachment.flags) && (attachment.flags & flag) === flag;
        if (hasFlag) {
            return true;
        }
        const isLegacyAndroidVoiceMessage = !is_1.default.undefined(attachment.contentType) &&
            MIME.isAudio(attachment.contentType) &&
            !attachment.fileName;
        if (isLegacyAndroidVoiceMessage) {
            return true;
        }
        return false;
    };
    exports.save = async ({ attachment, index, readAttachmentData, saveAttachmentToDisk, timestamp, }) => {
        if (!attachment.path && !attachment.data) {
            throw new Error('Attachment had neither path nor data');
        }
        const data = attachment.path
            ? await readAttachmentData(attachment.path)
            : attachment.data;
        const name = exports.getSuggestedFilename({ attachment, timestamp, index });
        const result = await saveAttachmentToDisk({
            data,
            name,
        });
        if (!result) {
            return null;
        }
        return result.fullPath;
    };
    exports.getSuggestedFilename = ({ attachment, timestamp, index, }) => {
        if (!lodash_1.isNumber(index) && attachment.fileName) {
            return attachment.fileName;
        }
        const prefix = 'signal';
        const suffix = timestamp
            ? moment_1.default(timestamp).format('-YYYY-MM-DD-HHmmss')
            : '';
        const fileType = exports.getFileExtension(attachment);
        const extension = fileType ? `.${fileType}` : '';
        const indexSuffix = index ? `_${lodash_1.padStart(index.toString(), 3, '0')}` : '';
        return `${prefix}${suffix}${indexSuffix}${extension}`;
    };
    exports.getFileExtension = (attachment) => {
        if (!attachment.contentType) {
            return undefined;
        }
        switch (attachment.contentType) {
            case 'video/quicktime':
                return 'mov';
            default:
                return attachment.contentType.split('/')[1];
        }
    };
});