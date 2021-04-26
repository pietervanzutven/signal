require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const safetyNumber_1 = require("../util/safetyNumber");
    exports.SafetyNumberViewer = ({ contact, generateSafetyNumber, i18n, onClose, safetyNumber, safetyNumberChanged, toggleVerified, verificationDisabled, }) => {
        if (!contact) {
            return null;
        }
        react_1.default.useEffect(() => {
            generateSafetyNumber(contact);
        }, [safetyNumber]);
        const name = contact.title;
        const isVerified = contact.isVerified;
        const verifiedStatus = isVerified
            ? i18n('isVerified', [name])
            : i18n('isNotVerified', [name]);
        const verifyButtonText = isVerified ? i18n('unverify') : i18n('verify');
        return (react_1.default.createElement("div", { className: "module-safety-number" },
            onClose && (react_1.default.createElement("div", { className: "module-safety-number__close-button" },
                react_1.default.createElement("button", { onClick: onClose, tabIndex: 0 },
                    react_1.default.createElement("span", null)))),
            react_1.default.createElement("div", { className: "module-safety-number__verification-label" }, safetyNumberChanged
                ? i18n('changedRightAfterVerify', [name, name])
                : i18n('yourSafetyNumberWith', [name])),
            react_1.default.createElement("div", { className: "module-safety-number__number" }, safetyNumber || safetyNumber_1.getPlaceholder()),
            i18n('verifyHelp', [name]),
            react_1.default.createElement("div", { className: "module-safety-number__verification-status" },
                isVerified ? (react_1.default.createElement("span", { className: "module-safety-number__icon--verified" })) : (react_1.default.createElement("span", { className: "module-safety-number__icon--shield" })),
                verifiedStatus),
            react_1.default.createElement("div", { className: "module-safety-number__verify-container" },
                react_1.default.createElement("button", {
                    className: "module-safety-number__button--verify", disabled: verificationDisabled, onClick: () => {
                        toggleVerified(contact);
                    }, tabIndex: 0
                }, verifyButtonText))));
    };
});