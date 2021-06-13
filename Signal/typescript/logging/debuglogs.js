require(exports => {
    "use strict";
    // Copyright 2018-2021 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.uploadDebugLogs = void 0;
    const form_data_1 = __importDefault(require("form-data"));
    const zlib_1 = require("zlib");
    const pify_1 = __importDefault(require("pify"));
    const got_1 = __importDefault(require("got"));
    const getUserAgent_1 = require("../util/getUserAgent");
    const BASE_URL = 'https://debuglogs.org';
    const isObject = (value) => typeof value === 'object' && !Array.isArray(value) && Boolean(value);
    const parseTokenBody = (body) => {
        if (!isObject(body)) {
            throw new Error('Token body is not an object');
        }
        const { fields, url } = body;
        if (!isObject(fields)) {
            throw new Error('Token body\'s "fields" key is not an object');
        }
        if (typeof url !== 'string') {
            throw new Error('Token body\'s "url" key is not a string');
        }
        let parsedUrl;
        try {
            parsedUrl = new URL(url);
        }
        catch (err) {
            throw new Error("Token body's URL was not a valid URL");
        }
        if (parsedUrl.protocol !== 'https:') {
            throw new Error("Token body's URL was not HTTPS");
        }
        return { fields, url };
    };
    const uploadDebugLogs = async (content, appVersion) => {
        const headers = { 'User-Agent': getUserAgent_1.getUserAgent(appVersion) };
        const signedForm = await got_1.default.get(BASE_URL, { json: true, headers });
        const { fields, url } = parseTokenBody(signedForm.body);
        const form = new form_data_1.default();
        // The API expects `key` to be the first field:
        form.append('key', fields.key);
        Object.entries(fields)
            .filter(([key]) => key !== 'key')
            .forEach(([key, value]) => {
                form.append(key, value);
            });
        const contentBuffer = await pify_1.default(zlib_1.gzip)(Buffer.from(content, 'utf8'));
        const contentType = 'application/gzip';
        form.append('Content-Type', contentType);
        form.append('file', contentBuffer, {
            contentType,
            filename: `signal-desktop-debug-log-${appVersion}.txt.gz`,
        });
        window.log.info('Debug log upload starting...');
        const { statusCode } = await got_1.default.post(url, { headers, body: form });
        if (statusCode !== 204) {
            throw new Error(`Failed to upload to S3, got status ${statusCode}`);
        }
        window.log.info('Debug log upload complete.');
        return `${BASE_URL}/${fields.key}`;
    };
    exports.uploadDebugLogs = uploadDebugLogs;
});