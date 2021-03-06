(function () {
    "use strict";

    window.ts = window.ts || {};
    const exports = window.ts.WebAPI = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const websocket_1 = window.websocket;
    const node_fetch_1 = __importDefault(window.node_fetch);
    const proxy_agent_1 = __importDefault(window.proxy_agent);
    const https_1 = window.https;
    const is_1 = __importDefault(window.sindresorhus.is);
    const stickers_1 = window.stickers;
    const Crypto_1 = window.ts.Crypto;
    const p_queue_1 = __importDefault(window.p_queue);
    const uuid_1 = window.uuid;
    // tslint:disable no-bitwise
    function _btoa(str) {
        let buffer;
        if (str instanceof Buffer) {
            buffer = str;
        }
        else {
            buffer = Buffer.from(str.toString(), 'binary');
        }
        return buffer.toString('base64');
    }
    const _call = (object) => Object.prototype.toString.call(object);
    const ArrayBufferToString = _call(new ArrayBuffer(0));
    const Uint8ArrayToString = _call(new Uint8Array());
    function _getString(thing) {
        if (typeof thing !== 'string') {
            if (_call(thing) === Uint8ArrayToString) {
                return String.fromCharCode.apply(null, thing);
            }
            if (_call(thing) === ArrayBufferToString) {
                return _getString(new Uint8Array(thing));
            }
        }
        return thing;
    }
    // prettier-ignore
    function _b64ToUint6(nChr) {
        return nChr > 64 && nChr < 91
            ? nChr - 65
            : nChr > 96 && nChr < 123
                ? nChr - 71
                : nChr > 47 && nChr < 58
                    ? nChr + 4
                    : nChr === 43
                        ? 62
                        : nChr === 47
                            ? 63
                            : 0;
    }
    function _getStringable(thing) {
        return (typeof thing === 'string' ||
            typeof thing === 'number' ||
            typeof thing === 'boolean' ||
            (thing === Object(thing) &&
                (_call(thing) === ArrayBufferToString ||
                    _call(thing) === Uint8ArrayToString)));
    }
    function _ensureStringed(thing) {
        if (_getStringable(thing)) {
            return _getString(thing);
        }
        else if (thing instanceof Array) {
            const res = [];
            for (let i = 0; i < thing.length; i += 1) {
                res[i] = _ensureStringed(thing[i]);
            }
            return res;
        }
        else if (thing === Object(thing)) {
            const res = {};
            // tslint:disable-next-line forin no-for-in
            for (const key in thing) {
                res[key] = _ensureStringed(thing[key]);
            }
            return res;
        }
        else if (thing === null) {
            return null;
        }
        else if (thing === undefined) {
            return undefined;
        }
        throw new Error(`unsure of how to jsonify object of type ${typeof thing}`);
    }
    function _jsonThing(thing) {
        return JSON.stringify(_ensureStringed(thing));
    }
    function _base64ToBytes(sBase64, nBlocksSize) {
        const sB64Enc = sBase64.replace(/[^A-Za-z0-9+/]/g, '');
        const nInLen = sB64Enc.length;
        const nOutLen = nBlocksSize
            ? Math.ceil(((nInLen * 3 + 1) >> 2) / nBlocksSize) * nBlocksSize
            : (nInLen * 3 + 1) >> 2;
        const aBBytes = new ArrayBuffer(nOutLen);
        const taBytes = new Uint8Array(aBBytes);
        let nMod3 = 0;
        let nMod4 = 0;
        let nUint24 = 0;
        let nOutIdx = 0;
        for (let nInIdx = 0; nInIdx < nInLen; nInIdx += 1) {
            nMod4 = nInIdx & 3;
            // tslint:disable-next-line binary-expression-operand-order
            nUint24 |= _b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << (18 - 6 * nMod4);
            if (nMod4 === 3 || nInLen - nInIdx === 1) {
                for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3 += 1, nOutIdx += 1) {
                    taBytes[nOutIdx] = (nUint24 >>> ((16 >>> nMod3) & 24)) & 255;
                }
                nUint24 = 0;
            }
        }
        return aBBytes;
    }
    function _validateResponse(response, schema) {
        try {
            // tslint:disable-next-line forin no-for-in
            for (const i in schema) {
                switch (schema[i]) {
                    case 'object':
                    case 'string':
                    case 'number':
                        if (typeof response[i] !== schema[i]) {
                            return false;
                        }
                        break;
                    default:
                }
            }
        }
        catch (ex) {
            return false;
        }
        return true;
    }
    function _createSocket(url, { certificateAuthority, proxyUrl, }) {
        let requestOptions;
        if (proxyUrl) {
            requestOptions = {
                ca: certificateAuthority,
                agent: new proxy_agent_1.default(proxyUrl),
            };
        }
        else {
            requestOptions = {
                ca: certificateAuthority,
            };
        }
        return new websocket_1.w3cwebsocket(url, undefined, undefined, undefined, requestOptions);
    }
    const FIVE_MINUTES = 1000 * 60 * 5;
    const agents = {};
    function getContentType(response) {
        if (response.headers && response.headers.get) {
            // tslint:disable-next-line no-backbone-get-set-outside-model
            return response.headers.get('content-type');
        }
        return null;
    }
    // tslint:disable-next-line max-func-body-length
    async function _promiseAjax(providedUrl, options) {
        // tslint:disable-next-line max-func-body-length
        return new Promise((resolve, reject) => {
            const url = providedUrl || `${options.host}/${options.path}`;
            const unauthLabel = options.unauthenticated ? ' (unauth)' : '';
            if (options.redactUrl) {
                window.log.info(`${options.type} ${options.redactUrl(url)}${unauthLabel}`);
            }
            else {
                window.log.info(`${options.type} ${url}${unauthLabel}`);
            }
            const timeout = typeof options.timeout === 'number' ? options.timeout : 10000;
            const { proxyUrl } = options;
            const agentType = options.unauthenticated ? 'unauth' : 'auth';
            const cacheKey = `${proxyUrl}-${agentType}`;
            const { timestamp } = agents[cacheKey] || { timestamp: null };
            if (!timestamp || timestamp + FIVE_MINUTES < Date.now()) {
                if (timestamp) {
                    window.log.info(`Cycling agent for type ${cacheKey}`);
                }
                agents[cacheKey] = {
                    agent: proxyUrl
                        ? new proxy_agent_1.default(proxyUrl)
                        : new https_1.Agent({ keepAlive: true }),
                    timestamp: Date.now(),
                };
            }
            const { agent } = agents[cacheKey];
            const fetchOptions = {
                method: options.type,
                body: options.data,
                headers: Object.assign({ 'User-Agent': `Signal Desktop ${options.version}`, 'X-Signal-Agent': 'OWD' }, options.headers),
                redirect: options.redirect,
                agent,
                // We patched node-fetch to add the ca param; its type definitions don't have it
                // @ts-ignore
                ca: options.certificateAuthority,
                timeout,
            };
            if (fetchOptions.body instanceof ArrayBuffer) {
                // node-fetch doesn't support ArrayBuffer, only node Buffer
                const contentLength = fetchOptions.body.byteLength;
                fetchOptions.body = Buffer.from(fetchOptions.body);
                // node-fetch doesn't set content-length like S3 requires
                fetchOptions.headers['Content-Length'] = contentLength.toString();
            }
            const { accessKey, unauthenticated } = options;
            if (unauthenticated) {
                if (!accessKey) {
                    throw new Error('_promiseAjax: mode is aunathenticated, but accessKey was not provided');
                }
                // Access key is already a Base64 string
                fetchOptions.headers['Unidentified-Access-Key'] = accessKey;
            }
            else if (options.user && options.password) {
                const user = _getString(options.user);
                const password = _getString(options.password);
                const auth = _btoa(`${user}:${password}`);
                fetchOptions.headers.Authorization = `Basic ${auth}`;
            }
            if (options.contentType) {
                fetchOptions.headers['Content-Type'] = options.contentType;
            }
            node_fetch_1.default(url, fetchOptions)
                // tslint:disable-next-line max-func-body-length
                .then(async (response) => {
                    let resultPromise;
                    if (options.responseType === 'json' &&
                        // tslint:disable-next-line no-backbone-get-set-outside-model
                        response.headers.get('Content-Type') === 'application/json') {
                        resultPromise = response.json();
                    }
                    else if (options.responseType === 'arraybuffer' ||
                        options.responseType === 'arraybufferwithdetails') {
                        resultPromise = response.buffer();
                    }
                    else {
                        resultPromise = response.text();
                    }
                    return resultPromise.then(result => {
                        if (options.responseType === 'arraybuffer' ||
                            options.responseType === 'arraybufferwithdetails') {
                            // tslint:disable-next-line no-parameter-reassignment
                            result = result.buffer.slice(result.byteOffset,
                                // tslint:disable-next-line: restrict-plus-operands
                                result.byteOffset + result.byteLength);
                        }
                        if (options.responseType === 'json') {
                            if (options.validateResponse) {
                                if (!_validateResponse(result, options.validateResponse)) {
                                    if (options.redactUrl) {
                                        window.log.info(options.type, options.redactUrl(url), response.status, 'Error');
                                    }
                                    else {
                                        window.log.error(options.type, url, response.status, 'Error');
                                    }
                                    reject(makeHTTPError('promiseAjax: invalid response', response.status, result, options.stack));
                                    return;
                                }
                            }
                        }
                        if (response.status >= 0 && response.status < 400) {
                            if (options.redactUrl) {
                                window.log.info(options.type, options.redactUrl(url), response.status, 'Success');
                            }
                            else {
                                window.log.info(options.type, url, response.status, 'Success');
                            }
                            if (options.responseType === 'arraybufferwithdetails') {
                                resolve({
                                    data: result,
                                    contentType: getContentType(response),
                                    response,
                                });
                                return;
                            }
                            resolve(result);
                            return;
                        }
                        if (options.redactUrl) {
                            window.log.info(options.type, options.redactUrl(url), response.status, 'Error');
                        }
                        else {
                            window.log.error(options.type, url, response.status, 'Error');
                        }
                        reject(makeHTTPError('promiseAjax: error response', response.status, result, options.stack));
                        return;
                    });
                })
                .catch(e => {
                    if (options.redactUrl) {
                        window.log.error(options.type, options.redactUrl(url), 0, 'Error');
                    }
                    else {
                        window.log.error(options.type, url, 0, 'Error');
                    }
                    const stack = `${e.stack}\nInitial stack:\n${options.stack}`;
                    reject(makeHTTPError('promiseAjax catch', 0, e.toString(), stack));
                });
        });
    }
    async function _retryAjax(url, options, providedLimit, providedCount) {
        const count = (providedCount || 0) + 1;
        const limit = providedLimit || 3;
        return _promiseAjax(url, options).catch(async (e) => {
            if (e.name === 'HTTPError' && e.code === -1 && count < limit) {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(_retryAjax(url, options, limit, count));
                    }, 1000);
                });
            }
            throw e;
        });
    }
    async function _outerAjax(url, options) {
        options.stack = new Error().stack; // just in case, save stack here.
        return _retryAjax(url, options);
    }
    function makeHTTPError(message, providedCode, response, stack) {
        const code = providedCode > 999 || providedCode < 100 ? -1 : providedCode;
        const e = new Error(`${message}; code: ${code}`);
        e.name = 'HTTPError';
        e.code = code;
        e.stack += `\nOriginal stack:\n${stack}`;
        if (response) {
            e.response = response;
        }
        return e;
    }
    const URL_CALLS = {
        accounts: 'v1/accounts',
        updateDeviceName: 'v1/accounts/name',
        removeSignalingKey: 'v1/accounts/signaling_key',
        attachmentId: 'v2/attachments/form/upload',
        deliveryCert: 'v1/certificate/delivery',
        supportUnauthenticatedDelivery: 'v1/devices/unauthenticated_delivery',
        registerCapabilities: 'v1/devices/capabilities',
        devices: 'v1/devices',
        keys: 'v2/keys',
        messages: 'v1/messages',
        profile: 'v1/profile',
        signed: 'v2/keys/signed',
        getStickerPackUpload: 'v1/sticker/pack/form',
        whoami: 'v1/accounts/whoami',
    };
    window.ts.WebAPI.initialize = initialize;
    // We first set up the data that won't change during this session of the app
    // tslint:disable-next-line max-func-body-length
    function initialize({ url, cdnUrl, certificateAuthority, contentProxyUrl, proxyUrl, version, }) {
        if (!is_1.default.string(url)) {
            throw new Error('WebAPI.initialize: Invalid server url');
        }
        if (!is_1.default.string(cdnUrl)) {
            throw new Error('WebAPI.initialize: Invalid cdnUrl');
        }
        if (!is_1.default.string(certificateAuthority)) {
            throw new Error('WebAPI.initialize: Invalid certificateAuthority');
        }
        if (!is_1.default.string(contentProxyUrl)) {
            throw new Error('WebAPI.initialize: Invalid contentProxyUrl');
        }
        if (!is_1.default.string(version)) {
            throw new Error('WebAPI.initialize: Invalid version');
        }
        // Thanks to function-hoisting, we can put this return statement before all of the
        //   below function definitions.
        return {
            connect,
        };
        // Then we connect to the server with user-specific information. This is the only API
        //   exposed to the browser context, ensuring that it can't connect to arbitrary
        //   locations.
        // tslint:disable-next-line max-func-body-length
        function connect({ username: initialUsername, password: initialPassword, }) {
            let username = initialUsername;
            let password = initialPassword;
            const PARSE_RANGE_HEADER = /\/(\d+)$/;
            // Thanks, function hoisting!
            return {
                confirmCode,
                getAttachment,
                getAvatar,
                getDevices,
                getKeysForIdentifier,
                getKeysForIdentifierUnauth,
                getMessageSocket,
                getMyKeys,
                getProfile,
                getProfileUnauth,
                getProvisioningSocket,
                getSenderCertificate,
                getSticker,
                getStickerPackManifest,
                makeProxiedRequest,
                putAttachment,
                registerCapabilities,
                putStickers,
                registerKeys,
                registerSupportForUnauthenticatedDelivery,
                removeSignalingKey,
                requestVerificationSMS,
                requestVerificationVoice,
                sendMessages,
                sendMessagesUnauth,
                setSignedPreKey,
                updateDeviceName,
                whoami,
            };
            async function _ajax(param) {
                if (!param.urlParameters) {
                    param.urlParameters = '';
                }
                return _outerAjax(null, {
                    certificateAuthority,
                    contentType: 'application/json; charset=utf-8',
                    data: param.jsonData && _jsonThing(param.jsonData),
                    host: url,
                    password,
                    path: URL_CALLS[param.call] + param.urlParameters,
                    proxyUrl,
                    responseType: param.responseType,
                    timeout: param.timeout,
                    type: param.httpType,
                    user: username,
                    validateResponse: param.validateResponse,
                    version,
                    unauthenticated: param.unauthenticated,
                    accessKey: param.accessKey,
                }).catch((e) => {
                    const { code } = e;
                    if (code === 200) {
                        // Happens sometimes when we get no response. Might be nice to get 204 instead.
                        return null;
                    }
                    let message;
                    switch (code) {
                        case -1:
                            message =
                                'Failed to connect to the server, please check your network connection.';
                            break;
                        case 413:
                            message = 'Rate limit exceeded, please try again later.';
                            break;
                        case 403:
                            message = 'Invalid code, please try again.';
                            break;
                        case 417:
                            message = 'Number already registered.';
                            break;
                        case 401:
                            message =
                                'Invalid authentication, most likely someone re-registered and invalidated our registration.';
                            break;
                        case 404:
                            message = 'Number is not registered.';
                            break;
                        default:
                            message =
                                'The server rejected our query, please file a bug report.';
                    }
                    e.message = `${message} (original: ${e.message})`;
                    throw e;
                });
            }
            async function whoami() {
                return _ajax({
                    call: 'whoami',
                    httpType: 'GET',
                    responseType: 'json',
                });
            }
            async function getSenderCertificate(withUuid = false) {
                return _ajax({
                    call: 'deliveryCert',
                    httpType: 'GET',
                    responseType: 'json',
                    validateResponse: { certificate: 'string' },
                    urlParameters: withUuid ? '?includeUuid=true' : undefined,
                });
            }
            async function registerSupportForUnauthenticatedDelivery() {
                return _ajax({
                    call: 'supportUnauthenticatedDelivery',
                    httpType: 'PUT',
                    responseType: 'json',
                });
            }
            async function registerCapabilities(capabilities) {
                return _ajax({
                    call: 'registerCapabilities',
                    httpType: 'PUT',
                    jsonData: { capabilities },
                });
            }
            async function getProfile(identifier) {
                return _ajax({
                    call: 'profile',
                    httpType: 'GET',
                    urlParameters: `/${identifier}`,
                    responseType: 'json',
                });
            }
            async function getProfileUnauth(identifier, { accessKey } = {}) {
                return _ajax({
                    call: 'profile',
                    httpType: 'GET',
                    urlParameters: `/${identifier}`,
                    responseType: 'json',
                    unauthenticated: true,
                    accessKey,
                });
            }
            async function getAvatar(path) {
                // Using _outerAJAX, since it's not hardcoded to the Signal Server. Unlike our
                //   attachment CDN, it uses our self-signed certificate, so we pass it in.
                return _outerAjax(`${cdnUrl}/${path}`, {
                    certificateAuthority,
                    contentType: 'application/octet-stream',
                    proxyUrl,
                    responseType: 'arraybuffer',
                    timeout: 0,
                    type: 'GET',
                    version,
                });
            }
            async function requestVerificationSMS(number) {
                return _ajax({
                    call: 'accounts',
                    httpType: 'GET',
                    urlParameters: `/sms/code/${number}`,
                });
            }
            async function requestVerificationVoice(number) {
                return _ajax({
                    call: 'accounts',
                    httpType: 'GET',
                    urlParameters: `/voice/code/${number}`,
                });
            }
            async function confirmCode(number, code, newPassword, registrationId, deviceName, options = {}) {
                const { accessKey } = options;
                const jsonData = {
                    supportsSms: false,
                    fetchesMessages: true,
                    registrationId,
                    unidentifiedAccessKey: accessKey
                        ? _btoa(_getString(accessKey))
                        : undefined,
                    unrestrictedUnidentifiedAccess: false,
                };
                const call = deviceName ? 'devices' : 'accounts';
                const urlPrefix = deviceName ? '/' : '/code/';
                if (deviceName) {
                    jsonData.name = deviceName;
                }
                else {
                    jsonData.capabilities = {
                        uuid: true,
                    };
                }
                // We update our saved username and password, since we're creating a new account
                username = number;
                password = newPassword;
                const response = await _ajax({
                    call,
                    httpType: 'PUT',
                    responseType: 'json',
                    urlParameters: urlPrefix + code,
                    jsonData,
                });
                // From here on out, our username will be our UUID or E164 combined with device
                username = `${response.uuid || number}.${response.deviceId || 1}`;
                return response;
            }
            async function updateDeviceName(deviceName) {
                return _ajax({
                    call: 'updateDeviceName',
                    httpType: 'PUT',
                    jsonData: {
                        deviceName,
                    },
                });
            }
            async function removeSignalingKey() {
                return _ajax({
                    call: 'removeSignalingKey',
                    httpType: 'DELETE',
                });
            }
            async function getDevices() {
                return _ajax({
                    call: 'devices',
                    httpType: 'GET',
                });
            }
            async function registerKeys(genKeys) {
                const preKeys = genKeys.preKeys.map(key => ({
                    keyId: key.keyId,
                    publicKey: _btoa(_getString(key.publicKey)),
                }));
                const keys = {
                    identityKey: _btoa(_getString(genKeys.identityKey)),
                    signedPreKey: {
                        keyId: genKeys.signedPreKey.keyId,
                        publicKey: _btoa(_getString(genKeys.signedPreKey.publicKey)),
                        signature: _btoa(_getString(genKeys.signedPreKey.signature)),
                    },
                    preKeys,
                    // This is just to make the server happy (v2 clients should choke on publicKey)
                    lastResortKey: {
                        keyId: 0x7fffffff,
                        publicKey: _btoa('42'),
                    },
                };
                return _ajax({
                    call: 'keys',
                    httpType: 'PUT',
                    jsonData: keys,
                });
            }
            async function setSignedPreKey(signedPreKey) {
                return _ajax({
                    call: 'signed',
                    httpType: 'PUT',
                    jsonData: {
                        keyId: signedPreKey.keyId,
                        publicKey: _btoa(_getString(signedPreKey.publicKey)),
                        signature: _btoa(_getString(signedPreKey.signature)),
                    },
                });
            }
            async function getMyKeys() {
                const result = await _ajax({
                    call: 'keys',
                    httpType: 'GET',
                    responseType: 'json',
                    validateResponse: { count: 'number' },
                });
                return result.count;
            }
            function handleKeys(res) {
                if (!Array.isArray(res.devices)) {
                    throw new Error('Invalid response');
                }
                const devices = res.devices.map(device => {
                    if (!_validateResponse(device, { signedPreKey: 'object' }) ||
                        !_validateResponse(device.signedPreKey, {
                            publicKey: 'string',
                            signature: 'string',
                        })) {
                        throw new Error('Invalid signedPreKey');
                    }
                    let preKey;
                    if (device.preKey) {
                        if (!_validateResponse(device, { preKey: 'object' }) ||
                            !_validateResponse(device.preKey, { publicKey: 'string' })) {
                            throw new Error('Invalid preKey');
                        }
                        preKey = {
                            keyId: device.preKey.keyId,
                            publicKey: _base64ToBytes(device.preKey.publicKey),
                        };
                    }
                    return {
                        deviceId: device.deviceId,
                        registrationId: device.registrationId,
                        preKey,
                        signedPreKey: {
                            keyId: device.signedPreKey.keyId,
                            publicKey: _base64ToBytes(device.signedPreKey.publicKey),
                            signature: _base64ToBytes(device.signedPreKey.signature),
                        },
                    };
                });
                return {
                    devices,
                    identityKey: _base64ToBytes(res.identityKey),
                };
            }
            async function getKeysForIdentifier(identifier, deviceId = '*') {
                return _ajax({
                    call: 'keys',
                    httpType: 'GET',
                    urlParameters: `/${identifier}/${deviceId}`,
                    responseType: 'json',
                    validateResponse: { identityKey: 'string', devices: 'object' },
                }).then(handleKeys);
            }
            async function getKeysForIdentifierUnauth(identifier, deviceId = '*', { accessKey } = {}) {
                return _ajax({
                    call: 'keys',
                    httpType: 'GET',
                    urlParameters: `/${identifier}/${deviceId}`,
                    responseType: 'json',
                    validateResponse: { identityKey: 'string', devices: 'object' },
                    unauthenticated: true,
                    accessKey,
                }).then(handleKeys);
            }
            async function sendMessagesUnauth(destination, messageArray, timestamp, silent, online, { accessKey } = {}) {
                const jsonData = { messages: messageArray, timestamp };
                if (silent) {
                    jsonData.silent = true;
                }
                if (online) {
                    jsonData.online = true;
                }
                return _ajax({
                    call: 'messages',
                    httpType: 'PUT',
                    urlParameters: `/${destination}`,
                    jsonData,
                    responseType: 'json',
                    unauthenticated: true,
                    accessKey,
                });
            }
            async function sendMessages(destination, messageArray, timestamp, silent, online) {
                const jsonData = { messages: messageArray, timestamp };
                if (silent) {
                    jsonData.silent = true;
                }
                if (online) {
                    jsonData.online = true;
                }
                return _ajax({
                    call: 'messages',
                    httpType: 'PUT',
                    urlParameters: `/${destination}`,
                    jsonData,
                    responseType: 'json',
                });
            }
            function redactStickerUrl(stickerUrl) {
                return stickerUrl.replace(/(\/stickers\/)([^/]+)(\/)/, (_, begin, packId, end) => `${begin}${stickers_1.redactPackId(packId)}${end}`);
            }
            async function getSticker(packId, stickerId) {
                return _outerAjax(`${cdnUrl}/stickers/${packId}/full/${stickerId}`, {
                    certificateAuthority,
                    proxyUrl,
                    responseType: 'arraybuffer',
                    type: 'GET',
                    redactUrl: redactStickerUrl,
                    version,
                });
            }
            async function getStickerPackManifest(packId) {
                return _outerAjax(`${cdnUrl}/stickers/${packId}/manifest.proto`, {
                    certificateAuthority,
                    proxyUrl,
                    responseType: 'arraybuffer',
                    type: 'GET',
                    redactUrl: redactStickerUrl,
                    version,
                });
            }
            function makePutParams({ key, credential, acl, algorithm, date, policy, signature, }, encryptedBin) {
                // Note: when using the boundary string in the POST body, it needs to be prefixed by
                //   an extra --, and the final boundary string at the end gets a -- prefix and a --
                //   suffix.
                const boundaryString = `----------------${uuid_1.v4().replace(/-/g, '')}`;
                const CRLF = '\r\n';
                const getSection = (name, value) => [
                    `--${boundaryString}`,
                    `Content-Disposition: form-data; name="${name}"${CRLF}`,
                    value,
                ].join(CRLF);
                const start = [
                    getSection('key', key),
                    getSection('x-amz-credential', credential),
                    getSection('acl', acl),
                    getSection('x-amz-algorithm', algorithm),
                    getSection('x-amz-date', date),
                    getSection('policy', policy),
                    getSection('x-amz-signature', signature),
                    getSection('Content-Type', 'application/octet-stream'),
                    `--${boundaryString}`,
                    'Content-Disposition: form-data; name="file"',
                    `Content-Type: application/octet-stream${CRLF}${CRLF}`,
                ].join(CRLF);
                const end = `${CRLF}--${boundaryString}--${CRLF}`;
                const startBuffer = Buffer.from(start, 'utf8');
                const attachmentBuffer = Buffer.from(encryptedBin);
                const endBuffer = Buffer.from(end, 'utf8');
                const contentLength = startBuffer.length + attachmentBuffer.length + endBuffer.length;
                const data = Buffer.concat([startBuffer, attachmentBuffer, endBuffer], contentLength);
                return {
                    data,
                    contentType: `multipart/form-data; boundary=${boundaryString}`,
                    headers: {
                        'Content-Length': contentLength.toString(),
                    },
                };
            }
            async function putStickers(encryptedManifest, encryptedStickers, onProgress) {
                // Get manifest and sticker upload parameters
                const { packId, manifest, stickers } = await _ajax({
                    call: 'getStickerPackUpload',
                    responseType: 'json',
                    httpType: 'GET',
                    urlParameters: `/${encryptedStickers.length}`,
                });
                // Upload manifest
                const manifestParams = makePutParams(manifest, encryptedManifest);
                // This is going to the CDN, not the service, so we use _outerAjax
                await _outerAjax(`${cdnUrl}/`, Object.assign(Object.assign({}, manifestParams), {
                    certificateAuthority,
                    proxyUrl, timeout: 0, type: 'POST', version
                }));
                // Upload stickers
                const queue = new p_queue_1.default({ concurrency: 3 });
                await Promise.all(stickers.map(async (sticker, index) => {
                    const stickerParams = makePutParams(sticker, encryptedStickers[index]);
                    await queue.add(async () => _outerAjax(`${cdnUrl}/`, Object.assign(Object.assign({}, stickerParams), {
                        certificateAuthority,
                        proxyUrl, timeout: 0, type: 'POST', version
                    })));
                    if (onProgress) {
                        onProgress();
                    }
                }));
                // Done!
                return packId;
            }
            async function getAttachment(id) {
                // This is going to the CDN, not the service, so we use _outerAjax
                return _outerAjax(`${cdnUrl}/attachments/${id}`, {
                    certificateAuthority,
                    proxyUrl,
                    responseType: 'arraybuffer',
                    timeout: 0,
                    type: 'GET',
                    version,
                });
            }
            async function putAttachment(encryptedBin) {
                const response = await _ajax({
                    call: 'attachmentId',
                    httpType: 'GET',
                    responseType: 'json',
                });
                const { attachmentIdString } = response;
                const params = makePutParams(response, encryptedBin);
                // This is going to the CDN, not the service, so we use _outerAjax
                await _outerAjax(`${cdnUrl}/attachments/`, Object.assign(Object.assign({}, params), {
                    certificateAuthority,
                    proxyUrl, timeout: 0, type: 'POST', version
                }));
                return attachmentIdString;
            }
            function getHeaderPadding() {
                const max = Crypto_1.getRandomValue(1, 64);
                let characters = '';
                for (let i = 0; i < max; i += 1) {
                    characters += String.fromCharCode(Crypto_1.getRandomValue(65, 122));
                }
                return characters;
            }
            async function makeProxiedRequest(targetUrl, options = {}) {
                const { returnArrayBuffer, start, end } = options;
                const headers = {
                    'X-SignalPadding': getHeaderPadding(),
                };
                if (is_1.default.number(start) && is_1.default.number(end)) {
                    headers.Range = `bytes=${start}-${end}`;
                }
                const result = await _outerAjax(targetUrl, {
                    responseType: returnArrayBuffer ? 'arraybufferwithdetails' : undefined,
                    proxyUrl: contentProxyUrl,
                    type: 'GET',
                    redirect: 'follow',
                    redactUrl: () => '[REDACTED_URL]',
                    headers,
                    version,
                });
                if (!returnArrayBuffer) {
                    return result;
                }
                const { response } = result;
                if (!response.headers || !response.headers.get) {
                    throw new Error('makeProxiedRequest: Problem retrieving header value');
                }
                // tslint:disable-next-line no-backbone-get-set-outside-model
                const range = response.headers.get('content-range');
                const match = PARSE_RANGE_HEADER.exec(range);
                if (!match || !match[1]) {
                    throw new Error(`makeProxiedRequest: Unable to parse total size from ${range}`);
                }
                const totalSize = parseInt(match[1], 10);
                return {
                    totalSize,
                    result,
                };
            }
            function getMessageSocket() {
                window.log.info('opening message socket', url);
                const fixedScheme = url
                    .replace('https://', 'wss://')
                    // tslint:disable-next-line no-http-string
                    .replace('http://', 'ws://');
                const login = encodeURIComponent(username);
                const pass = encodeURIComponent(password);
                const clientVersion = encodeURIComponent(version);
                return _createSocket(`${fixedScheme}/v1/websocket/?login=${login}&password=${pass}&agent=OWD&version=${clientVersion}`, { certificateAuthority, proxyUrl });
            }
            function getProvisioningSocket() {
                window.log.info('opening provisioning socket', url);
                const fixedScheme = url
                    .replace('https://', 'wss://')
                    // tslint:disable-next-line no-http-string
                    .replace('http://', 'ws://');
                const clientVersion = encodeURIComponent(version);
                return _createSocket(`${fixedScheme}/v1/websocket/provisioning/?agent=OWD&version=${clientVersion}`, { certificateAuthority, proxyUrl });
            }
        }
    }
})();