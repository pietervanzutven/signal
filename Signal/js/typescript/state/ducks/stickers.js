(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.ducks = window.ts.state.ducks || {};
    const exports = window.ts.state.ducks.stickers = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = window.lodash;
    const data_1 = window.data;
    const stickers_1 = window.stickers;
    const textsecure_1 = window.ts.shims.textsecure;
    const events_1 = window.ts.shims.events;
    // Action Creators
    exports.actions = {
        downloadStickerPack,
        clearInstalledStickerPack,
        removeStickerPack,
        stickerAdded,
        stickerPackAdded,
        installStickerPack,
        uninstallStickerPack,
        stickerPackUpdated,
        useSticker,
    };
    function removeStickerPack(id) {
        return {
            type: 'stickers/REMOVE_STICKER_PACK',
            payload: id,
        };
    }
    function stickerAdded(payload) {
        return {
            type: 'stickers/STICKER_ADDED',
            payload,
        };
    }
    function stickerPackAdded(payload) {
        const { status, attemptedStatus } = payload;
        // We do this to trigger a toast, which is still done via Backbone
        if (status === 'error' && attemptedStatus === 'installed') {
            events_1.trigger('pack-install-failed');
        }
        return {
            type: 'stickers/STICKER_PACK_ADDED',
            payload,
        };
    }
    function downloadStickerPack(packId, packKey, options) {
        const { finalStatus } = options || { finalStatus: undefined };
        // We're just kicking this off, since it will generate more redux events
        // tslint:disable-next-line:no-floating-promises
        stickers_1.downloadStickerPack(packId, packKey, { finalStatus });
        return {
            type: 'NOOP',
            payload: null,
        };
    }
    function installStickerPack(packId, packKey, options = null) {
        return {
            type: 'stickers/INSTALL_STICKER_PACK',
            payload: doInstallStickerPack(packId, packKey, options),
        };
    }
    async function doInstallStickerPack(packId, packKey, options) {
        const { fromSync } = options || { fromSync: false };
        const status = 'installed';
        const timestamp = Date.now();
        await data_1.updateStickerPackStatus(packId, status, { timestamp });
        if (!fromSync) {
            // Kick this off, but don't wait for it
            textsecure_1.sendStickerPackSync(packId, packKey, true);
        }
        const recentStickers = await data_1.getRecentStickers();
        return {
            packId,
            installedAt: timestamp,
            status,
            recentStickers: recentStickers.map(item => ({
                packId: item.packId,
                stickerId: item.id,
            })),
        };
    }
    function uninstallStickerPack(packId, packKey, options = null) {
        return {
            type: 'stickers/UNINSTALL_STICKER_PACK',
            payload: doUninstallStickerPack(packId, packKey, options),
        };
    }
    async function doUninstallStickerPack(packId, packKey, options) {
        const { fromSync } = options || { fromSync: false };
        const status = 'downloaded';
        await data_1.updateStickerPackStatus(packId, status);
        // If there are no more references, it should be removed
        await stickers_1.maybeDeletePack(packId);
        if (!fromSync) {
            // Kick this off, but don't wait for it
            textsecure_1.sendStickerPackSync(packId, packKey, false);
        }
        const recentStickers = await data_1.getRecentStickers();
        return {
            packId,
            status,
            installedAt: null,
            recentStickers: recentStickers.map(item => ({
                packId: item.packId,
                stickerId: item.id,
            })),
        };
    }
    function clearInstalledStickerPack() {
        return { type: 'stickers/CLEAR_INSTALLED_STICKER_PACK' };
    }
    function stickerPackUpdated(packId, patch) {
        const { status, attemptedStatus } = patch;
        // We do this to trigger a toast, which is still done via Backbone
        if (status === 'error' && attemptedStatus === 'installed') {
            events_1.trigger('pack-install-failed');
        }
        return {
            type: 'stickers/STICKER_PACK_UPDATED',
            payload: {
                packId,
                patch,
            },
        };
    }
    function useSticker(packId, stickerId, time = Date.now()) {
        return {
            type: 'stickers/USE_STICKER',
            payload: doUseSticker(packId, stickerId, time),
        };
    }
    async function doUseSticker(packId, stickerId, time = Date.now()) {
        await data_1.updateStickerLastUsed(packId, stickerId, time);
        return {
            packId,
            stickerId,
            time,
        };
    }
    // Reducer
    function getEmptyState() {
        return {
            installedPack: null,
            packs: {},
            recentStickers: [],
            blessedPacks: {},
        };
    }
    // tslint:disable-next-line max-func-body-length
    function reducer(state = getEmptyState(), action) {
        if (action.type === 'stickers/STICKER_PACK_ADDED') {
            const { payload } = action;
            const newPack = Object.assign({ stickers: {} }, payload);
            return Object.assign({}, state, { packs: Object.assign({}, state.packs, { [payload.id]: newPack }) });
        }
        if (action.type === 'stickers/STICKER_ADDED') {
            const { payload } = action;
            const packToUpdate = state.packs[payload.packId];
            return Object.assign({}, state, { packs: Object.assign({}, state.packs, { [packToUpdate.id]: Object.assign({}, packToUpdate, { stickers: Object.assign({}, packToUpdate.stickers, { [payload.id]: payload }) }) }) });
        }
        if (action.type === 'stickers/STICKER_PACK_UPDATED') {
            const { payload } = action;
            const packToUpdate = state.packs[payload.packId];
            return Object.assign({}, state, { packs: Object.assign({}, state.packs, { [packToUpdate.id]: Object.assign({}, packToUpdate, payload.patch) }) });
        }
        if (action.type === 'stickers/INSTALL_STICKER_PACK_FULFILLED' ||
            action.type === 'stickers/UNINSTALL_STICKER_PACK_FULFILLED') {
            const { payload } = action;
            const { installedAt, packId, status, recentStickers } = payload;
            const { packs } = state;
            const existingPack = packs[packId];
            // A pack might be deleted as part of the uninstall process
            if (!existingPack) {
                return Object.assign({}, state, { installedPack: state.installedPack === packId ? null : state.installedPack, recentStickers });
            }
            return Object.assign({}, state, {
                installedPack: packId, packs: Object.assign({}, packs, {
                    [packId]: Object.assign({}, packs[packId], {
                        status,
                        installedAt
                    })
                }), recentStickers
            });
        }
        if (action.type === 'stickers/CLEAR_INSTALLED_STICKER_PACK') {
            return Object.assign({}, state, { installedPack: null });
        }
        if (action.type === 'stickers/REMOVE_STICKER_PACK') {
            const { payload } = action;
            return Object.assign({}, state, { packs: lodash_1.omit(state.packs, payload) });
        }
        if (action.type === 'stickers/USE_STICKER_FULFILLED') {
            const { payload } = action;
            const { packId, stickerId, time } = payload;
            const { recentStickers, packs } = state;
            const filteredRecents = lodash_1.reject(recentStickers, item => item.packId === packId && item.stickerId === stickerId);
            const pack = packs[packId];
            const sticker = pack.stickers[stickerId];
            return Object.assign({}, state, { recentStickers: [payload, ...filteredRecents], packs: Object.assign({}, state.packs, { [packId]: Object.assign({}, pack, { lastUsed: time, stickers: Object.assign({}, pack.stickers, { [stickerId]: Object.assign({}, sticker, { lastUsed: time }) }) }) }) });
        }
        return state;
    }
    exports.reducer = reducer;
})();