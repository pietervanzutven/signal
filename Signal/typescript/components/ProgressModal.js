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
    const React = __importStar(require("react"));
    const react_dom_1 = require("react-dom");
    const ProgressDialog_1 = require("./ProgressDialog");
    exports.ProgressModal = React.memo(({ i18n }) => {
        const [root, setRoot] = React.useState(null);
        // Note: We explicitly don't register for user interaction here, since this dialog
        //   cannot be dismissed.
        React.useEffect(() => {
            const div = document.createElement('div');
            document.body.appendChild(div);
            setRoot(div);
            return () => {
                document.body.removeChild(div);
                setRoot(null);
            };
        }, []);
        return root
            ? react_dom_1.createPortal(React.createElement("div", { role: "presentation", className: "module-progress-dialog__overlay" },
                React.createElement(ProgressDialog_1.ProgressDialog, { i18n: i18n })), root)
            : null;
    });
});