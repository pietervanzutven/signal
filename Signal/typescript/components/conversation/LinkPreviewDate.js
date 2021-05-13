require(exports => {
    "use strict";
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
    const moment_1 = __importDefault(require("moment"));
    const isLinkPreviewDateValid_1 = require("../../linkPreviews/isLinkPreviewDateValid");
    exports.LinkPreviewDate = ({ date, className = '', }) => {
        const dateMoment = isLinkPreviewDateValid_1.isLinkPreviewDateValid(date)
            ? moment_1.default(date)
            : null;
        return dateMoment ? (React.createElement("time", { className: className, dateTime: dateMoment.toISOString() }, dateMoment.format('ll'))) : null;
    };
});