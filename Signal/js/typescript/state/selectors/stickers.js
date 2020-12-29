(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.selectors = window.ts.state.selectors || {};
    const exports = window.ts.state.selectors.stickers = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const path_1 = window.path;
    const lodash_1 = window.lodash;
    const reselect_1 = window.reselect;
    const user_1 = window.ts.state.selectors.user;
    const getSticker = (packs, packId, stickerId, stickerPath, tempPath) => {
        const pack = packs[packId];
        if (!pack) {
            return;
        }
        const sticker = pack.stickers[stickerId];
        if (!sticker) {
            return;
        }
        const isEphemeral = pack.status === 'ephemeral';
        return translateStickerFromDB(sticker, stickerPath, tempPath, isEphemeral);
    };
    const translateStickerFromDB = (sticker, stickerPath, tempPath, isEphemeral) => {
        const { id, packId, emoji, path } = sticker;
        const prefix = isEphemeral ? tempPath : stickerPath;
        return {
            id,
            packId,
            emoji,
            url: path_1.join(prefix, path),
        };
    };
    exports.translatePackFromDB = (pack, packs, blessedPacks, stickersPath, tempPath) => {
        const { id, stickers, status, coverStickerId } = pack;
        const isEphemeral = status === 'ephemeral';
        // Sometimes sticker packs have a cover which isn't included in their set of stickers.
        //   We don't want to show cover-only images when previewing or picking from a pack.
        const filteredStickers = lodash_1.reject(lodash_1.values(stickers), sticker => sticker.isCoverOnly);
        const translatedStickers = lodash_1.map(filteredStickers, sticker => translateStickerFromDB(sticker, stickersPath, tempPath, isEphemeral));
        return Object.assign({}, pack, { isBlessed: Boolean(blessedPacks[id]), cover: getSticker(packs, id, coverStickerId, stickersPath, tempPath), stickers: lodash_1.sortBy(translatedStickers, sticker => sticker.id) });
    };
    const filterAndTransformPacks = (packs, packFilter, packSort, blessedPacks, stickersPath, tempPath) => {
        const list = lodash_1.filter(packs, packFilter);
        const sorted = lodash_1.orderBy(list, packSort, ['desc']);
        return sorted.map(pack => exports.translatePackFromDB(pack, packs, blessedPacks, stickersPath, tempPath));
    };
    const getStickers = (state) => state.stickers;
    exports.getPacks = reselect_1.createSelector(getStickers, (stickers) => stickers.packs);
    const getRecents = reselect_1.createSelector(getStickers, (stickers) => stickers.recentStickers);
    exports.getBlessedPacks = reselect_1.createSelector(getStickers, (stickers) => stickers.blessedPacks);
    exports.getRecentStickers = reselect_1.createSelector(getRecents, exports.getPacks, user_1.getStickersPath, user_1.getTempPath, (recents, packs, stickersPath, tempPath) => {
        return lodash_1.compact(recents.map(({ packId, stickerId }) => {
            return getSticker(packs, packId, stickerId, stickersPath, tempPath);
        }));
    });
    exports.getInstalledStickerPacks = reselect_1.createSelector(exports.getPacks, exports.getBlessedPacks, user_1.getStickersPath, user_1.getTempPath, (packs, blessedPacks, stickersPath, tempPath) => {
        return filterAndTransformPacks(packs, pack => pack.status === 'installed', pack => pack.installedAt, blessedPacks, stickersPath, tempPath);
    });
    exports.getRecentlyInstalledStickerPack = reselect_1.createSelector(exports.getInstalledStickerPacks, getStickers, (packs, { installedPack: packId }) => {
        if (!packId) {
            return null;
        }
        return packs.find(({ id }) => id === packId) || null;
    });
    exports.getReceivedStickerPacks = reselect_1.createSelector(exports.getPacks, exports.getBlessedPacks, user_1.getStickersPath, user_1.getTempPath, (packs, blessedPacks, stickersPath, tempPath) => {
        return filterAndTransformPacks(packs, pack => (pack.status === 'downloaded' || pack.status === 'pending') &&
            !blessedPacks[pack.id], pack => pack.createdAt, blessedPacks, stickersPath, tempPath);
    });
    exports.getBlessedStickerPacks = reselect_1.createSelector(exports.getPacks, exports.getBlessedPacks, user_1.getStickersPath, user_1.getTempPath, (packs, blessedPacks, stickersPath, tempPath) => {
        return filterAndTransformPacks(packs, pack => blessedPacks[pack.id] && pack.status !== 'installed', pack => pack.createdAt, blessedPacks, stickersPath, tempPath);
    });
    exports.getKnownStickerPacks = reselect_1.createSelector(exports.getPacks, exports.getBlessedPacks, user_1.getStickersPath, user_1.getTempPath, (packs, blessedPacks, stickersPath, tempPath) => {
        return filterAndTransformPacks(packs, pack => !blessedPacks[pack.id] && pack.status === 'known', pack => pack.createdAt, blessedPacks, stickersPath, tempPath);
    });
})();