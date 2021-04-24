(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.types = window.ts.types || {};
    window.ts.types.message = window.ts.types.message || {};
    const exports = window.ts.types.message.initializeAttachmentMetadata = {}

    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const Attachment = __importStar(window.ts.types.Attachment);
    const IndexedDB = __importStar(window.ts.types.IndexedDB);
    const hasAttachment = (predicate) => (message) => IndexedDB.toIndexablePresence(message.attachments.some(predicate));
    const hasFileAttachment = hasAttachment(Attachment.isFile);
    const hasVisualMediaAttachment = hasAttachment(Attachment.isVisualMedia);
    exports.initializeAttachmentMetadata = async (message) => {
        if (message.type === 'verified-change') {
            return message;
        }
        if (message.type === 'message-history-unsynced') {
            return message;
        }
        if (message.messageTimer || message.isViewOnce) {
            return message;
        }
        const attachments = message.attachments.filter((attachment) => attachment.contentType !== 'text/x-signal-plain');
        const hasAttachments = IndexedDB.toIndexableBoolean(attachments.length > 0);
        const hasFileAttachments = hasFileAttachment(Object.assign(Object.assign({}, message), { attachments }));
        const hasVisualMediaAttachments = hasVisualMediaAttachment(Object.assign(Object.assign({}, message), { attachments }));
        return Object.assign(Object.assign({}, message), {
            hasAttachments,
            hasFileAttachments,
            hasVisualMediaAttachments
        });
    };
})();