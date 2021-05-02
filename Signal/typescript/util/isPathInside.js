require(exports => {
    "use strict";
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    // This is inspired by the `is-path-inside` module on npm.
    const path = __importStar(require("path"));
    function isPathInside(childPath, parentPath) {
        const childPathResolved = path.resolve(childPath);
        let parentPathResolved = path.resolve(parentPath);
        if (!parentPathResolved.endsWith(path.sep)) {
            parentPathResolved += path.sep;
        }
        return (childPathResolved !== parentPathResolved &&
            childPathResolved.startsWith(parentPathResolved));
    }
    exports.isPathInside = isPathInside;
});