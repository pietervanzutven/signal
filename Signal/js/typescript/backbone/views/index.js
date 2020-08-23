(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.backbone = window.ts.backbone || {};
    window.ts.backbone.views = window.ts.backbone.views || {};
    const exports = window.ts.backbone.views;

    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @prettier
     */
    const Lightbox = __importStar(window.ts.backbone.views.Lightbox);
    exports.Lightbox = Lightbox;
})();