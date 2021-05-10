(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.shims = window.ts.shims || {};
    const exports = window.ts.shims.Whisper = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    // Matching Whisper.Message API
    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    function getSearchResultsProps(attributes) {
        const model = new window.Whisper.Message(attributes);
        return model.getPropsForSearchResult();
    }
    exports.getSearchResultsProps = getSearchResultsProps;
    // Matching Whisper.Message API
    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    function getBubbleProps(attributes) {
        const model = new window.Whisper.Message(attributes);
        return model.getPropsForBubble();
    }
    exports.getBubbleProps = getBubbleProps;
    function showSettings() {
        window.showSettings();
    }
    exports.showSettings = showSettings;
})();