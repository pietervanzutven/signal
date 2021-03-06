require(exports => {
    "use strict";
    // Copyright 2018-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const moment_1 = __importDefault(require("moment"));
    const lodash_1 = require("lodash");
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
            return;
        }
        const firstMediaItemWithSection = messagesWithSection[0];
        if (!firstMediaItemWithSection) {
            return;
        }
        const mediaItems = messagesWithSection.map(messageWithSection => messageWithSection.mediaItem);
        switch (firstMediaItemWithSection.type) {
            case 'today':
            case 'yesterday':
            case 'thisWeek':
            case 'thisMonth':
                // eslint-disable-next-line consistent-return
                return {
                    type: firstMediaItemWithSection.type,
                    mediaItems,
                };
            case 'yearMonth':
                // eslint-disable-next-line consistent-return
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
                // eslint-disable-next-line no-useless-return
                return;
        }
    };
    const withSection = (referenceDateTime) => (mediaItem) => {
        const today = moment_1.default(referenceDateTime).startOf('day');
        const yesterday = moment_1.default(referenceDateTime).subtract(1, 'day').startOf('day');
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
});