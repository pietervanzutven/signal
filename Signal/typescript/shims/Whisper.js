(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.shims = window.ts.shims || {};
    const exports = window.ts.shims.Whisper = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    function getSearchResultsProps(attributes) {
        // @ts-ignore
        const model = new window.Whisper.Message(attributes);
        return model.getPropsForSearchResult();
    }
    exports.getSearchResultsProps = getSearchResultsProps;
    function getBubbleProps(attributes) {
        // @ts-ignore
        const model = new window.Whisper.Message(attributes);
        return model.getPropsForBubble();
    }
    exports.getBubbleProps = getBubbleProps;
    function showSettings() {
        // @ts-ignore
        window.showSettings();
    }
    exports.showSettings = showSettings;
})();