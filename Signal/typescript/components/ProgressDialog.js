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
    const Spinner_1 = require("./Spinner");
    exports.ProgressDialog = React.memo(({ i18n }) => {
        return (React.createElement("div", { className: "module-progress-dialog" },
            React.createElement("div", { className: "module-progress-dialog__spinner" },
                React.createElement(Spinner_1.Spinner, { svgSize: "normal", size: "39px", direction: "on-progress-dialog" })),
            React.createElement("div", { className: "module-progress-dialog__text" }, i18n('updating'))));
    });
});