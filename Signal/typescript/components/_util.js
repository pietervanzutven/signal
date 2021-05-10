(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components._util = {};

    // A separate file so this doesn't get picked up by StyleGuidist over real components
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = require("lodash");
    const memoizee_1 = __importDefault(require("memoizee"));
    function cleanId(id) {
        return id.replace(/[^\u0020-\u007e\u00a0-\u00ff]/g, '_');
    }
    exports.cleanId = cleanId;
    // Memoizee makes this difficult.
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    exports.createRefMerger = () => memoizee_1.default((...refs) => {
        return (t) => {
            refs.forEach(r => {
                if (lodash_1.isFunction(r)) {
                    r(t);
                }
                else if (r) {
                    // Using a MutableRefObject as intended
                    // eslint-disable-next-line no-param-reassign
                    r.current = t;
                }
            });
        };
    }, { length: false, max: 1 });
})();