require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const safetyNumber_1 = require("../util/safetyNumber");
    const Intl_1 = require("./Intl");
    exports.SafetyNumberViewer = ({ contact, generateSafetyNumber, i18n, onClose, safetyNumber, safetyNumberChanged, toggleVerified, verificationDisabled, }) => {
        if (!contact) {
            return null;
        }
        react_1.default.useEffect(() => {
            generateSafetyNumber(contact);
        }, [safetyNumber]);
        const showNumber = Boolean(contact.name || contact.profileName);
        const numberFragment = showNumber ? ` · ${contact.phoneNumber}` : '';
        const name = `${contact.title}${numberFragment}`;
        const boldName = (key) => (react_1.default.createElement("span", { className: "module-safety-number__bold-name", key: key }, name));
        const isVerified = contact.isVerified;
        const verifiedStatusKey = isVerified ? 'isVerified' : 'isNotVerified';
        const safetyNumberChangedKey = safetyNumberChanged
            ? 'changedRightAfterVerify'
            : 'yourSafetyNumberWith';
        const verifyButtonText = isVerified ? i18n('unverify') : i18n('verify');
        return (react_1.default.createElement("div", { className: "module-safety-number" },
            onClose && (react_1.default.createElement("div", { className: "module-safety-number__close-button" },
                react_1.default.createElement("button", { onClick: onClose, tabIndex: 0 },
                    react_1.default.createElement("span", null)))),
            react_1.default.createElement("div", { className: "module-safety-number__verification-label" },
                react_1.default.createElement(Intl_1.Intl, { i18n: i18n, id: safetyNumberChangedKey, components: [boldName(1), boldName(2)] })),
            react_1.default.createElement("div", { className: "module-safety-number__number" }, safetyNumber || safetyNumber_1.getPlaceholder()),
            react_1.default.createElement(Intl_1.Intl, { i18n: i18n, id: "verifyHelp", components: [boldName()] }),
            react_1.default.createElement("div", { className: "module-safety-number__verification-status" },
                isVerified ? (react_1.default.createElement("span", { className: "module-safety-number__icon--verified" })) : (react_1.default.createElement("span", { className: "module-safety-number__icon--shield" })),
                react_1.default.createElement(Intl_1.Intl, { i18n: i18n, id: verifiedStatusKey, components: [boldName()] })),
            react_1.default.createElement("div", { className: "module-safety-number__verify-container" },
                react_1.default.createElement("button", {
                    className: "module-safety-number__button--verify", disabled: verificationDisabled, onClick: () => {
                        toggleVerified(contact);
                    }, tabIndex: 0
                }, verifyButtonText))));
    };
});