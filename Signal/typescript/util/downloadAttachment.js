require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    async function downloadAttachment(attachmentData) {
        let downloaded;
        try {
            if (attachmentData.id) {
                // eslint-disable-next-line no-param-reassign
                attachmentData.cdnId = attachmentData.id;
            }
            downloaded = await window.textsecure.messageReceiver.downloadAttachment(attachmentData);
        }
        catch (error) {
            // Attachments on the server expire after 30 days, then start returning 404
            if (error && error.code === 404) {
                return null;
            }
            throw error;
        }
        return downloaded;
    }
    exports.downloadAttachment = downloadAttachment;
});