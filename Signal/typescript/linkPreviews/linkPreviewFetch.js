require(exports => {
    "use strict";
    var __asyncValues = (this && this.__asyncValues) || function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const MIME_1 = require("../types/MIME");
    const MAX_REQUEST_COUNT_WITH_REDIRECTS = 20;
    // Lifted from the `fetch` spec [here][0].
    // [0]: https://fetch.spec.whatwg.org/#redirect-status
    const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
    const MAX_CONTENT_TYPE_LENGTH_TO_PARSE = 100;
    // Though we'll accept HTML of any Content-Length (including no specified length), we
    //   will only load some of the HTML. So we might start loading a 99 gigabyte HTML page
    //   but only parse the first 500 kilobytes. However, if the Content-Length is less than
    //   this, we won't waste space.
    const MAX_HTML_BYTES_TO_LOAD = 500 * 1024;
    // `<title>x` is 8 bytes. Nothing else (meta tags, etc) will even fit, so we can ignore
    //   it. This is mostly to protect us against empty response bodies.
    const MIN_HTML_CONTENT_LENGTH = 8;
    // Similar to the above. We don't want to show tiny images (even though the more likely
    //   case is that the Content-Length is 0).
    const MIN_IMAGE_CONTENT_LENGTH = 8;
    const MAX_IMAGE_CONTENT_LENGTH = 1024 * 1024;
    const VALID_IMAGE_MIME_TYPES = new Set([
        MIME_1.IMAGE_GIF,
        MIME_1.IMAGE_ICO,
        MIME_1.IMAGE_JPEG,
        MIME_1.IMAGE_PNG,
        MIME_1.IMAGE_WEBP,
    ]);
    // We want to discard unreasonable dates. Update this in ~950 years. (This may discard
    //   some reasonable dates, which is okay because it is only for link previews.)
    const MIN_DATE = 0;
    const MAX_DATE = new Date(3000, 0, 1).valueOf();
    const emptyContentType = { type: null, charset: null };
    // This throws non-helpful errors because (1) it logs (2) it will be immediately caught.
    async function fetchWithRedirects(fetchFn, href, options) {
        var _a;
        const urlsSeen = new Set();
        let nextHrefToLoad = href;
        for (let i = 0; i < MAX_REQUEST_COUNT_WITH_REDIRECTS; i += 1) {
            if (urlsSeen.has(nextHrefToLoad)) {
                window.log.warn('fetchWithRedirects: found a redirect loop');
                throw new Error('redirect loop');
            }
            urlsSeen.add(nextHrefToLoad);
            // This `await` is deliberatly inside of a loop.
            // eslint-disable-next-line no-await-in-loop
            const response = await fetchFn(nextHrefToLoad, Object.assign(Object.assign({}, options), { redirect: 'manual' }));
            if (!REDIRECT_STATUSES.has(response.status)) {
                return response;
            }
            const location = response.headers.get('location');
            if (!location) {
                window.log.warn('fetchWithRedirects: got a redirect status code but no Location header; bailing');
                throw new Error('no location with redirect');
            }
            const newUrl = maybeParseUrl(location, nextHrefToLoad);
            if (((_a = newUrl) === null || _a === void 0 ? void 0 : _a.protocol) !== 'https:') {
                window.log.warn('fetchWithRedirects: got a redirect status code and an invalid Location header');
                throw new Error('invalid location');
            }
            nextHrefToLoad = newUrl.href;
        }
        window.log.warn('fetchWithRedirects: too many redirects');
        throw new Error('too many redirects');
    }
    function maybeParseUrl(href, base) {
        let result;
        try {
            result = new URL(href, base);
        }
        catch (err) {
            return null;
        }
        // We never need the hash
        result.hash = '';
        return result;
    }
    /**
     * Parses a Content-Type header value. Refer to [RFC 2045][0] for details (though this is
     * a simplified version for link previews.
     * [0]: https://tools.ietf.org/html/rfc2045
     */
    const parseContentType = (headerValue) => {
        var _a;
        if (!headerValue || headerValue.length > MAX_CONTENT_TYPE_LENGTH_TO_PARSE) {
            return emptyContentType;
        }
        const [rawType, ...rawParameters] = headerValue
            .toLowerCase()
            .split(/;/g)
            .map(part => part.trim())
            .filter(Boolean);
        if (!rawType) {
            return emptyContentType;
        }
        let charset = null;
        for (let i = 0; i < rawParameters.length; i += 1) {
            const rawParameter = rawParameters[i];
            const parsed = new URLSearchParams(rawParameter);
            const parsedCharset = (_a = parsed.get('charset')) === null || _a === void 0 ? void 0 : _a.trim();
            if (parsedCharset) {
                charset = parsedCharset;
                break;
            }
        }
        return {
            type: rawType,
            charset,
        };
    };
    const isInlineContentDisposition = (headerValue) => !headerValue || headerValue.split(';', 1)[0] === 'inline';
    const parseContentLength = (headerValue) => {
        // No need to parse gigantic Content-Lengths; only parse the first 10 digits.
        if (typeof headerValue !== 'string' || !/^\d{1,10}$/g.test(headerValue)) {
            return Infinity;
        }
        const result = parseInt(headerValue, 10);
        return Number.isNaN(result) ? Infinity : result;
    };
    const emptyHtmlDocument = () => new DOMParser().parseFromString('', 'text/html');
    // The charset behavior here follows the [W3 guidelines][0]. The priority is BOM, HTTP
    //   header, `http-equiv` meta tag, `charset` meta tag, and finally a UTF-8 fallback.
    //   (This fallback could, perhaps, be smarter based on user locale.)
    // [0]: https://www.w3.org/International/questions/qa-html-encoding-declarations.en
    const parseHtmlBytes = (bytes, httpCharset) => {
        var _a, _b;
        const hasBom = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
        let isSureOfCharset;
        let decoder;
        if (hasBom) {
            decoder = new TextDecoder();
            isSureOfCharset = true;
        }
        else if (httpCharset) {
            try {
                decoder = new TextDecoder(httpCharset);
                isSureOfCharset = true;
            }
            catch (err) {
                decoder = new TextDecoder();
                isSureOfCharset = false;
            }
        }
        else {
            decoder = new TextDecoder();
            isSureOfCharset = false;
        }
        let decoded;
        try {
            decoded = decoder.decode(bytes);
        }
        catch (err) {
            decoded = '';
        }
        let document;
        try {
            document = new DOMParser().parseFromString(decoded, 'text/html');
        }
        catch (err) {
            document = emptyHtmlDocument();
        }
        if (!isSureOfCharset) {
            const httpEquiv = (_a = document
                .querySelector('meta[http-equiv="content-type"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content');
            if (httpEquiv) {
                const httpEquivCharset = parseContentType(httpEquiv).charset;
                if (httpEquivCharset) {
                    return parseHtmlBytes(bytes, httpEquivCharset);
                }
            }
            const metaCharset = (_b = document
                .querySelector('meta[charset]')) === null || _b === void 0 ? void 0 : _b.getAttribute('charset');
            if (metaCharset) {
                return parseHtmlBytes(bytes, metaCharset);
            }
        }
        return document;
    };
    const getHtmlDocument = async (body, contentLength, httpCharset, abortSignal) => {
        var e_1, _a;
        let result = emptyHtmlDocument();
        const maxHtmlBytesToLoad = Math.min(contentLength, MAX_HTML_BYTES_TO_LOAD);
        const buffer = new Uint8Array(new ArrayBuffer(maxHtmlBytesToLoad));
        let bytesLoadedSoFar = 0;
        try {
            try {
                // `for ... of` is much cleaner here, so we allow it.
                /* eslint-disable no-restricted-syntax */
                for (var body_1 = __asyncValues(body), body_1_1; body_1_1 = await body_1.next(), !body_1_1.done;) {
                    let chunk = body_1_1.value;
                    if (abortSignal.aborted) {
                        break;
                    }
                    // This check exists to satisfy TypeScript; chunk should always be a Buffer.
                    if (typeof chunk === 'string') {
                        chunk = Buffer.from(chunk, httpCharset || 'utf8');
                    }
                    const truncatedChunk = chunk.slice(0, maxHtmlBytesToLoad - bytesLoadedSoFar);
                    buffer.set(truncatedChunk, bytesLoadedSoFar);
                    bytesLoadedSoFar += truncatedChunk.byteLength;
                    result = parseHtmlBytes(buffer.slice(0, bytesLoadedSoFar), httpCharset);
                    const hasLoadedMaxBytes = bytesLoadedSoFar >= maxHtmlBytesToLoad;
                    if (hasLoadedMaxBytes) {
                        break;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (body_1_1 && !body_1_1.done && (_a = body_1.return)) await _a.call(body_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            /* eslint-enable no-restricted-syntax */
        }
        catch (err) {
            window.log.warn('getHtmlDocument: error when reading body; continuing with what we got');
        }
        return result;
    };
    const getOpenGraphContent = (document, properties) => {
        var _a, _b;
        for (let i = 0; i < properties.length; i += 1) {
            const property = properties[i];
            const content = (_b = (_a = document
                .querySelector(`meta[property="${property}"]`)) === null || _a === void 0 ? void 0 : _a.getAttribute('content')) === null || _b === void 0 ? void 0 : _b.trim();
            if (content) {
                return content;
            }
        }
        return null;
    };
    const getLinkHrefAttribute = (document, rels) => {
        var _a, _b;
        for (let i = 0; i < rels.length; i += 1) {
            const rel = rels[i];
            const href = (_b = (_a = document
                .querySelector(`link[rel="${rel}"]`)) === null || _a === void 0 ? void 0 : _a.getAttribute('href')) === null || _b === void 0 ? void 0 : _b.trim();
            if (href) {
                return href;
            }
        }
        return null;
    };
    const parseMetadata = (document, href) => {
        var _a, _b;
        const title = getOpenGraphContent(document, ['og:title']) || document.title.trim();
        if (!title) {
            window.log.warn("parseMetadata: HTML document doesn't have a title; bailing");
            return null;
        }
        const description = getOpenGraphContent(document, ['og:description']) || ((_b = (_a = document
            .querySelector('meta[name="description"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content')) === null || _b === void 0 ? void 0 : _b.trim()) ||
            null;
        const rawImageHref = getOpenGraphContent(document, ['og:image', 'og:image:url']) ||
            getLinkHrefAttribute(document, [
                'shortcut icon',
                'icon',
                'apple-touch-icon',
            ]);
        const imageUrl = rawImageHref ? maybeParseUrl(rawImageHref, href) : null;
        const imageHref = imageUrl ? imageUrl.href : null;
        let date = null;
        const rawDate = getOpenGraphContent(document, [
            'og:published_time',
            'article:published_time',
            'og:modified_time',
            'article:modified_time',
        ]);
        if (rawDate) {
            const parsed = Date.parse(rawDate);
            if (parsed > MIN_DATE && parsed < MAX_DATE) {
                date = parsed;
            }
        }
        return {
            title,
            description,
            imageHref,
            date,
        };
    };
    /**
     * This attempts to fetch link preview metadata, returning `null` if it cannot be found
     * for any reason.
     *
     * NOTE: This does NOT validate the incoming URL for safety. For example, it may fetch an
     * insecure HTTP href. It also does not offer a timeout; that is up to the caller.
     *
     * At a high level, it:
     *
     * 1. Makes a GET request, following up to 20 redirects (`fetch`'s default).
     * 2. Checks the response status code and headers to make sure it's a normal HTML
     *    response.
     * 3. Streams up to `MAX_HTML_BYTES_TO_LOAD`, stopping when (1) it has loaded all of the
     *    HTML (2) loaded the maximum number of bytes (3) finished loading the `<head>`.
     * 4. Parses the resulting HTML with `DOMParser`.
     * 5. Grabs the title, description, image URL, and date.
     */
    async function fetchLinkPreviewMetadata(fetchFn, href, abortSignal) {
        let response;
        try {
            response = await fetchWithRedirects(fetchFn, href, {
                headers: {
                    Accept: 'text/html,application/xhtml+xml',
                    'User-Agent': 'WhatsApp',
                },
                signal: abortSignal,
            });
        }
        catch (err) {
            window.log.warn('fetchLinkPreviewMetadata: failed to fetch link preview HTML; bailing');
            return null;
        }
        if (!response.ok) {
            window.log.warn(`fetchLinkPreviewMetadata: got a ${response.status} status code; bailing`);
            return null;
        }
        if (!response.body) {
            window.log.warn('fetchLinkPreviewMetadata: no response body; bailing');
            return null;
        }
        if (!isInlineContentDisposition(response.headers.get('Content-Disposition'))) {
            window.log.warn('fetchLinkPreviewMetadata: Content-Disposition header is not inline; bailing');
            return null;
        }
        if (abortSignal.aborted) {
            return null;
        }
        const contentLength = parseContentLength(response.headers.get('Content-Length'));
        if (contentLength < MIN_HTML_CONTENT_LENGTH) {
            window.log.warn('fetchLinkPreviewMetadata: Content-Length is too short; bailing');
            return null;
        }
        const contentType = parseContentType(response.headers.get('Content-Type'));
        if (contentType.type !== 'text/html') {
            window.log.warn('fetchLinkPreviewMetadata: Content-Type is not HTML; bailing');
            return null;
        }
        const document = await getHtmlDocument(response.body, contentLength, contentType.charset, abortSignal);
        // [The Node docs about `ReadableStream.prototype[Symbol.asyncIterator]`][0] say that
        //   the stream will be destroyed if you `break` out of the loop, but I could not
        //   reproduce this. Also [`destroy` is a documented method][1] but it is not in the
        //   Node types, which is why we do this cast to `any`.
        // [0]: https://nodejs.org/docs/latest-v12.x/api/stream.html#stream_readable_symbol_asynciterator
        // [1]: https://nodejs.org/docs/latest-v12.x/api/stream.html#stream_readable_destroy_error
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response.body.destroy();
        }
        catch (err) {
            // Ignored.
        }
        if (abortSignal.aborted) {
            return null;
        }
        return parseMetadata(document, response.url);
    }
    exports.fetchLinkPreviewMetadata = fetchLinkPreviewMetadata;
    /**
     * This attempts to fetch an image, returning `null` if it fails for any reason.
     *
     * NOTE: This does NOT validate the incoming URL for safety. For example, it may fetch an
     * insecure HTTP href. It also does not offer a timeout; that is up to the caller.
     */
    async function fetchLinkPreviewImage(fetchFn, href, abortSignal) {
        let response;
        try {
            response = await fetchWithRedirects(fetchFn, href, {
                headers: {
                    'User-Agent': 'WhatsApp',
                },
                size: MAX_IMAGE_CONTENT_LENGTH,
                signal: abortSignal,
            });
        }
        catch (err) {
            window.log.warn('fetchLinkPreviewImage: failed to fetch image; bailing');
            return null;
        }
        if (abortSignal.aborted) {
            return null;
        }
        if (!response.ok) {
            window.log.warn(`fetchLinkPreviewImage: got a ${response.status} status code; bailing`);
            return null;
        }
        const contentLength = parseContentLength(response.headers.get('Content-Length'));
        if (contentLength < MIN_IMAGE_CONTENT_LENGTH) {
            window.log.warn('fetchLinkPreviewImage: Content-Length is too short; bailing');
            return null;
        }
        if (contentLength > MAX_IMAGE_CONTENT_LENGTH) {
            window.log.warn('fetchLinkPreviewImage: Content-Length is too large or is unset; bailing');
            return null;
        }
        const { type: contentType } = parseContentType(response.headers.get('Content-Type'));
        if (!contentType || !VALID_IMAGE_MIME_TYPES.has(contentType)) {
            window.log.warn('fetchLinkPreviewImage: Content-Type is not an image; bailing');
            return null;
        }
        let data;
        try {
            data = await response.arrayBuffer();
        }
        catch (err) {
            window.log.warn('fetchLinkPreviewImage: failed to read body; bailing');
            return null;
        }
        return { data, contentType };
    }
    exports.fetchLinkPreviewImage = fetchLinkPreviewImage;
});