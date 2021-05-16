require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const MIME_1 = require("../types/MIME");
    /**
     * This follows the [MIME Sniffing Standard for images][0].
     *
     * [0]: https://mimesniff.spec.whatwg.org/#matching-an-image-type-pattern
     */
    function sniffImageMimeType(bytes) {
        const asTypedArray = new Uint8Array(bytes);
        for (let i = 0; i < TYPES.length; i += 1) {
            const type = TYPES[i];
            if (matchesType(asTypedArray, type)) {
                return type.mimeType;
            }
        }
        return undefined;
    }
    exports.sniffImageMimeType = sniffImageMimeType;
    const TYPES = [
        {
            mimeType: MIME_1.IMAGE_ICO,
            bytePattern: new Uint8Array([0x00, 0x00, 0x01, 0x00]),
        },
        {
            mimeType: MIME_1.IMAGE_ICO,
            bytePattern: new Uint8Array([0x00, 0x00, 0x02, 0x00]),
        },
        {
            mimeType: MIME_1.IMAGE_BMP,
            bytePattern: new Uint8Array([0x42, 0x4d]),
        },
        {
            mimeType: MIME_1.IMAGE_GIF,
            bytePattern: new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]),
        },
        {
            mimeType: MIME_1.IMAGE_GIF,
            bytePattern: new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]),
        },
        {
            mimeType: MIME_1.IMAGE_WEBP,
            bytePattern: new Uint8Array([
                0x52,
                0x49,
                0x46,
                0x46,
                0x00,
                0x00,
                0x00,
                0x00,
                0x57,
                0x45,
                0x42,
                0x50,
                0x56,
                0x50,
            ]),
            patternMask: new Uint8Array([
                0xff,
                0xff,
                0xff,
                0xff,
                0x00,
                0x00,
                0x00,
                0x00,
                0xff,
                0xff,
                0xff,
                0xff,
                0xff,
                0xff,
            ]),
        },
        {
            mimeType: MIME_1.IMAGE_PNG,
            bytePattern: new Uint8Array([
                0x89,
                0x50,
                0x4e,
                0x47,
                0x0d,
                0x0a,
                0x1a,
                0x0a,
            ]),
        },
        {
            mimeType: MIME_1.IMAGE_JPEG,
            bytePattern: new Uint8Array([0xff, 0xd8, 0xff]),
        },
    ];
    // This follows the [pattern matching algorithm in the spec][1].
    // [1]: https://mimesniff.spec.whatwg.org/#pattern-matching-algorithm
    function matchesType(input, type) {
        if (input.byteLength < type.bytePattern.byteLength) {
            return false;
        }
        for (let p = 0; p < type.bytePattern.length; p += 1) {
            const mask = type.patternMask ? type.patternMask[p] : 0xff;
            // We need to use a bitwise operator here, per the spec.
            // eslint-disable-next-line no-bitwise
            const maskedData = input[p] & mask;
            if (maskedData !== type.bytePattern[p]) {
                return false;
            }
        }
        return true;
    }
});