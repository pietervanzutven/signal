(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.ShortcutGuideModal = {};

    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(window.react);
    const react_dom_1 = window.react_dom;
    const ShortcutGuide_1 = window.ts.components.ShortcutGuide;
    exports.ShortcutGuideModal = React.memo(
        // tslint:disable-next-line max-func-body-length
        (props) => {
            const { i18n, close, hasInstalledStickers, platform } = props;
            const [root, setRoot] = React.useState(null);
            React.useEffect(() => {
                const div = document.createElement('div');
                document.body.appendChild(div);
                setRoot(div);
                return () => {
                    document.body.removeChild(div);
                };
            }, []);
            return root
                ? react_dom_1.createPortal(React.createElement("div", { className: "module-shortcut-guide-modal" },
                    React.createElement("div", { className: "module-shortcut-guide-container" },
                        React.createElement(ShortcutGuide_1.ShortcutGuide, { hasInstalledStickers: hasInstalledStickers, platform: platform, close: close, i18n: i18n }))), root)
                : null;
        });
})();