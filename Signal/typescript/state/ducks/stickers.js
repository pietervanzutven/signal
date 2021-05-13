(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.ducks = window.ts.state.ducks || {};
    const exports = window.ts.state.ducks.stickers = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = require("lodash");
    const Client_1 = __importDefault(require("../../sql/Client"));
    const stickers_1 = require("../../../js/modules/stickers");
    const textsecure_1 = require("../../shims/textsecure");
    const events_1 = require("../../shims/events");
    const { getRecentStickers, updateStickerLastUsed, updateStickerPackStatus, } = Client_1.default;
    exports.StickerPackStatuses = [
        'known',
        'ephemeral',
        'downloaded',
        'installed',
        'pending',
        'error',
    ];
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
        await updateStickerPackStatus(packId, status, { timestamp });
        if (!fromSync) {
            // Kick this off, but don't wait for it
            textsecure_1.sendStickerPackSync(packId, packKey, true);
        }
        const recentStickers = await getRecentStickers();
        return {
            packId,
            fromSync,
            status,
            installedAt: timestamp,
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
        await updateStickerPackStatus(packId, status);
        // If there are no more references, it should be removed
        await stickers_1.maybeDeletePack(packId);
        if (!fromSync) {
            // Kick this off, but don't wait for it
            textsecure_1.sendStickerPackSync(packId, packKey, false);
        }
        const recentStickers = await getRecentStickers();
        return {
            packId,
            fromSync,
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
        await updateStickerLastUsed(packId, stickerId, time);
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
    function reducer(state = getEmptyState(), action) {
        if (action.type === 'stickers/STICKER_PACK_ADDED') {
            // ts complains due to `stickers: {}` being overridden by the payload
            // but without full confidence that that's the case, `any` and ignore
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { payload } = action;
            const newPack = Object.assign({ stickers: {} }, payload);
            return Object.assign(Object.assign({}, state), { packs: Object.assign(Object.assign({}, state.packs), { [payload.id]: newPack }) });
        }
        if (action.type === 'stickers/STICKER_ADDED') {
            const { payload } = action;
            const packToUpdate = state.packs[payload.packId];
            return Object.assign(Object.assign({}, state), { packs: Object.assign(Object.assign({}, state.packs), { [packToUpdate.id]: Object.assign(Object.assign({}, packToUpdate), { stickers: Object.assign(Object.assign({}, packToUpdate.stickers), { [payload.id]: payload }) }) }) });
        }
        if (action.type === 'stickers/STICKER_PACK_UPDATED') {
            const { payload } = action;
            const packToUpdate = state.packs[payload.packId];
            return Object.assign(Object.assign({}, state), { packs: Object.assign(Object.assign({}, state.packs), { [packToUpdate.id]: Object.assign(Object.assign({}, packToUpdate), payload.patch) }) });
        }
        if (action.type === 'stickers/INSTALL_STICKER_PACK_FULFILLED' ||
            action.type === 'stickers/UNINSTALL_STICKER_PACK_FULFILLED') {
            const { payload } = action;
            const { fromSync, installedAt, packId, status, recentStickers } = payload;
            const { packs } = state;
            const existingPack = packs[packId];
            // A pack might be deleted as part of the uninstall process
            if (!existingPack) {
                return Object.assign(Object.assign({}, state), { installedPack: state.installedPack === packId ? null : state.installedPack, recentStickers });
            }
            const isBlessed = state.blessedPacks[packId];
            const installedPack = !fromSync && !isBlessed ? packId : null;
            return Object.assign(Object.assign({}, state), {
                installedPack, packs: Object.assign(Object.assign({}, packs), {
                    [packId]: Object.assign(Object.assign({}, packs[packId]), {
                        status,
                        installedAt
                    })
                }), recentStickers
            });
        }
        if (action.type === 'stickers/CLEAR_INSTALLED_STICKER_PACK') {
            return Object.assign(Object.assign({}, state), { installedPack: null });
        }
        if (action.type === 'stickers/REMOVE_STICKER_PACK') {
            const { payload } = action;
            return Object.assign(Object.assign({}, state), { packs: lodash_1.omit(state.packs, payload) });
        }
        if (action.type === 'stickers/USE_STICKER_FULFILLED') {
            const { payload } = action;
            const { packId, stickerId, time } = payload;
            const { recentStickers, packs } = state;
            const filteredRecents = lodash_1.reject(recentStickers, item => item.packId === packId && item.stickerId === stickerId);
            const pack = packs[packId];
            const sticker = pack.stickers[stickerId];
            return Object.assign(Object.assign({}, state), { recentStickers: [payload, ...filteredRecents], packs: Object.assign(Object.assign({}, state.packs), { [packId]: Object.assign(Object.assign({}, pack), { lastUsed: time, stickers: Object.assign(Object.assign({}, pack.stickers), { [stickerId]: Object.assign(Object.assign({}, sticker), { lastUsed: time }) }) }) }) });
        }
        return state;
    }
    exports.reducer = reducer;
})();