require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const getStringForProfileChange_1 = require("../../util/getStringForProfileChange");
    function ProfileChangeNotification(props) {
        const { change, changedContact, i18n } = props;
        const message = getStringForProfileChange_1.getStringForProfileChange(change, changedContact, i18n);
        return (react_1.default.createElement("div", { className: "module-profile-change-notification" },
            react_1.default.createElement("div", { className: "module-profile-change-notification--icon" }),
            message));
    }
    exports.ProfileChangeNotification = ProfileChangeNotification;
});