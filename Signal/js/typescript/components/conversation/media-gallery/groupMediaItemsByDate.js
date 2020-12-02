(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    window.ts.components.conversation.media_gallery = window.ts.components.conversation.media_gallery || {};
    const exports = window.ts.components.conversation.media_gallery.groupMediaItemsByDate = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const moment_1 = __importDefault(window.moment);
    const lodash_1 = window.lodash;
    exports.groupMediaItemsByDate = (timestamp, mediaItems) => {
        const referenceDateTime = moment_1.default.utc(timestamp);
        const sortedMediaItem = lodash_1.sortBy(mediaItems, mediaItem => {
            const { message } = mediaItem;
            return -message.received_at;
        });
        const messagesWithSection = sortedMediaItem.map(withSection(referenceDateTime));
        const groupedMediaItem = lodash_1.groupBy(messagesWithSection, 'type');
        const yearMonthMediaItem = Object.values(lodash_1.groupBy(groupedMediaItem.yearMonth, 'order')).reverse();
        return lodash_1.compact([
            toSection(groupedMediaItem.today),
            toSection(groupedMediaItem.yesterday),
            toSection(groupedMediaItem.thisWeek),
            toSection(groupedMediaItem.thisMonth),
            ...yearMonthMediaItem.map(toSection),
        ]);
    };
    const toSection = (messagesWithSection) => {
        if (!messagesWithSection || messagesWithSection.length === 0) {
            return null;
        }
        const firstMediaItemWithSection = messagesWithSection[0];
        if (!firstMediaItemWithSection) {
            return null;
        }
        const mediaItems = messagesWithSection.map(messageWithSection => messageWithSection.mediaItem);
        switch (firstMediaItemWithSection.type) {
            case 'today':
            case 'yesterday':
            case 'thisWeek':
            case 'thisMonth':
                return {
                    type: firstMediaItemWithSection.type,
                    mediaItems,
                };
            case 'yearMonth':
                return {
                    type: firstMediaItemWithSection.type,
                    year: firstMediaItemWithSection.year,
                    month: firstMediaItemWithSection.month,
                    mediaItems,
                };
            default:
                // NOTE: Investigate why we get the following error:
                // error TS2345: Argument of type 'any' is not assignable to parameter
                // of type 'never'.
                // return missingCaseError(firstMediaItemWithSection.type);
                return null;
        }
    };
    const withSection = (referenceDateTime) => (mediaItem) => {
        const today = moment_1.default(referenceDateTime).startOf('day');
        const yesterday = moment_1.default(referenceDateTime)
            .subtract(1, 'day')
            .startOf('day');
        const thisWeek = moment_1.default(referenceDateTime).startOf('isoWeek');
        const thisMonth = moment_1.default(referenceDateTime).startOf('month');
        const { message } = mediaItem;
        const mediaItemReceivedDate = moment_1.default.utc(message.received_at);
        if (mediaItemReceivedDate.isAfter(today)) {
            return {
                order: 0,
                type: 'today',
                mediaItem,
            };
        }
        if (mediaItemReceivedDate.isAfter(yesterday)) {
            return {
                order: 1,
                type: 'yesterday',
                mediaItem,
            };
        }
        if (mediaItemReceivedDate.isAfter(thisWeek)) {
            return {
                order: 2,
                type: 'thisWeek',
                mediaItem,
            };
        }
        if (mediaItemReceivedDate.isAfter(thisMonth)) {
            return {
                order: 3,
                type: 'thisMonth',
                mediaItem,
            };
        }
        const month = mediaItemReceivedDate.month();
        const year = mediaItemReceivedDate.year();
        return {
            order: year * 100 + month,
            type: 'yearMonth',
            month,
            year,
            mediaItem,
        };
    };
})();