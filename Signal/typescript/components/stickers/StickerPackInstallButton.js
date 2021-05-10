(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.stickers = window.ts.components.stickers || {};
    const exports = window.ts.components.stickers.StickerPackInstallButton = {};

    var __rest = (this && this.__rest) || function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    exports.StickerPackInstallButton = React.forwardRef((_a, ref) => {
        var { i18n, installed, blue } = _a, props = __rest(_a, ["i18n", "installed", "blue"]);
        return (React.createElement("button", Object.assign({
            type: "button", ref: ref, className: classnames_1.default({
                'module-sticker-manager__install-button': true,
                'module-sticker-manager__install-button--blue': blue,
            }), "aria-label": i18n('stickers--StickerManager--Install')
        }, props), installed
            ? i18n('stickers--StickerManager--Uninstall')
            : i18n('stickers--StickerManager--Install')));
    });
})();