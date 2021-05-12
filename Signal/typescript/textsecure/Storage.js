(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.textsecure = window.ts.textsecure || {};
    const exports = window.ts.textsecure.Storage = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const Helpers_1 = __importDefault(require("./Helpers"));
    // Default implmentation working with localStorage
    const localStorageImpl = {
        put(key, value) {
            if (value === undefined) {
                throw new Error('Tried to store undefined');
            }
            localStorage.setItem(`${key}`, Helpers_1.default.jsonThing(value));
        },
        get(key, defaultValue) {
            const value = localStorage.getItem(`${key}`);
            if (value === null) {
                return defaultValue;
            }
            return JSON.parse(value);
        },
        remove(key) {
            localStorage.removeItem(`${key}`);
        },
    };
    const Storage = {
        impl: localStorageImpl,
        put(key, value) {
            return Storage.impl.put(key, value);
        },
        get(key, defaultValue) {
            return Storage.impl.get(key, defaultValue);
        },
        remove(key) {
            return Storage.impl.remove(key);
        },
    };
    exports.default = Storage;
})();