(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.textsecure = window.ts.textsecure || {};
    const exports = window.ts.textsecure.Crypto = {};

    // tslint:disable no-bitwise no-default-export
    Object.defineProperty(exports, "__esModule", { value: true });
    const PROFILE_IV_LENGTH = 12; // bytes
    const PROFILE_KEY_LENGTH = 32; // bytes
    const PROFILE_TAG_LENGTH = 128; // bits
    const PROFILE_NAME_PADDED_LENGTH = 53; // bytes
    function verifyDigest(data, theirDigest) {
        return window.crypto.subtle
            .digest({ name: 'SHA-256' }, data)
            .then(ourDigest => {
                const a = new Uint8Array(ourDigest);
                const b = new Uint8Array(theirDigest);
                let result = 0;
                for (let i = 0; i < theirDigest.byteLength; i += 1) {
                    result |= a[i] ^ b[i];
                }
                if (result !== 0) {
                    throw new Error('Bad digest');
                }
            });
    }
    function calculateDigest(data) {
        return window.crypto.subtle.digest({ name: 'SHA-256' }, data);
    }
    const Crypto = {
        // Decrypts message into a raw string
        async decryptWebsocketMessage(message, signalingKey) {
            const decodedMessage = message.toArrayBuffer();
            if (signalingKey.byteLength !== 52) {
                throw new Error('Got invalid length signalingKey');
            }
            if (decodedMessage.byteLength < 1 + 16 + 10) {
                throw new Error('Got invalid length message');
            }
            if (new Uint8Array(decodedMessage)[0] !== 1) {
                throw new Error(`Got bad version number: ${new Uint8Array(decodedMessage)[0]}`);
            }
            const aesKey = signalingKey.slice(0, 32);
            const macKey = signalingKey.slice(32, 32 + 20);
            const iv = decodedMessage.slice(1, 1 + 16);
            const ciphertext = decodedMessage.slice(1 + 16, decodedMessage.byteLength - 10);
            const ivAndCiphertext = decodedMessage.slice(0, decodedMessage.byteLength - 10);
            const mac = decodedMessage.slice(decodedMessage.byteLength - 10, decodedMessage.byteLength);
            return window.libsignal.crypto
                .verifyMAC(ivAndCiphertext, macKey, mac, 10)
                .then(async () => window.libsignal.crypto.decrypt(aesKey, ciphertext, iv));
        },
        async decryptAttachment(encryptedBin, keys, theirDigest) {
            if (keys.byteLength !== 64) {
                throw new Error('Got invalid length attachment keys');
            }
            if (encryptedBin.byteLength < 16 + 32) {
                throw new Error('Got invalid length attachment');
            }
            const aesKey = keys.slice(0, 32);
            const macKey = keys.slice(32, 64);
            const iv = encryptedBin.slice(0, 16);
            const ciphertext = encryptedBin.slice(16, encryptedBin.byteLength - 32);
            const ivAndCiphertext = encryptedBin.slice(0, encryptedBin.byteLength - 32);
            const mac = encryptedBin.slice(encryptedBin.byteLength - 32, encryptedBin.byteLength);
            return window.libsignal.crypto
                .verifyMAC(ivAndCiphertext, macKey, mac, 32)
                .then(async () => {
                    if (theirDigest) {
                        return verifyDigest(encryptedBin, theirDigest);
                    }
                    return null;
                })
                .then(async () => window.libsignal.crypto.decrypt(aesKey, ciphertext, iv));
        },
        async encryptAttachment(plaintext, keys, iv) {
            if (!(plaintext instanceof ArrayBuffer) && !ArrayBuffer.isView(plaintext)) {
                throw new TypeError(`\`plaintext\` must be an \`ArrayBuffer\` or \`ArrayBufferView\`; got: ${typeof plaintext}`);
            }
            if (keys.byteLength !== 64) {
                throw new Error('Got invalid length attachment keys');
            }
            if (iv.byteLength !== 16) {
                throw new Error('Got invalid length attachment iv');
            }
            const aesKey = keys.slice(0, 32);
            const macKey = keys.slice(32, 64);
            return window.libsignal.crypto
                .encrypt(aesKey, plaintext, iv)
                .then(async (ciphertext) => {
                    const ivAndCiphertext = new Uint8Array(16 + ciphertext.byteLength);
                    ivAndCiphertext.set(new Uint8Array(iv));
                    ivAndCiphertext.set(new Uint8Array(ciphertext), 16);
                    return window.libsignal.crypto
                        .calculateMAC(macKey, ivAndCiphertext.buffer)
                        .then(async (mac) => {
                            const encryptedBin = new Uint8Array(16 + ciphertext.byteLength + 32);
                            encryptedBin.set(ivAndCiphertext);
                            encryptedBin.set(new Uint8Array(mac), 16 + ciphertext.byteLength);
                            return calculateDigest(encryptedBin.buffer).then(digest => ({
                                ciphertext: encryptedBin.buffer,
                                digest,
                            }));
                        });
                });
        },
        async encryptProfile(data, key) {
            const iv = window.libsignal.crypto.getRandomBytes(PROFILE_IV_LENGTH);
            if (key.byteLength !== PROFILE_KEY_LENGTH) {
                throw new Error('Got invalid length profile key');
            }
            if (iv.byteLength !== PROFILE_IV_LENGTH) {
                throw new Error('Got invalid length profile iv');
            }
            return window.crypto.subtle
                .importKey('raw', key, { name: 'AES-GCM' }, false, ['encrypt'])
                .then(async (keyForEncryption) => window.crypto.subtle
                    .encrypt({ name: 'AES-GCM', iv, tagLength: PROFILE_TAG_LENGTH }, keyForEncryption, data)
                    .then(ciphertext => {
                        const ivAndCiphertext = new Uint8Array(PROFILE_IV_LENGTH + ciphertext.byteLength);
                        ivAndCiphertext.set(new Uint8Array(iv));
                        ivAndCiphertext.set(new Uint8Array(ciphertext), PROFILE_IV_LENGTH);
                        return ivAndCiphertext.buffer;
                    }));
        },
        async decryptProfile(data, key) {
            if (data.byteLength < 12 + 16 + 1) {
                throw new Error(`Got too short input: ${data.byteLength}`);
            }
            const iv = data.slice(0, PROFILE_IV_LENGTH);
            const ciphertext = data.slice(PROFILE_IV_LENGTH, data.byteLength);
            if (key.byteLength !== PROFILE_KEY_LENGTH) {
                throw new Error('Got invalid length profile key');
            }
            if (iv.byteLength !== PROFILE_IV_LENGTH) {
                throw new Error('Got invalid length profile iv');
            }
            const error = new Error(); // save stack
            return window.crypto.subtle
                .importKey('raw', key, { name: 'AES-GCM' }, false, ['decrypt'])
                .then(async (keyForEncryption) => window.crypto.subtle
                    .decrypt({ name: 'AES-GCM', iv, tagLength: PROFILE_TAG_LENGTH }, keyForEncryption, ciphertext)
                    // Typescript says that there's no .catch() available here
                    // @ts-ignore
                    .catch((e) => {
                        if (e.name === 'OperationError') {
                            // bad mac, basically.
                            error.message =
                                'Failed to decrypt profile data. Most likely the profile key has changed.';
                            error.name = 'ProfileDecryptError';
                            throw error;
                        }
                    }));
        },
        async encryptProfileName(name, key) {
            const padded = new Uint8Array(PROFILE_NAME_PADDED_LENGTH);
            padded.set(new Uint8Array(name));
            return Crypto.encryptProfile(padded.buffer, key);
        },
        async decryptProfileName(encryptedProfileName, key) {
            const data = window.dcodeIO.ByteBuffer.wrap(encryptedProfileName, 'base64').toArrayBuffer();
            return Crypto.decryptProfile(data, key).then(decrypted => {
                const padded = new Uint8Array(decrypted);
                // Given name is the start of the string to the first null character
                let givenEnd;
                for (givenEnd = 0; givenEnd < padded.length; givenEnd += 1) {
                    if (padded[givenEnd] === 0x00) {
                        break;
                    }
                }
                // Family name is the next chunk of non-null characters after that first null
                let familyEnd;
                for (familyEnd = givenEnd + 1; familyEnd < padded.length; familyEnd += 1) {
                    if (padded[familyEnd] === 0x00) {
                        break;
                    }
                }
                const foundFamilyName = familyEnd > givenEnd + 1;
                return {
                    given: window.dcodeIO.ByteBuffer.wrap(padded)
                        .slice(0, givenEnd)
                        .toArrayBuffer(),
                    family: foundFamilyName
                        ? window.dcodeIO.ByteBuffer.wrap(padded)
                            .slice(givenEnd + 1, familyEnd)
                            .toArrayBuffer()
                        : null,
                };
            });
        },
        getRandomBytes(size) {
            return window.libsignal.crypto.getRandomBytes(size);
        },
    };
    exports.default = Crypto;
})();