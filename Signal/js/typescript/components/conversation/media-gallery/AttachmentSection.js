(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    window.ts.components.conversation.media_gallery = window.ts.components.conversation.media_gallery || {};
    const exports = window.ts.components.conversation.media_gallery.AttachmentSection = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const DocumentListItem_1 = window.ts.components.conversation.media_gallery.DocumentListItem;
    const MediaGridItem_1 = window.ts.components.conversation.media_gallery.MediaGridItem;
    const missingCaseError_1 = window.ts.util.missingCaseError;
    const styles = {
        container: {
            width: '100%',
        },
        header: {
            fontSize: 14,
            fontWeight: 'normal',
            lineHeight: '28px',
        },
        itemContainer: {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
        },
    };
    class AttachmentSection extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.createClickHandler = (message) => () => {
                const { onItemClick, type } = this.props;
                if (!onItemClick) {
                    return;
                }
                onItemClick({ type, message });
            };
        }
        render() {
            const { header } = this.props;
            return (react_1.default.createElement("div", { style: styles.container },
                react_1.default.createElement("h2", { style: styles.header }, header),
                react_1.default.createElement("div", { style: styles.itemContainer }, this.renderItems())));
        }
        renderItems() {
            const { i18n, messages, type } = this.props;
            return messages.map((message, index, array) => {
                const shouldShowSeparator = index < array.length - 1;
                const { attachments } = message;
                const firstAttachment = attachments[0];
                const onClick = this.createClickHandler(message);
                switch (type) {
                    case 'media':
                        return (react_1.default.createElement(MediaGridItem_1.MediaGridItem, { key: message.id, message: message, onClick: onClick }));
                    case 'documents':
                        return (react_1.default.createElement(DocumentListItem_1.DocumentListItem, { key: message.id, fileName: firstAttachment.fileName, fileSize: firstAttachment.size, i18n: i18n, shouldShowSeparator: shouldShowSeparator, onClick: onClick, timestamp: message.received_at }));
                    default:
                        return missingCaseError_1.missingCaseError(type);
                }
            });
        }
    }
    exports.AttachmentSection = AttachmentSection;
})();