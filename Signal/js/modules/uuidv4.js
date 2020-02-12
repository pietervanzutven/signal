﻿// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).

// getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
// find the complete implementation of crypto (msCrypto) on IE11.
var getRandomValues =
  (typeof crypto != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
  (typeof msCrypto != 'undefined' &&
    typeof window.msCrypto.getRandomValues == 'function' &&
    msCrypto.getRandomValues.bind(msCrypto));

var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef
function rng() {
    if (!getRandomValues) {
        throw new Error(
          'uuid: This browser does not seem to support crypto.getRandomValues(). If you need to support this browser, please provide a custom random number generator through options.rng.'
        );
    }
    return getRandomValues(rnds8);
}

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
    byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
    var i = offset || 0;
    var bth = byteToHex;
    // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
    return [
      bth[buf[i++]],
      bth[buf[i++]],
      bth[buf[i++]],
      bth[buf[i++]],
      '-',
      bth[buf[i++]],
      bth[buf[i++]],
      '-',
      bth[buf[i++]],
      bth[buf[i++]],
      '-',
      bth[buf[i++]],
      bth[buf[i++]],
      '-',
      bth[buf[i++]],
      bth[buf[i++]],
      bth[buf[i++]],
      bth[buf[i++]],
      bth[buf[i++]],
      bth[buf[i++]],
    ].join('');
}

function getGuid(options, buf, offset) {
    var i = (buf && offset) || 0;

    if (typeof options == 'string') {
        buf = options === 'binary' ? new Array(16) : null;
        options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
        for (var ii = 0; ii < 16; ++ii) {
            buf[i + ii] = rnds[ii];
        }
    }

    return buf || bytesToUuid(rnds);
}