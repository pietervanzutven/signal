(function () {
    "use strict";

    window.ts = window.ts || {};
    const exports = window.ts.Crypto = {};

    window.sjcl.beware["CTR mode is dangerous because it doesn't protect message integrity."]();
    window.crypto.randomBytes = n => Buffer.from(window.ts.Crypto.getRandomBytes(n));

    // Yep, we're doing some bitwise stuff in an encryption-related file
    // tslint:disable no-bitwise
    Object.defineProperty(exports, "__esModule", { value: true });
    // We want some extra variables to make the decrption algorithm easier to understand
    // tslint:disable no-unnecessary-local-variable
    // Seems that tslint doesn't understand that crypto.subtle.importKey does return a Promise
    // tslint:disable await-promise
    function typedArrayToArrayBuffer(typedArray) {
        const { buffer, byteOffset, byteLength } = typedArray;
        // tslint:disable-next-line no-unnecessary-type-assertion
        return buffer.slice(byteOffset, byteLength + byteOffset);
    }
    exports.typedArrayToArrayBuffer = typedArrayToArrayBuffer;
    function arrayBufferToBase64(arrayBuffer) {
        return window.dcodeIO.ByteBuffer.wrap(arrayBuffer).toString('base64');
    }
    exports.arrayBufferToBase64 = arrayBufferToBase64;
    function arrayBufferToHex(arrayBuffer) {
        return window.dcodeIO.ByteBuffer.wrap(arrayBuffer).toString('hex');
    }
    exports.arrayBufferToHex = arrayBufferToHex;
    function base64ToArrayBuffer(base64string) {
        return window.dcodeIO.ByteBuffer.wrap(base64string, 'base64').toArrayBuffer();
    }
    exports.base64ToArrayBuffer = base64ToArrayBuffer;
    function hexToArrayBuffer(hexString) {
        return window.dcodeIO.ByteBuffer.wrap(hexString, 'hex').toArrayBuffer();
    }
    exports.hexToArrayBuffer = hexToArrayBuffer;
    function fromEncodedBinaryToArrayBuffer(key) {
        return window.dcodeIO.ByteBuffer.wrap(key, 'binary').toArrayBuffer();
    }
    exports.fromEncodedBinaryToArrayBuffer = fromEncodedBinaryToArrayBuffer;
    function bytesFromString(string) {
        return window.dcodeIO.ByteBuffer.wrap(string, 'utf8').toArrayBuffer();
    }
    exports.bytesFromString = bytesFromString;
    function stringFromBytes(buffer) {
        return window.dcodeIO.ByteBuffer.wrap(buffer).toString('utf8');
    }
    exports.stringFromBytes = stringFromBytes;
    function hexFromBytes(buffer) {
        return window.dcodeIO.ByteBuffer.wrap(buffer).toString('hex');
    }
    exports.hexFromBytes = hexFromBytes;
    function bytesFromHexString(string) {
        return window.dcodeIO.ByteBuffer.wrap(string, 'hex').toArrayBuffer();
    }
    exports.bytesFromHexString = bytesFromHexString;
    async function deriveStickerPackKey(packKey) {
        const salt = getZeroes(32);
        const info = bytesFromString('Sticker Pack');
        const [part1, part2] = await window.libsignal.HKDF.deriveSecrets(packKey, salt, info);
        return concatenateBytes(part1, part2);
    }
    exports.deriveStickerPackKey = deriveStickerPackKey;
    // High-level Operations
    async function encryptDeviceName(deviceName, identityPublic) {
        const plaintext = bytesFromString(deviceName);
        const ephemeralKeyPair = await window.libsignal.KeyHelper.generateIdentityKeyPair();
        const masterSecret = await window.libsignal.Curve.async.calculateAgreement(identityPublic, ephemeralKeyPair.privKey);
        const key1 = await hmacSha256(masterSecret, bytesFromString('auth'));
        const syntheticIv = getFirstBytes(await hmacSha256(key1, plaintext), 16);
        const key2 = await hmacSha256(masterSecret, bytesFromString('cipher'));
        const cipherKey = await hmacSha256(key2, syntheticIv);
        const counter = getZeroes(16);
        const ciphertext = await encryptAesCtr(cipherKey, plaintext, counter);
        return {
            ephemeralPublic: ephemeralKeyPair.pubKey,
            syntheticIv,
            ciphertext,
        };
    }
    exports.encryptDeviceName = encryptDeviceName;
    async function decryptDeviceName({ ephemeralPublic, syntheticIv, ciphertext, }, identityPrivate) {
        const masterSecret = await window.libsignal.Curve.async.calculateAgreement(ephemeralPublic, identityPrivate);
        const key2 = await hmacSha256(masterSecret, bytesFromString('cipher'));
        const cipherKey = await hmacSha256(key2, syntheticIv);
        const counter = getZeroes(16);
        const plaintext = await decryptAesCtr(cipherKey, ciphertext, counter);
        const key1 = await hmacSha256(masterSecret, bytesFromString('auth'));
        const ourSyntheticIv = getFirstBytes(await hmacSha256(key1, plaintext), 16);
        if (!constantTimeEqual(ourSyntheticIv, syntheticIv)) {
            throw new Error('decryptDeviceName: synthetic IV did not match');
        }
        return stringFromBytes(plaintext);
    }
    exports.decryptDeviceName = decryptDeviceName;
    // Path structure: 'fa/facdf99c22945b1c9393345599a276f4b36ad7ccdc8c2467f5441b742c2d11fa'
    function getAttachmentLabel(path) {
        const filename = path.slice(3);
        return base64ToArrayBuffer(filename);
    }
    exports.getAttachmentLabel = getAttachmentLabel;
    const PUB_KEY_LENGTH = 32;
    async function encryptAttachment(staticPublicKey, path, plaintext) {
        const uniqueId = getAttachmentLabel(path);
        return encryptFile(staticPublicKey, uniqueId, plaintext);
    }
    exports.encryptAttachment = encryptAttachment;
    async function decryptAttachment(staticPrivateKey, path, data) {
        const uniqueId = getAttachmentLabel(path);
        return decryptFile(staticPrivateKey, uniqueId, data);
    }
    exports.decryptAttachment = decryptAttachment;
    async function encryptFile(staticPublicKey, uniqueId, plaintext) {
        const ephemeralKeyPair = await window.libsignal.KeyHelper.generateIdentityKeyPair();
        const agreement = await window.libsignal.Curve.async.calculateAgreement(staticPublicKey, ephemeralKeyPair.privKey);
        const key = await hmacSha256(agreement, uniqueId);
        const prefix = ephemeralKeyPair.pubKey.slice(1);
        return concatenateBytes(prefix, await encryptSymmetric(key, plaintext));
    }
    exports.encryptFile = encryptFile;
    async function decryptFile(staticPrivateKey, uniqueId, data) {
        const ephemeralPublicKey = getFirstBytes(data, PUB_KEY_LENGTH);
        const ciphertext = _getBytes(data, PUB_KEY_LENGTH, data.byteLength);
        const agreement = await window.libsignal.Curve.async.calculateAgreement(ephemeralPublicKey, staticPrivateKey);
        const key = await hmacSha256(agreement, uniqueId);
        return decryptSymmetric(key, ciphertext);
    }
    exports.decryptFile = decryptFile;
    async function deriveAccessKey(profileKey) {
        const iv = getZeroes(12);
        const plaintext = getZeroes(16);
        const accessKey = await _encrypt_aes_gcm(profileKey, iv, plaintext);
        return getFirstBytes(accessKey, 16);
    }
    exports.deriveAccessKey = deriveAccessKey;
    async function getAccessKeyVerifier(accessKey) {
        const plaintext = getZeroes(32);
        return hmacSha256(accessKey, plaintext);
    }
    exports.getAccessKeyVerifier = getAccessKeyVerifier;
    async function verifyAccessKey(accessKey, theirVerifier) {
        const ourVerifier = await getAccessKeyVerifier(accessKey);
        if (constantTimeEqual(ourVerifier, theirVerifier)) {
            return true;
        }
        return false;
    }
    exports.verifyAccessKey = verifyAccessKey;
    const IV_LENGTH = 16;
    const MAC_LENGTH = 16;
    const NONCE_LENGTH = 16;
    async function encryptSymmetric(key, plaintext) {
        const iv = getZeroes(IV_LENGTH);
        const nonce = getRandomBytes(NONCE_LENGTH);
        const cipherKey = await hmacSha256(key, nonce);
        const macKey = await hmacSha256(key, cipherKey);
        const cipherText = await _encrypt_aes256_CBC_PKCSPadding(cipherKey, iv, plaintext);
        const mac = getFirstBytes(await hmacSha256(macKey, cipherText), MAC_LENGTH);
        return concatenateBytes(nonce, cipherText, mac);
    }
    exports.encryptSymmetric = encryptSymmetric;
    async function decryptSymmetric(key, data) {
        const iv = getZeroes(IV_LENGTH);
        const nonce = getFirstBytes(data, NONCE_LENGTH);
        const cipherText = _getBytes(data, NONCE_LENGTH, data.byteLength - NONCE_LENGTH - MAC_LENGTH);
        const theirMac = _getBytes(data, data.byteLength - MAC_LENGTH, MAC_LENGTH);
        const cipherKey = await hmacSha256(key, nonce);
        const macKey = await hmacSha256(key, cipherKey);
        const ourMac = getFirstBytes(await hmacSha256(macKey, cipherText), MAC_LENGTH);
        if (!constantTimeEqual(theirMac, ourMac)) {
            throw new Error('decryptSymmetric: Failed to decrypt; MAC verification failed');
        }
        return _decrypt_aes256_CBC_PKCSPadding(cipherKey, iv, cipherText);
    }
    exports.decryptSymmetric = decryptSymmetric;
    function constantTimeEqual(left, right) {
        if (left.byteLength !== right.byteLength) {
            return false;
        }
        let result = 0;
        const ta1 = new Uint8Array(left);
        const ta2 = new Uint8Array(right);
        const max = left.byteLength;
        for (let i = 0; i < max; i += 1) {
            // eslint-disable-next-line no-bitwise
            result |= ta1[i] ^ ta2[i];
        }
        return result === 0;
    }
    exports.constantTimeEqual = constantTimeEqual;
    // Encryption
    async function hmacSha256(key, plaintext) {
        const algorithm = {
            name: 'HMAC',
            hash: 'SHA-256',
        };
        const extractable = false;
        const cryptoKey = await window.crypto.subtle.importKey('raw', key, algorithm, extractable, ['sign']);
        return window.crypto.subtle.sign(algorithm, cryptoKey, plaintext);
    }
    exports.hmacSha256 = hmacSha256;
    async function _encrypt_aes256_CBC_PKCSPadding(key, iv, plaintext) {
        const algorithm = {
            name: 'AES-CBC',
            iv,
        };
        const extractable = false;
        const cryptoKey = await window.crypto.subtle.importKey('raw', key, algorithm, extractable, ['encrypt']);
        return window.crypto.subtle.encrypt(algorithm, cryptoKey, plaintext);
    }
    exports._encrypt_aes256_CBC_PKCSPadding = _encrypt_aes256_CBC_PKCSPadding;
    async function _decrypt_aes256_CBC_PKCSPadding(key, iv, plaintext) {
        const algorithm = {
            name: 'AES-CBC',
            iv,
        };
        const extractable = false;
        const cryptoKey = await window.crypto.subtle.importKey('raw', key, algorithm, extractable, ['decrypt']);
        return window.crypto.subtle.decrypt(algorithm, cryptoKey, plaintext);
    }
    exports._decrypt_aes256_CBC_PKCSPadding = _decrypt_aes256_CBC_PKCSPadding;
    async function encryptAesCtr(key, plaintext, counter) {
        const keyBits = window.sjcl.codec.arrayBuffer.toBits(key)
        const ptBits = window.sjcl.codec.arrayBuffer.toBits(plaintext);
        const counterBits = window.sjcl.codec.arrayBuffer.toBits(counter);

        const aes = new window.sjcl.cipher.aes(keyBits);
        const ctBits = window.sjcl.mode.ctr.encrypt(aes, ptBits, counterBits);

        const ct = window.sjcl.codec.bytes.fromBits(ctBits);
        return new Uint8Array(ct);
    }
    exports.encryptAesCtr = encryptAesCtr;
    async function decryptAesCtr(key, ciphertext, counter) {
        const keyBits = window.sjcl.codec.arrayBuffer.toBits(key)
        const ctBits = window.sjcl.codec.arrayBuffer.toBits(ciphertext);
        const counterBits = window.sjcl.codec.arrayBuffer.toBits(counter);

        const aes = new window.sjcl.cipher.aes(keyBits);
        const ptBits = window.sjcl.mode.ctr.decrypt(aes, ctBits, counterBits);

        const pt = window.sjcl.codec.bytes.fromBits(ptBits);
        return new Uint8Array(pt);
    }
    exports.decryptAesCtr = decryptAesCtr;
    async function _encrypt_aes_gcm(key, iv, plaintext) {
        const keyBits = window.sjcl.codec.arrayBuffer.toBits(key)
        const ptBits = window.sjcl.codec.arrayBuffer.toBits(plaintext);
        const ivBits = window.sjcl.codec.arrayBuffer.toBits(iv);

        const aes = new window.sjcl.cipher.aes(keyBits);
        const ctBits = window.sjcl.mode.gcm.encrypt(aes, ptBits, ivBits);

        const ct = window.sjcl.codec.bytes.fromBits(ctBits);
        return new Uint8Array(ct);
    }
    exports._encrypt_aes_gcm = _encrypt_aes_gcm;
    // Utility
    function getRandomBytes(n) {
        const bytes = new Uint8Array(n);
        window.crypto.getRandomValues(bytes);
        return typedArrayToArrayBuffer(bytes);
    }
    exports.getRandomBytes = getRandomBytes;
    function getRandomValue(low, high) {
        const diff = high - low;
        const bytes = new Uint32Array(1);
        window.crypto.getRandomValues(bytes);
        // Because high and low are inclusive
        const mod = diff + 1;
        return (bytes[0] % mod) + low;
    }
    exports.getRandomValue = getRandomValue;
    function getZeroes(n) {
        const result = new Uint8Array(n);
        const value = 0;
        const startIndex = 0;
        const endExclusive = n;
        result.fill(value, startIndex, endExclusive);
        return typedArrayToArrayBuffer(result);
    }
    exports.getZeroes = getZeroes;
    function highBitsToInt(byte) {
        return (byte & 0xff) >> 4;
    }
    exports.highBitsToInt = highBitsToInt;
    function intsToByteHighAndLow(highValue, lowValue) {
        return ((highValue << 4) | lowValue) & 0xff;
    }
    exports.intsToByteHighAndLow = intsToByteHighAndLow;
    function trimBytes(buffer, length) {
        return getFirstBytes(buffer, length);
    }
    exports.trimBytes = trimBytes;
    function getViewOfArrayBuffer(buffer, start, finish) {
        const source = new Uint8Array(buffer);
        const result = source.slice(start, finish);
        return result.buffer;
    }
    exports.getViewOfArrayBuffer = getViewOfArrayBuffer;
    function concatenateBytes(...elements) {
        const length = elements.reduce((total, element) => total + element.byteLength, 0);
        const result = new Uint8Array(length);
        let position = 0;
        const max = elements.length;
        for (let i = 0; i < max; i += 1) {
            const element = new Uint8Array(elements[i]);
            result.set(element, position);
            position += element.byteLength;
        }
        if (position !== result.length) {
            throw new Error('problem concatenating!');
        }
        return typedArrayToArrayBuffer(result);
    }
    exports.concatenateBytes = concatenateBytes;
    function splitBytes(buffer, ...lengths) {
        const total = lengths.reduce((acc, length) => acc + length, 0);
        if (total !== buffer.byteLength) {
            throw new Error(`Requested lengths total ${total} does not match source total ${buffer.byteLength}`);
        }
        const source = new Uint8Array(buffer);
        const results = [];
        let position = 0;
        const max = lengths.length;
        for (let i = 0; i < max; i += 1) {
            const length = lengths[i];
            const result = new Uint8Array(length);
            const section = source.slice(position, position + length);
            result.set(section);
            position += result.byteLength;
            results.push(typedArrayToArrayBuffer(result));
        }
        return results;
    }
    exports.splitBytes = splitBytes;
    function getFirstBytes(data, n) {
        const source = new Uint8Array(data);
        return typedArrayToArrayBuffer(source.subarray(0, n));
    }
    exports.getFirstBytes = getFirstBytes;
    // Internal-only
    function _getBytes(data, start, n) {
        const source = new Uint8Array(data);
        return typedArrayToArrayBuffer(source.subarray(start, start + n));
    }
    exports._getBytes = _getBytes;
})();