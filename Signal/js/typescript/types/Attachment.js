(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.types = window.ts.types || {};
    const exports = window.ts.types.Attachment = {};

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
    const is_1 = __importDefault(window.sindresorhus.is);
    const moment_1 = __importDefault(window.moment);
    const MIME = __importStar(window.ts.types.MIME);
    const arrayBufferToObjectURL_1 = window.ts.util.arrayBufferToObjectURL;
    const saveURLAsFile_1 = window.ts.util.saveURLAsFile;
    const protobuf_1 = window.ts.protobuf;
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
            // tslint:disable-next-line no-bitwise
            !is_1.default.undefined(attachment.flags) && (attachment.flags & flag) === flag;
        if (hasFlag) {
            return true;
        }
        const isLegacyAndroidVoiceMessage = !is_1.default.undefined(attachment.contentType) &&
            MIME.isAudio(attachment.contentType) &&
            attachment.fileName === null;
        if (isLegacyAndroidVoiceMessage) {
            return true;
        }
        return false;
    };
    exports.save = ({ attachment, document, getAbsolutePath, timestamp, }) => {
        const isObjectURLRequired = is_1.default.undefined(attachment.path);
        const url = !is_1.default.undefined(attachment.path)
            ? getAbsolutePath(attachment.path)
            : arrayBufferToObjectURL_1.arrayBufferToObjectURL({
                data: attachment.data,
                type: MIME.APPLICATION_OCTET_STREAM,
            });
        const filename = exports.getSuggestedFilename({ attachment, timestamp });
        saveURLAsFile_1.saveURLAsFile({ url, filename, document });
        if (isObjectURLRequired) {
            URL.revokeObjectURL(url);
        }
    };
    exports.getSuggestedFilename = ({ attachment, timestamp, }) => {
        if (attachment.fileName) {
            return attachment.fileName;
        }
        const prefix = 'signal-attachment';
        const suffix = timestamp
            ? moment_1.default(timestamp).format('-YYYY-MM-DD-HHmmss')
            : '';
        const fileType = exports.getFileExtension(attachment);
        const extension = fileType ? `.${fileType}` : '';
        return `${prefix}${suffix}${extension}`;
    };
    exports.getFileExtension = (attachment) => {
        if (!attachment.contentType) {
            return null;
        }
        switch (attachment.contentType) {
            case 'video/quicktime':
                return 'mov';
            default:
                return attachment.contentType.split('/')[1];
        }
    };
})();