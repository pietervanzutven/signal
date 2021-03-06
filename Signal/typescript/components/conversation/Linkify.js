(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.Linkify = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const linkify_it_1 = __importDefault(require("linkify-it"));
    const link_previews_1 = require("../../../js/modules/link_previews");
    const linkify = linkify_it_1.default()
        // This is all of the TLDs in place in 2010, according to [Wikipedia][0]. Note that
        //   this only applies to "fuzzy" matches (`example.com`), not matches with
        //   protocols (`https://example.com`).
        // [0]: https://en.wikipedia.org/wiki/Generic_top-level_domain#History
        .tlds([
            'aero',
            'asia',
            'biz',
            'cat',
            'com',
            'coop',
            'edu',
            'gov',
            'info',
            'int',
            'jobs',
            'mil',
            'mobi',
            'museum',
            'name',
            'net',
            'org',
            'pro',
            'tel',
            'travel',
        ]);
    const SUPPORTED_PROTOCOLS = /^(http|https):/i;
    class Linkify extends react_1.default.Component {
        render() {
            const { text, renderNonLink } = this.props;
            const matchData = linkify.match(text) || [];
            const results = [];
            let last = 0;
            let count = 1;
            // We have to do this, because renderNonLink is not required in our Props object,
            //  but it is always provided via defaultProps.
            if (!renderNonLink) {
                return null;
            }
            if (matchData.length === 0) {
                return renderNonLink({ text, key: 0 });
            }
            matchData.forEach((match) => {
                if (last < match.index) {
                    const textWithNoLink = text.slice(last, match.index);
                    count += 1;
                    results.push(renderNonLink({ text: textWithNoLink, key: count }));
                }
                const { url, text: originalText } = match;
                count += 1;
                if (SUPPORTED_PROTOCOLS.test(url) && !link_previews_1.isLinkSneaky(url)) {
                    results.push(react_1.default.createElement("a", { key: count, href: url }, originalText));
                }
                else {
                    results.push(renderNonLink({ text: originalText, key: count }));
                }
                last = match.lastIndex;
            });
            if (last < text.length) {
                count += 1;
                results.push(renderNonLink({ text: text.slice(last), key: count }));
            }
            return results;
        }
    }
    exports.Linkify = Linkify;
    Linkify.defaultProps = {
        renderNonLink: ({ text }) => text,
    };
})();