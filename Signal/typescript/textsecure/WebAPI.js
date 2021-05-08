(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.textsecure = window.ts.textsecure || {};
    const exports = window.ts.textsecure.WebAPI = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const websocket_1 = require("websocket");
    const node_fetch_1 = __importDefault(require("node-fetch"));
    const proxy_agent_1 = __importDefault(require("proxy-agent"));
    const https_1 = require("https");
    const p_props_1 = __importDefault(require("p-props"));
    const lodash_1 = require("lodash");
    const crypto_1 = require("crypto");
    const node_forge_1 = require("node-forge");
    const is_1 = __importDefault(require("@sindresorhus/is"));
    const stickers_1 = require("../../js/modules/stickers");
    const Crypto_1 = require("../Crypto");
    const p_queue_1 = __importDefault(require("p-queue"));
    const uuid_1 = require("uuid");
    let sgxConstantCache = null;
    function makeLong(value) {
        return window.dcodeIO.Long.fromString(value);
    }
    function getSgxConstants() {
        if (sgxConstantCache) {
            return sgxConstantCache;
        }
        sgxConstantCache = {
            SGX_FLAGS_INITTED: makeLong('x0000000000000001L'),
            SGX_FLAGS_DEBUG: makeLong('x0000000000000002L'),
            SGX_FLAGS_MODE64BIT: makeLong('x0000000000000004L'),
            SGX_FLAGS_PROVISION_KEY: makeLong('x0000000000000004L'),
            SGX_FLAGS_EINITTOKEN_KEY: makeLong('x0000000000000004L'),
            SGX_FLAGS_RESERVED: makeLong('xFFFFFFFFFFFFFFC8L'),
            SGX_XFRM_LEGACY: makeLong('x0000000000000003L'),
            SGX_XFRM_AVX: makeLong('x0000000000000006L'),
            SGX_XFRM_RESERVED: makeLong('xFFFFFFFFFFFFFFF8L'),
        };
        return sgxConstantCache;
    }
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
    function _createRedactor(...toReplace) {
        // NOTE: It would be nice to remove this cast, but TypeScript doesn't support
        //   it. However, there is [an issue][0] that discusses this in more detail.
        // [0]: https://github.com/Microsoft/TypeScript/issues/16069
        const stringsToReplace = toReplace.filter(Boolean);
        return href => stringsToReplace.reduce((result, stringToReplace) => {
            const pattern = RegExp(lodash_1.escapeRegExp(stringToReplace), 'g');
            const replacement = `[REDACTED]${stringToReplace.slice(-3)}`;
            return result.replace(pattern, replacement);
        }, href);
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
        return new websocket_1.w3cwebsocket(url, undefined, undefined, undefined, requestOptions, {
            maxReceivedFrameSize: 0x210000,
        });
    }
    const FIVE_MINUTES = 1000 * 60 * 5;
    const agents = {};
    function getContentType(response) {
        if (response.headers && response.headers.get) {
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
            const { accessKey, basicAuth, unauthenticated } = options;
            if (basicAuth) {
                fetchOptions.headers.Authorization = `Basic ${basicAuth}`;
            }
            else if (unauthenticated) {
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
                    if ((options.responseType === 'json' ||
                        options.responseType === 'jsonwithdetails') &&
                        response.headers.get('Content-Type') === 'application/json') {
                        resultPromise = response.json();
                    }
                    else if (options.responseType === 'arraybuffer' ||
                        options.responseType === 'arraybufferwithdetails') {
                        resultPromise = response.buffer();
                    }
                    else {
                        resultPromise = response.textConverted();
                    }
                    // tslint:disable-next-line max-func-body-length
                    return resultPromise.then(result => {
                        if (options.responseType === 'arraybuffer' ||
                            options.responseType === 'arraybufferwithdetails') {
                            // tslint:disable-next-line no-parameter-reassignment
                            result = result.buffer.slice(result.byteOffset,
                                // tslint:disable-next-line: restrict-plus-operands
                                result.byteOffset + result.byteLength);
                        }
                        if (options.responseType === 'json' ||
                            options.responseType === 'jsonwithdetails') {
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
                                const fullResult = {
                                    data: result,
                                    contentType: getContentType(response),
                                    response,
                                };
                                resolve(fullResult);
                                return;
                            }
                            if (options.responseType === 'jsonwithdetails') {
                                const fullResult = {
                                    data: result,
                                    contentType: getContentType(response),
                                    response,
                                };
                                resolve(fullResult);
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
        attachmentId: 'v2/attachments/form/upload',
        attestation: 'v1/attestation',
        config: 'v1/config',
        deliveryCert: 'v1/certificate/delivery',
        devices: 'v1/devices',
        directoryAuth: 'v1/directory/auth',
        discovery: 'v1/discovery',
        getGroupAvatarUpload: '/v1/groups/avatar/form',
        getGroupCredentials: 'v1/certificate/group',
        getIceServers: 'v1/accounts/turn',
        getStickerPackUpload: 'v1/sticker/pack/form',
        groupLog: 'v1/groups/logs',
        groups: 'v1/groups',
        keys: 'v2/keys',
        messages: 'v1/messages',
        profile: 'v1/profile',
        registerCapabilities: 'v1/devices/capabilities',
        removeSignalingKey: 'v1/accounts/signaling_key',
        signed: 'v2/keys/signed',
        storageManifest: 'v1/storage/manifest',
        storageModify: 'v1/storage/',
        storageRead: 'v1/storage/read',
        storageToken: 'v1/storage/auth',
        supportUnauthenticatedDelivery: 'v1/devices/unauthenticated_delivery',
        updateDeviceName: 'v1/accounts/name',
        whoami: 'v1/accounts/whoami',
    };
    // We first set up the data that won't change during this session of the app
    // tslint:disable-next-line max-func-body-length
    function initialize({ url, storageUrl, directoryEnclaveId, directoryTrustAnchor, directoryUrl, cdnUrlObject, certificateAuthority, contentProxyUrl, proxyUrl, version, }) {
        if (!is_1.default.string(url)) {
            throw new Error('WebAPI.initialize: Invalid server url');
        }
        if (!is_1.default.string(storageUrl)) {
            throw new Error('WebAPI.initialize: Invalid storageUrl');
        }
        if (!is_1.default.string(directoryEnclaveId)) {
            throw new Error('WebAPI.initialize: Invalid directory enclave id');
        }
        if (!is_1.default.string(directoryTrustAnchor)) {
            throw new Error('WebAPI.initialize: Invalid directory enclave id');
        }
        if (!is_1.default.string(directoryUrl)) {
            throw new Error('WebAPI.initialize: Invalid directory url');
        }
        if (!is_1.default.object(cdnUrlObject)) {
            throw new Error('WebAPI.initialize: Invalid cdnUrlObject');
        }
        if (!is_1.default.string(cdnUrlObject['0'])) {
            throw new Error('WebAPI.initialize: Missing CDN 0 configuration');
        }
        if (!is_1.default.string(cdnUrlObject['2'])) {
            throw new Error('WebAPI.initialize: Missing CDN 2 configuration');
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
            const PARSE_GROUP_LOG_RANGE_HEADER = /$versions (\d{1,10})-(\d{1,10})\/(d{1,10})/;
            // Thanks, function hoisting!
            return {
                confirmCode,
                createGroup,
                getAttachment,
                getAvatar,
                getConfig,
                getDevices,
                getGroup,
                getGroupAvatar,
                getGroupCredentials,
                getGroupLog,
                getIceServers,
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
                getStorageCredentials,
                getStorageManifest,
                getStorageRecords,
                getUuidsForE164s,
                makeProxiedRequest,
                modifyGroup,
                modifyStorageRecords,
                putAttachment,
                putStickers,
                registerCapabilities,
                registerKeys,
                registerSupportForUnauthenticatedDelivery,
                removeSignalingKey,
                requestVerificationSMS,
                requestVerificationVoice,
                sendMessages,
                sendMessagesUnauth,
                setSignedPreKey,
                updateDeviceName,
                uploadGroupAvatar,
                whoami,
            };
            async function _ajax(param) {
                if (!param.urlParameters) {
                    param.urlParameters = '';
                }
                return _outerAjax(null, {
                    basicAuth: param.basicAuth,
                    certificateAuthority,
                    contentType: param.contentType || 'application/json; charset=utf-8',
                    data: param.data || (param.jsonData && _jsonThing(param.jsonData)),
                    host: param.host || url,
                    password: param.password || password,
                    path: URL_CALLS[param.call] + param.urlParameters,
                    proxyUrl,
                    responseType: param.responseType,
                    timeout: param.timeout,
                    type: param.httpType,
                    user: param.username || username,
                    redactUrl: param.redactUrl,
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
            async function getConfig() {
                const res = await _ajax({
                    call: 'config',
                    httpType: 'GET',
                    responseType: 'json',
                });
                return res.config.filter(({ name }) => name.startsWith('desktop.'));
            }
            async function getSenderCertificate() {
                return _ajax({
                    call: 'deliveryCert',
                    httpType: 'GET',
                    responseType: 'json',
                    validateResponse: { certificate: 'string' },
                    urlParameters: '?includeUuid=true',
                });
            }
            async function getStorageCredentials() {
                return _ajax({
                    call: 'storageToken',
                    httpType: 'GET',
                    responseType: 'json',
                    schema: { username: 'string', password: 'string' },
                });
            }
            async function getStorageManifest(options = {}) {
                const { credentials, greaterThanVersion } = options;
                return _ajax(Object.assign({
                    call: 'storageManifest', contentType: 'application/x-protobuf', host: storageUrl, httpType: 'GET', responseType: 'arraybuffer', urlParameters: greaterThanVersion
                        ? `/version/${greaterThanVersion}`
                        : ''
                }, credentials));
            }
            async function getStorageRecords(data, options = {}) {
                const { credentials } = options;
                return _ajax(Object.assign({ call: 'storageRead', contentType: 'application/x-protobuf', data, host: storageUrl, httpType: 'PUT', responseType: 'arraybuffer' }, credentials));
            }
            async function modifyStorageRecords(data, options = {}) {
                const { credentials } = options;
                return _ajax(Object.assign({
                    call: 'storageModify', contentType: 'application/x-protobuf', data, host: storageUrl, httpType: 'PUT',
                    // If we run into a conflict, the current manifest is returned -
                    //   it will will be an ArrayBuffer at the response key on the Error
                    responseType: 'arraybuffer'
                }, credentials));
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
            function getProfileUrl(identifier, profileKeyVersion, profileKeyCredentialRequest) {
                let profileUrl = `/${identifier}`;
                if (profileKeyVersion) {
                    profileUrl += `/${profileKeyVersion}`;
                }
                if (profileKeyVersion && profileKeyCredentialRequest) {
                    profileUrl += `/${profileKeyCredentialRequest}`;
                }
                return profileUrl;
            }
            async function getProfile(identifier, options = {}) {
                const { profileKeyVersion, profileKeyCredentialRequest } = options;
                return _ajax({
                    call: 'profile',
                    httpType: 'GET',
                    urlParameters: getProfileUrl(identifier, profileKeyVersion, profileKeyCredentialRequest),
                    responseType: 'json',
                    redactUrl: _createRedactor(identifier, profileKeyVersion, profileKeyCredentialRequest),
                });
            }
            async function getProfileUnauth(identifier, options) {
                const { accessKey, profileKeyVersion, profileKeyCredentialRequest, } = options;
                return _ajax({
                    call: 'profile',
                    httpType: 'GET',
                    urlParameters: getProfileUrl(identifier, profileKeyVersion, profileKeyCredentialRequest),
                    responseType: 'json',
                    unauthenticated: true,
                    accessKey,
                    redactUrl: _createRedactor(identifier, profileKeyVersion, profileKeyCredentialRequest),
                });
            }
            async function getAvatar(path) {
                // Using _outerAJAX, since it's not hardcoded to the Signal Server. Unlike our
                //   attachment CDN, it uses our self-signed certificate, so we pass it in.
                return _outerAjax(`${cdnUrlObject['0']}/${path}`, {
                    certificateAuthority,
                    contentType: 'application/octet-stream',
                    proxyUrl,
                    responseType: 'arraybuffer',
                    timeout: 0,
                    type: 'GET',
                    redactUrl: (href) => {
                        const pattern = RegExp(lodash_1.escapeRegExp(path), 'g');
                        return href.replace(pattern, `[REDACTED]${path.slice(-3)}`);
                    },
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
                    capabilities: {
                        gv2: true,
                    },
                    fetchesMessages: true,
                    name: deviceName ? deviceName : undefined,
                    registrationId,
                    supportsSms: false,
                    unidentifiedAccessKey: accessKey
                        ? _btoa(_getString(accessKey))
                        : undefined,
                    unrestrictedUnidentifiedAccess: false,
                };
                const call = deviceName ? 'devices' : 'accounts';
                const urlPrefix = deviceName ? '/' : '/code/';
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
            async function getIceServers() {
                return _ajax({
                    call: 'getIceServers',
                    httpType: 'GET',
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
            async function getKeysForIdentifier(identifier, deviceId) {
                return _ajax({
                    call: 'keys',
                    httpType: 'GET',
                    urlParameters: `/${identifier}/${deviceId || '*'}`,
                    responseType: 'json',
                    validateResponse: { identityKey: 'string', devices: 'object' },
                }).then(handleKeys);
            }
            async function getKeysForIdentifierUnauth(identifier, deviceId, { accessKey } = {}) {
                return _ajax({
                    call: 'keys',
                    httpType: 'GET',
                    urlParameters: `/${identifier}/${deviceId || '*'}`,
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
                if (!stickers_1.isPackIdValid(packId)) {
                    throw new Error('getSticker: pack ID was invalid');
                }
                return _outerAjax(`${cdnUrlObject['0']}/stickers/${packId}/full/${stickerId}`, {
                    certificateAuthority,
                    proxyUrl,
                    responseType: 'arraybuffer',
                    type: 'GET',
                    redactUrl: redactStickerUrl,
                    version,
                });
            }
            async function getStickerPackManifest(packId) {
                if (!stickers_1.isPackIdValid(packId)) {
                    throw new Error('getStickerPackManifest: pack ID was invalid');
                }
                return _outerAjax(`${cdnUrlObject['0']}/stickers/${packId}/manifest.proto`, {
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
                await _outerAjax(`${cdnUrlObject['0']}/`, Object.assign(Object.assign({}, manifestParams), {
                    certificateAuthority,
                    proxyUrl, timeout: 0, type: 'POST', version
                }));
                // Upload stickers
                const queue = new p_queue_1.default({ concurrency: 3 });
                await Promise.all(stickers.map(async (sticker, index) => {
                    const stickerParams = makePutParams(sticker, encryptedStickers[index]);
                    await queue.add(async () => _outerAjax(`${cdnUrlObject['0']}/`, Object.assign(Object.assign({}, stickerParams), {
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
            async function getAttachment(cdnKey, cdnNumber) {
                const cdnUrl = cdnUrlObject[cdnNumber] || cdnUrlObject['0'];
                // This is going to the CDN, not the service, so we use _outerAjax
                return _outerAjax(`${cdnUrl}/attachments/${cdnKey}`, {
                    certificateAuthority,
                    proxyUrl,
                    responseType: 'arraybuffer',
                    timeout: 0,
                    type: 'GET',
                    redactUrl: _createRedactor(cdnKey),
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
                await _outerAjax(`${cdnUrlObject['0']}/attachments/`, Object.assign(Object.assign({}, params), {
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
                const range = response.headers.get('content-range');
                const match = PARSE_RANGE_HEADER.exec(range || '');
                if (!match || !match[1]) {
                    throw new Error(`makeProxiedRequest: Unable to parse total size from ${range}`);
                }
                const totalSize = parseInt(match[1], 10);
                return {
                    totalSize,
                    result,
                };
            }
            // Groups
            function generateGroupAuth(groupPublicParamsHex, authCredentialPresentationHex) {
                return _btoa(`${groupPublicParamsHex}:${authCredentialPresentationHex}`);
            }
            async function getGroupCredentials(startDay, endDay) {
                const response = await _ajax({
                    call: 'getGroupCredentials',
                    urlParameters: `/${startDay}/${endDay}`,
                    httpType: 'GET',
                    responseType: 'json',
                });
                return response.credentials;
            }
            function verifyAttributes(attributes) {
                const { key, credential, acl, algorithm, date, policy, signature, } = attributes;
                if (!key ||
                    !credential ||
                    !acl ||
                    !algorithm ||
                    !date ||
                    !policy ||
                    !signature) {
                    throw new Error('verifyAttributes: Missing value from AvatarUploadAttributes');
                }
                return {
                    key,
                    credential,
                    acl,
                    algorithm,
                    date,
                    policy,
                    signature,
                };
            }
            async function uploadGroupAvatar(avatarData, options) {
                const basicAuth = generateGroupAuth(options.groupPublicParamsHex, options.authCredentialPresentationHex);
                const response = await _ajax({
                    basicAuth,
                    call: 'getGroupAvatarUpload',
                    httpType: 'GET',
                    responseType: 'arraybuffer',
                    host: storageUrl,
                });
                const attributes = window.textsecure.protobuf.AvatarUploadAttributes.decode(response);
                const verified = verifyAttributes(attributes);
                const { key } = verified;
                const manifestParams = makePutParams(verified, avatarData);
                await _outerAjax(`${cdnUrlObject['0']}/`, Object.assign(Object.assign({}, manifestParams), {
                    certificateAuthority,
                    proxyUrl, timeout: 0, type: 'POST', version
                }));
                return key;
            }
            async function getGroupAvatar(key) {
                return _outerAjax(`${cdnUrlObject['0']}/${key}`, {
                    certificateAuthority,
                    proxyUrl,
                    responseType: 'arraybuffer',
                    timeout: 0,
                    type: 'GET',
                    version,
                });
            }
            async function createGroup(group, options) {
                const basicAuth = generateGroupAuth(options.groupPublicParamsHex, options.authCredentialPresentationHex);
                const data = group.toArrayBuffer();
                await _ajax({
                    basicAuth,
                    call: 'groups',
                    httpType: 'PUT',
                    data,
                    host: storageUrl,
                });
            }
            async function getGroup(options) {
                const basicAuth = generateGroupAuth(options.groupPublicParamsHex, options.authCredentialPresentationHex);
                const response = await _ajax({
                    basicAuth,
                    call: 'groups',
                    httpType: 'GET',
                    contentType: 'application/x-protobuf',
                    responseType: 'arraybuffer',
                    host: storageUrl,
                });
                return window.textsecure.protobuf.Group.decode(response);
            }
            async function modifyGroup(changes, options) {
                const basicAuth = generateGroupAuth(options.groupPublicParamsHex, options.authCredentialPresentationHex);
                const data = changes.toArrayBuffer();
                const response = await _ajax({
                    basicAuth,
                    call: 'groups',
                    httpType: 'PATCH',
                    data,
                    contentType: 'application/x-protobuf',
                    responseType: 'arraybuffer',
                    host: storageUrl,
                });
                return window.textsecure.protobuf.GroupChange.decode(response);
            }
            async function getGroupLog(startVersion, options) {
                const basicAuth = generateGroupAuth(options.groupPublicParamsHex, options.authCredentialPresentationHex);
                const withDetails = await _ajax({
                    basicAuth,
                    call: 'groupLog',
                    urlParameters: `/${startVersion}`,
                    httpType: 'GET',
                    contentType: 'application/x-protobuf',
                    responseType: 'arraybufferwithdetails',
                    host: storageUrl,
                });
                const { data, response } = withDetails;
                const changes = window.textsecure.protobuf.GroupChanges.decode(data);
                if (response && response.status === 206) {
                    const range = response.headers.get('Content-Range');
                    const match = PARSE_GROUP_LOG_RANGE_HEADER.exec(range || '');
                    const start = match ? parseInt(match[0], 10) : undefined;
                    const end = match ? parseInt(match[1], 10) : undefined;
                    const currentRevision = match ? parseInt(match[2], 10) : undefined;
                    if (match &&
                        is_1.default.number(start) &&
                        is_1.default.number(end) &&
                        is_1.default.number(currentRevision)) {
                        return {
                            changes,
                            start,
                            end,
                            currentRevision,
                        };
                    }
                }
                return {
                    changes,
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
            async function getDirectoryAuth() {
                return _ajax({
                    call: 'directoryAuth',
                    httpType: 'GET',
                    responseType: 'json',
                });
            }
            function validateAttestationQuote({ serverStaticPublic, quote, }) {
                const SGX_CONSTANTS = getSgxConstants();
                const byteBuffer = window.dcodeIO.ByteBuffer.wrap(quote, 'binary', window.dcodeIO.ByteBuffer.LITTLE_ENDIAN);
                const quoteVersion = byteBuffer.readShort(0) & 0xffff;
                if (quoteVersion < 0 || quoteVersion > 2) {
                    throw new Error(`Unknown version ${quoteVersion}`);
                }
                const miscSelect = new Uint8Array(Crypto_1.getBytes(quote, 64, 4));
                if (!miscSelect.every(byte => byte === 0)) {
                    throw new Error('Quote miscSelect invalid!');
                }
                const reserved1 = new Uint8Array(Crypto_1.getBytes(quote, 68, 28));
                if (!reserved1.every(byte => byte === 0)) {
                    throw new Error('Quote reserved1 invalid!');
                }
                const flags = byteBuffer.readLong(96);
                if (flags.and(SGX_CONSTANTS.SGX_FLAGS_RESERVED).notEquals(0) ||
                    flags.and(SGX_CONSTANTS.SGX_FLAGS_INITTED).equals(0) ||
                    flags.and(SGX_CONSTANTS.SGX_FLAGS_MODE64BIT).equals(0)) {
                    throw new Error(`Quote flags invalid ${flags.toString()}`);
                }
                const xfrm = byteBuffer.readLong(104);
                if (xfrm.and(SGX_CONSTANTS.SGX_XFRM_RESERVED).notEquals(0)) {
                    throw new Error(`Quote xfrm invalid ${xfrm}`);
                }
                const mrenclave = new Uint8Array(Crypto_1.getBytes(quote, 112, 32));
                const enclaveIdBytes = new Uint8Array(Crypto_1.bytesFromHexString(directoryEnclaveId));
                if (!mrenclave.every((byte, index) => byte === enclaveIdBytes[index])) {
                    throw new Error('Quote mrenclave invalid!');
                }
                const reserved2 = new Uint8Array(Crypto_1.getBytes(quote, 144, 32));
                if (!reserved2.every(byte => byte === 0)) {
                    throw new Error('Quote reserved2 invalid!');
                }
                const reportData = new Uint8Array(Crypto_1.getBytes(quote, 368, 64));
                const serverStaticPublicBytes = new Uint8Array(serverStaticPublic);
                if (!reportData.every((byte, index) => {
                    if (index >= 32) {
                        return byte === 0;
                    }
                    return byte === serverStaticPublicBytes[index];
                })) {
                    throw new Error('Quote report_data invalid!');
                }
                const reserved3 = new Uint8Array(Crypto_1.getBytes(quote, 208, 96));
                if (!reserved3.every(byte => byte === 0)) {
                    throw new Error('Quote reserved3 invalid!');
                }
                const reserved4 = new Uint8Array(Crypto_1.getBytes(quote, 308, 60));
                if (!reserved4.every(byte => byte === 0)) {
                    throw new Error('Quote reserved4 invalid!');
                }
                const signatureLength = byteBuffer.readInt(432) & 4294967295;
                if (signatureLength !== quote.byteLength - 436) {
                    throw new Error(`Bad signatureLength ${signatureLength}`);
                }
                // const signature = Uint8Array.from(getBytes(quote, 436, signatureLength));
            }
            function validateAttestationSignatureBody(signatureBody, encodedQuote) {
                // Parse timestamp as UTC
                const { timestamp } = signatureBody;
                const utcTimestamp = timestamp.endsWith('Z')
                    ? timestamp
                    : `${timestamp}Z`;
                const signatureTime = new Date(utcTimestamp).getTime();
                const now = Date.now();
                if (signatureBody.version !== 3) {
                    throw new Error('Attestation signature invalid version!');
                }
                if (!encodedQuote.startsWith(signatureBody.isvEnclaveQuoteBody)) {
                    throw new Error('Attestion signature mismatches quote!');
                }
                if (signatureBody.isvEnclaveQuoteStatus !== 'OK') {
                    throw new Error('Attestation signature status not "OK"!');
                }
                if (signatureTime < now - 24 * 60 * 60 * 1000) {
                    throw new Error('Attestation signature timestamp older than 24 hours!');
                }
            }
            async function validateAttestationSignature(signature, signatureBody, certificates) {
                const CERT_PREFIX = '-----BEGIN CERTIFICATE-----';
                const pem = lodash_1.compact(certificates.split(CERT_PREFIX).map(match => {
                    if (!match) {
                        return null;
                    }
                    return `${CERT_PREFIX}${match}`;
                }));
                if (pem.length < 2) {
                    throw new Error(`validateAttestationSignature: Expect two or more entries; got ${pem.length}`);
                }
                const verify = crypto_1.createVerify('RSA-SHA256');
                verify.update(Buffer.from(Crypto_1.bytesFromString(signatureBody)));
                const isValid = verify.verify(pem[0], Buffer.from(signature));
                if (!isValid) {
                    throw new Error('Validation of signature across signatureBody failed!');
                }
                const caStore = node_forge_1.pki.createCaStore([directoryTrustAnchor]);
                const chain = lodash_1.compact(pem.map(cert => node_forge_1.pki.certificateFromPem(cert)));
                const isChainValid = node_forge_1.pki.verifyCertificateChain(caStore, chain);
                if (!isChainValid) {
                    throw new Error('Validation of certificate chain failed!');
                }
                const leafCert = chain[0];
                const fieldCN = leafCert.subject.getField('CN');
                if (!fieldCN ||
                    fieldCN.value !== 'Intel SGX Attestation Report Signing') {
                    throw new Error('Leaf cert CN field had unexpected value');
                }
                const fieldO = leafCert.subject.getField('O');
                if (!fieldO || fieldO.value !== 'Intel Corporation') {
                    throw new Error('Leaf cert O field had unexpected value');
                }
                const fieldL = leafCert.subject.getField('L');
                if (!fieldL || fieldL.value !== 'Santa Clara') {
                    throw new Error('Leaf cert L field had unexpected value');
                }
                const fieldST = leafCert.subject.getField('ST');
                if (!fieldST || fieldST.value !== 'CA') {
                    throw new Error('Leaf cert ST field had unexpected value');
                }
                const fieldC = leafCert.subject.getField('C');
                if (!fieldC || fieldC.value !== 'US') {
                    throw new Error('Leaf cert C field had unexpected value');
                }
            }
            // tslint:disable-next-line max-func-body-length
            async function putRemoteAttestation(auth) {
                const keyPair = await window.libsignal.externalCurveAsync.generateKeyPair();
                const { privKey, pubKey } = keyPair;
                // Remove first "key type" byte from public key
                const slicedPubKey = pubKey.slice(1);
                const pubKeyBase64 = Crypto_1.arrayBufferToBase64(slicedPubKey);
                // Do request
                const data = JSON.stringify({ clientPublic: pubKeyBase64 });
                const result = await _outerAjax(null, {
                    certificateAuthority,
                    type: 'PUT',
                    contentType: 'application/json; charset=utf-8',
                    host: directoryUrl,
                    path: `${URL_CALLS.attestation}/${directoryEnclaveId}`,
                    user: auth.username,
                    password: auth.password,
                    responseType: 'jsonwithdetails',
                    data,
                    version,
                });
                const { data: responseBody, response } = result;
                const attestationsLength = Object.keys(responseBody.attestations).length;
                if (attestationsLength > 3) {
                    throw new Error('Got more than three attestations from the Contact Discovery Service');
                }
                if (attestationsLength < 1) {
                    throw new Error('Got no attestations from the Contact Discovery Service');
                }
                const cookie = response.headers.get('set-cookie');
                // Decode response
                return {
                    cookie,
                    attestations: await p_props_1.default(responseBody.attestations, async (attestation) => {
                        const decoded = Object.assign({}, attestation);
                        [
                            'ciphertext',
                            'iv',
                            'quote',
                            'serverEphemeralPublic',
                            'serverStaticPublic',
                            'signature',
                            'tag',
                        ].forEach(prop => {
                            decoded[prop] = Crypto_1.base64ToArrayBuffer(decoded[prop]);
                        });
                        // Validate response
                        validateAttestationQuote(decoded);
                        validateAttestationSignatureBody(JSON.parse(decoded.signatureBody), attestation.quote);
                        await validateAttestationSignature(decoded.signature, decoded.signatureBody, decoded.certificates);
                        // Derive key
                        const ephemeralToEphemeral = await window.libsignal.externalCurveAsync.calculateAgreement(decoded.serverEphemeralPublic, privKey);
                        const ephemeralToStatic = await window.libsignal.externalCurveAsync.calculateAgreement(decoded.serverStaticPublic, privKey);
                        const masterSecret = Crypto_1.concatenateBytes(ephemeralToEphemeral, ephemeralToStatic);
                        const publicKeys = Crypto_1.concatenateBytes(slicedPubKey, decoded.serverEphemeralPublic, decoded.serverStaticPublic);
                        const [clientKey, serverKey,] = await window.libsignal.HKDF.deriveSecrets(masterSecret, publicKeys);
                        // Decrypt ciphertext into requestId
                        const requestId = await Crypto_1.decryptAesGcm(serverKey, decoded.iv, Crypto_1.concatenateBytes(decoded.ciphertext, decoded.tag));
                        return { clientKey, serverKey, requestId };
                    }),
                };
            }
            async function getUuidsForE164s(e164s) {
                const directoryAuth = await getDirectoryAuth();
                const attestationResult = await putRemoteAttestation(directoryAuth);
                // Encrypt data for discovery
                const data = await Crypto_1.encryptCdsDiscoveryRequest(attestationResult.attestations, e164s);
                const { cookie } = attestationResult;
                // Send discovery request
                const discoveryResponse = await _outerAjax(null, {
                    certificateAuthority,
                    type: 'PUT',
                    headers: cookie
                        ? {
                            cookie,
                        }
                        : undefined,
                    contentType: 'application/json; charset=utf-8',
                    host: directoryUrl,
                    path: `${URL_CALLS.discovery}/${directoryEnclaveId}`,
                    user: directoryAuth.username,
                    password: directoryAuth.password,
                    responseType: 'json',
                    data: JSON.stringify(data),
                    version,
                });
                // Decode discovery request response
                const decodedDiscoveryResponse = lodash_1.mapValues(discoveryResponse, value => {
                    return Crypto_1.base64ToArrayBuffer(value);
                });
                const returnedAttestation = Object.values(attestationResult.attestations).find(at => Crypto_1.constantTimeEqual(at.requestId, decodedDiscoveryResponse.requestId));
                if (!returnedAttestation) {
                    throw new Error('No known attestations returned from CDS');
                }
                // Decrypt discovery response
                const decryptedDiscoveryData = await Crypto_1.decryptAesGcm(returnedAttestation.serverKey, decodedDiscoveryResponse.iv, Crypto_1.concatenateBytes(decodedDiscoveryResponse.data, decodedDiscoveryResponse.mac));
                // Process and return result
                const uuids = Crypto_1.splitUuids(decryptedDiscoveryData);
                if (uuids.length !== e164s.length) {
                    throw new Error('Returned set of UUIDs did not match returned set of e164s!');
                }
                return lodash_1.zipObject(e164s, uuids);
            }
        }
    }
    exports.initialize = initialize;
})();