(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.textsecure = window.ts.textsecure || {};
    const exports = window.ts.textsecure.Helpers = {};

    // tslint:disable no-default-export
    Object.defineProperty(exports, "__esModule", { value: true });
    let ByteBuffer;
    const arrayBuffer = new ArrayBuffer(0);
    const uint8Array = new Uint8Array();
    let StaticByteBufferProto;
    // @ts-ignore
    const StaticArrayBufferProto = arrayBuffer.__proto__;
    // @ts-ignore
    const StaticUint8ArrayProto = uint8Array.__proto__;
    function getString(thing) {
        // Note: we must make this at runtime because it's loaded in the browser context
        if (!ByteBuffer) {
            ByteBuffer = new window.dcodeIO.ByteBuffer();
        }
        if (!StaticByteBufferProto) {
            // @ts-ignore
            StaticByteBufferProto = ByteBuffer.__proto__;
        }
        if (thing === Object(thing)) {
            if (thing.__proto__ === StaticUint8ArrayProto) {
                return String.fromCharCode.apply(null, thing);
            }
            if (thing.__proto__ === StaticArrayBufferProto) {
                return getString(new Uint8Array(thing));
            }
            if (thing.__proto__ === StaticByteBufferProto) {
                return thing.toString('binary');
            }
        }
        return thing;
    }
    function getStringable(thing) {
        return (typeof thing === 'string' ||
            typeof thing === 'number' ||
            typeof thing === 'boolean' ||
            (thing === Object(thing) &&
                (thing.__proto__ === StaticArrayBufferProto ||
                    thing.__proto__ === StaticUint8ArrayProto ||
                    thing.__proto__ === StaticByteBufferProto)));
    }
    function ensureStringed(thing) {
        if (getStringable(thing)) {
            return getString(thing);
        }
        else if (thing instanceof Array) {
            const res = [];
            for (let i = 0; i < thing.length; i += 1) {
                res[i] = ensureStringed(thing[i]);
            }
            return res;
        }
        else if (thing === Object(thing)) {
            const res = {};
            // tslint:disable-next-line forin no-for-in no-default-export
            for (const key in thing) {
                res[key] = ensureStringed(thing[key]);
            }
            return res;
        }
        else if (thing === null) {
            return null;
        }
        throw new Error(`unsure of how to jsonify object of type ${typeof thing}`);
    }
    function stringToArrayBuffer(string) {
        if (typeof string !== 'string') {
            throw new TypeError("'string' must be a string");
        }
        const array = new Uint8Array(string.length);
        for (let i = 0; i < string.length; i += 1) {
            array[i] = string.charCodeAt(i);
        }
        return array.buffer;
    }
    // Number formatting utils
    const utils = {
        getString,
        isNumberSane: (number) => number[0] === '+' && /^[0-9]+$/.test(number.substring(1)),
        jsonThing: (thing) => JSON.stringify(ensureStringed(thing)),
        stringToArrayBuffer,
        unencodeNumber: (number) => number.split('.'),
    };
    exports.default = utils;
})();