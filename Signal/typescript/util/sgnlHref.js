require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function parseUrl(value, logger) {
        if (value instanceof URL) {
            return value;
        }
        else if (typeof value === 'string') {
            try {
                return new URL(value);
            }
            catch (err) {
                return null;
            }
        }
        logger.warn('Tried to parse a sgnl:// URL but got an unexpected type');
        return null;
    }
    function isSgnlHref(value, logger) {
        const url = parseUrl(value, logger);
        return url !== null && url.protocol === 'sgnl:';
    }
    exports.isSgnlHref = isSgnlHref;
    function parseSgnlHref(href, logger) {
        const url = parseUrl(href, logger);
        if (!url || !isSgnlHref(url, logger)) {
            return { command: null, args: new Map() };
        }
        const args = new Map();
        url.searchParams.forEach((value, key) => {
            if (!args.has(key)) {
                args.set(key, value);
            }
        });
        return { command: url.host, args };
    }
    exports.parseSgnlHref = parseSgnlHref;
});