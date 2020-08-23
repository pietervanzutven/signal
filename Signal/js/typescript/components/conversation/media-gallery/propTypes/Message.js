(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    window.ts.components.conversation.media_gallery = window.ts.components.conversation.media_gallery || {};
    window.ts.components.conversation.media_gallery.propTypes = window.ts.components.conversation.media_gallery.propTypes || {};
    const exports = window.ts.components.conversation.media_gallery.propTypes.Message = {};

    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
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
    /**
     * @prettier
     */
    const is_1 = __importDefault(window.sindresorhus.is);
    const lodash_1 = window.lodash;
    const MIME = __importStar(window.ts.types.MIME);
    const arrayBufferToObjectURL_1 = window.ts.util.arrayBufferToObjectURL;
    const DEFAULT_CONTENT_TYPE = 'application/octet-stream';
    exports.loadWithObjectURL = (loadMessage) => (messages) => __awaiter(this, void 0, void 0, function* () {
        if (!is_1.default.function_(loadMessage)) {
            throw new TypeError("'loadMessage' must be a function");
        }
        if (!is_1.default.array(messages)) {
            throw new TypeError("'messages' must be an array");
        }
        // Messages with video are too expensive to load into memory, so we don’t:
        const [, messagesWithoutVideo] = lodash_1.partition(messages, hasVideoAttachment);
        const loadedMessagesWithoutVideo = yield Promise.all(messagesWithoutVideo.map(loadMessage));
        const loadedMessages = lodash_1.sortBy(
        // // Only show images for MVP:
        // [...messagesWithVideo, ...loadedMessagesWithoutVideo],
        loadedMessagesWithoutVideo, message => -message.received_at);
        return loadedMessages.map(withObjectURL);
    });
    const hasVideoAttachment = (message) => message.attachments.some(attachment => !is_1.default.undefined(attachment.contentType) &&
        MIME.isVideo(attachment.contentType));
    const withObjectURL = (message) => {
        if (message.attachments.length === 0) {
            throw new TypeError('`message.attachments` cannot be empty');
        }
        const attachment = message.attachments[0];
        if (typeof attachment.contentType === 'undefined') {
            throw new TypeError('`attachment.contentType` is required');
        }
        if (MIME.isVideo(attachment.contentType)) {
            return Object.assign({}, message, { objectURL: 'images/video.svg' });
        }
        const objectURL = arrayBufferToObjectURL_1.arrayBufferToObjectURL({
            data: attachment.data,
            type: attachment.contentType || DEFAULT_CONTENT_TYPE,
        });
        return Object.assign({}, message, { objectURL });
    };
})();