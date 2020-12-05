/* eslint-env browser */
/* global dcodeIO, libsignal */

/* eslint-disable camelcase, no-bitwise */

(function () {
  'use strict';

  window.sjcl.beware["CTR mode is dangerous because it doesn't protect message integrity."]();

  window.crypto.arrayBufferToBase64 = arrayBufferToBase64;
  window.crypto.base64ToArrayBuffer = base64ToArrayBuffer;
  window.crypto.bytesFromString = bytesFromString;
  window.crypto.concatenateBytes = concatenateBytes;
  window.crypto.constantTimeEqual = constantTimeEqual;
  window.crypto.decryptAesCtr = decryptAesCtr;
  window.crypto.decryptDeviceName = decryptDeviceName;
  window.crypto.decryptSymmetric = decryptSymmetric;
  window.crypto.deriveAccessKey = deriveAccessKey;
  window.crypto.encryptAesCtr = encryptAesCtr;
  window.crypto.encryptDeviceName = encryptDeviceName;
  window.crypto.encryptSymmetric = encryptSymmetric;
  window.crypto.fromEncodedBinaryToArrayBuffer = fromEncodedBinaryToArrayBuffer;
  window.crypto.getAccessKeyVerifier = getAccessKeyVerifier;
  window.crypto.getRandomBytes = getRandomBytes;
  window.crypto.getViewOfArrayBuffer = getViewOfArrayBuffer;
  window.crypto.getZeroes = getZeroes;
  window.crypto.highBitsToInt = highBitsToInt;
  window.crypto.hmacSha256 = hmacSha256;
  window.crypto.intsToByteHighAndLow = intsToByteHighAndLow;
  window.crypto.splitBytes = splitBytes;
  window.crypto.stringFromBytes = stringFromBytes;
  window.crypto.trimBytes = trimBytes;
  window.crypto.verifyAccessKey = verifyAccessKey;

  window.crypto.randomBytes = n => Buffer.from(window.crypto.getRandomBytes(n));

  // High-level Operations

  async function encryptDeviceName(deviceName, identityPublic) {
    const plaintext = bytesFromString(deviceName);
    const ephemeralKeyPair = await libsignal.KeyHelper.generateIdentityKeyPair();
    const masterSecret = await libsignal.Curve.async.calculateAgreement(
      identityPublic,
      ephemeralKeyPair.privKey
    );

    const key1 = await hmacSha256(masterSecret, bytesFromString('auth'));
    const syntheticIv = _getFirstBytes(await hmacSha256(key1, plaintext), 16);

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

  async function decryptDeviceName(
    { ephemeralPublic, syntheticIv, ciphertext } = {},
    identityPrivate
  ) {
    const masterSecret = await libsignal.Curve.async.calculateAgreement(
      ephemeralPublic,
      identityPrivate
    );

    const key2 = await hmacSha256(masterSecret, bytesFromString('cipher'));
    const cipherKey = await hmacSha256(key2, syntheticIv);

    const counter = getZeroes(16);
    const plaintext = await decryptAesCtr(cipherKey, ciphertext, counter);

    const key1 = await hmacSha256(masterSecret, bytesFromString('auth'));
    const ourSyntheticIv = _getFirstBytes(await hmacSha256(key1, plaintext), 16);

    if (!constantTimeEqual(ourSyntheticIv, syntheticIv)) {
      throw new Error('decryptDeviceName: synthetic IV did not match');
    }

    return stringFromBytes(plaintext);
  }

  async function deriveAccessKey(profileKey) {
    const iv = getZeroes(12);
    const plaintext = getZeroes(16);
    const accessKey = await _encrypt_aes_gcm(profileKey, iv, plaintext);
    return _getFirstBytes(accessKey, 16);
  }

  async function getAccessKeyVerifier(accessKey) {
    const plaintext = getZeroes(32);
    const hmac = await hmacSha256(accessKey, plaintext);

    return hmac;
  }

  async function verifyAccessKey(accessKey, theirVerifier) {
    const ourVerifier = await getAccessKeyVerifier(accessKey);

    if (constantTimeEqual(ourVerifier, theirVerifier)) {
      return true;
    }

    return false;
  }

  const IV_LENGTH = 16;
  const MAC_LENGTH = 16;
  const NONCE_LENGTH = 16;

  async function encryptSymmetric(key, plaintext) {
    const iv = getZeroes(IV_LENGTH);
    const nonce = getRandomBytes(NONCE_LENGTH);

    const cipherKey = await hmacSha256(key, nonce);
    const macKey = await hmacSha256(key, cipherKey);

    const cipherText = await _encrypt_aes256_CBC_PKCSPadding(
      cipherKey,
      iv,
      plaintext
    );
    const mac = _getFirstBytes(await hmacSha256(macKey, cipherText), MAC_LENGTH);

    return concatenateBytes(nonce, cipherText, mac);
  }

  async function decryptSymmetric(key, data) {
    const iv = getZeroes(IV_LENGTH);

    const nonce = _getFirstBytes(data, NONCE_LENGTH);
    const cipherText = _getBytes(
      data,
      NONCE_LENGTH,
      data.byteLength - NONCE_LENGTH - MAC_LENGTH
    );
    const theirMac = _getBytes(data, data.byteLength - MAC_LENGTH, MAC_LENGTH);

    const cipherKey = await hmacSha256(key, nonce);
    const macKey = await hmacSha256(key, cipherKey);

    const ourMac = _getFirstBytes(
      await hmacSha256(macKey, cipherText),
      MAC_LENGTH
    );
    if (!constantTimeEqual(theirMac, ourMac)) {
      throw new Error(
        'decryptSymmetric: Failed to decrypt; MAC verification failed'
      );
    }

    return _decrypt_aes256_CBC_PKCSPadding(cipherKey, iv, cipherText);
  }

  function constantTimeEqual(left, right) {
    if (left.byteLength !== right.byteLength) {
      return false;
    }
    let result = 0;
    const ta1 = new Uint8Array(left);
    const ta2 = new Uint8Array(right);
    for (let i = 0, max = left.byteLength; i < max; i += 1) {
      // eslint-disable-next-line no-bitwise
      result |= ta1[i] ^ ta2[i];
    }
    return result === 0;
  }

  // Encryption

  async function hmacSha256(key, plaintext) {
    const algorithm = {
      name: 'HMAC',
      hash: 'SHA-256',
    };
    const extractable = false;

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      key,
      algorithm,
      extractable,
      ['sign']
    );

    return window.crypto.subtle.sign(algorithm, cryptoKey, plaintext);
  }

  async function _encrypt_aes256_CBC_PKCSPadding(key, iv, plaintext) {
    const algorithm = {
      name: 'AES-CBC',
      iv,
    };
    const extractable = false;

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      key,
      algorithm,
      extractable,
      ['encrypt']
    );

    return window.crypto.subtle.encrypt(algorithm, cryptoKey, plaintext);
  }

  async function _decrypt_aes256_CBC_PKCSPadding(key, iv, plaintext) {
    const algorithm = {
      name: 'AES-CBC',
      iv,
    };
    const extractable = false;

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      key,
      algorithm,
      extractable,
      ['decrypt']
    );
    return window.crypto.subtle.decrypt(algorithm, cryptoKey, plaintext);
  }

  async function encryptAesCtr(key, plaintext, counter) {
    const keyBits = window.sjcl.codec.arrayBuffer.toBits(key)
    const ptBits = window.sjcl.codec.arrayBuffer.toBits(plaintext);
    const counterBits = window.sjcl.codec.bytes.toBits(counter);

    const aes = new window.sjcl.cipher.aes(keyBits);
    const ctBits = window.sjcl.mode.ctr.encrypt(aes, ptBits, counterBits);

    const ct = window.sjcl.codec.bytes.fromBits(ctBits);
    return new Uint8Array(ct);
  }

  async function decryptAesCtr(key, ciphertext, counter) {
    const keyBits = window.sjcl.codec.arrayBuffer.toBits(key)
    const ctBits = window.sjcl.codec.bytes.toBits(ciphertext);
    const counterBits = window.sjcl.codec.bytes.toBits(counter);

    const aes = new window.sjcl.cipher.aes(keyBits);
    const ptBits = window.sjcl.mode.ctr.decrypt(aes, ctBits, counterBits);

    const pt = window.sjcl.codec.bytes.fromBits(ptBits);
    return new Uint8Array(pt);
  }

  async function _encrypt_aes_gcm(key, iv, plaintext) {
    const keyBits = window.sjcl.codec.arrayBuffer.toBits(key)
    const ptBits = window.sjcl.codec.bytes.toBits(plaintext);
    const ivBits = window.sjcl.codec.bytes.toBits(iv);

    const aes = new window.sjcl.cipher.aes(keyBits);
    const ctBits = window.sjcl.mode.gcm.encrypt(aes, ptBits, ivBits);

    const ct = window.sjcl.codec.bytes.fromBits(ctBits);
    return new Uint8Array(ct);
  }

  // Utility

  function getRandomBytes(n) {
    const bytes = new Uint8Array(n);
    window.crypto.getRandomValues(bytes);
    return bytes;
  }

  function getZeroes(n) {
    const result = new Uint8Array(n);

    const value = 0;
    const startIndex = 0;
    const endExclusive = n;
    result.fill(value, startIndex, endExclusive);

    return result;
  }

  function highBitsToInt(byte) {
    return (byte & 0xff) >> 4;
  }

  function intsToByteHighAndLow(highValue, lowValue) {
    return ((highValue << 4) | lowValue) & 0xff;
  }

  function trimBytes(buffer, length) {
    return _getFirstBytes(buffer, length);
  }

  function arrayBufferToBase64(arrayBuffer) {
    return dcodeIO.ByteBuffer.wrap(arrayBuffer).toString('base64');
  }
  function base64ToArrayBuffer(base64string) {
    return dcodeIO.ByteBuffer.wrap(base64string, 'base64').toArrayBuffer();
  }

  function fromEncodedBinaryToArrayBuffer(key) {
    return dcodeIO.ByteBuffer.wrap(key, 'binary').toArrayBuffer();
  }

  function bytesFromString(string) {
    return dcodeIO.ByteBuffer.wrap(string, 'utf8').toArrayBuffer();
  }
  function stringFromBytes(buffer) {
    return dcodeIO.ByteBuffer.wrap(buffer).toString('utf8');
  }

  function getViewOfArrayBuffer(buffer, start, finish) {
    const source = new Uint8Array(buffer);
    const result = source.slice(start, finish);
    return result.buffer;
  }

  function concatenateBytes(...elements) {
    const length = elements.reduce(
      (total, element) => total + element.byteLength,
      0
    );

    const result = new Uint8Array(length);
    let position = 0;

    for (let i = 0, max = elements.length; i < max; i += 1) {
      const element = new Uint8Array(elements[i]);
      result.set(element, position);
      position += element.byteLength;
    }
    if (position !== result.length) {
      throw new Error('problem concatenating!');
    }

    return result.buffer;
  }

  function splitBytes(buffer, ...lengths) {
    const total = lengths.reduce((acc, length) => acc + length, 0);

    if (total !== buffer.byteLength) {
      throw new Error(
        `Requested lengths total ${total} does not match source total ${buffer.byteLength
        }`
      );
    }

    const source = new Uint8Array(buffer);
    const results = [];
    let position = 0;

    for (let i = 0, max = lengths.length; i < max; i += 1) {
      const length = lengths[i];
      const result = new Uint8Array(length);
      const section = source.slice(position, position + length);
      result.set(section);
      position += result.byteLength;

      results.push(result);
    }

    return results;
  }

  // Internal-only

  function _getFirstBytes(data, n) {
    const source = new Uint8Array(data);
    return source.subarray(0, n);
  }

  function _getBytes(data, start, n) {
    const source = new Uint8Array(data);
    return source.subarray(start, start + n);
  }

})();