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
    const lodash_1 = window.lodash;
    const memoizee_1 = __importDefault(window.memoizee);
    function cleanId(id) {
        return id.replace(/[^\u0020-\u007e\u00a0-\u00ff]/g, '_');
    }
    exports.cleanId = cleanId;
    exports.createRefMerger = () => memoizee_1.default((...refs) => {
        return (t) => {
            refs.forEach(r => {
                if (lodash_1.isFunction(r)) {
                    r(t);
                }
                else if (r) {
                    // @ts-ignore: React's typings for ref objects is annoying
                    r.current = t;
                }
            });
        };
    }, { length: false, max: 1 });
})();