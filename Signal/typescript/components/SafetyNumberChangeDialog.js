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
    const Avatar_1 = require("./Avatar");
    const ConfirmationModal_1 = require("./ConfirmationModal");
    const InContactsIcon_1 = require("./InContactsIcon");
    const SafetyDialogContents = ({ confirmText, contacts, i18n, onCancel, onConfirm, onView, }) => {
        const cancelButtonRef = React.createRef();
        React.useEffect(() => {
            if (cancelButtonRef && cancelButtonRef.current) {
                cancelButtonRef.current.focus();
            }
        }, [contacts]);
        return (React.createElement(React.Fragment, null,
            React.createElement("h1", { className: "module-sfn-dialog__title" }, i18n('safetyNumberChanges')),
            React.createElement("div", { className: "module-sfn-dialog__message" }, i18n('changedVerificationWarning')),
            React.createElement("ul", { className: "module-sfn-dialog__contacts" }, contacts.map((contact) => {
                const shouldShowNumber = Boolean(contact.name || contact.profileName);
                return (React.createElement("li", { className: "module-sfn-dialog__contact", key: contact.id },
                    React.createElement(Avatar_1.Avatar, { avatarPath: contact.avatarPath, color: contact.color, conversationType: "direct", i18n: i18n, name: contact.name, phoneNumber: contact.phoneNumber, profileName: contact.profileName, title: contact.title, size: 52 }),
                    React.createElement("div", { className: "module-sfn-dialog__contact--wrapper" },
                        React.createElement("div", { className: "module-sfn-dialog__contact--name" },
                            contact.title,
                            contact.name ? (React.createElement("span", null,
                                ' ',
                                React.createElement(InContactsIcon_1.InContactsIcon, { i18n: i18n }))) : null),
                        shouldShowNumber ? (React.createElement("div", { className: "module-sfn-dialog__contact--number" }, contact.phoneNumber)) : null),
                    React.createElement("button", {
                        className: "module-sfn-dialog__contact--view", onClick: () => {
                            onView(contact);
                        }, tabIndex: 0
                    }, i18n('view'))));
            })),
            React.createElement("div", { className: "module-sfn-dialog__actions" },
                React.createElement("button", { className: "module-sfn-dialog__actions--cancel", onClick: onCancel, ref: cancelButtonRef, tabIndex: 0 }, i18n('cancel')),
                React.createElement("button", { className: "module-sfn-dialog__actions--confirm", onClick: onConfirm, tabIndex: 0 }, confirmText || i18n('sendMessageToContact')))));
    };
    exports.SafetyNumberChangeDialog = (props) => {
        const { i18n, onCancel, renderSafetyNumber } = props;
        const [contact, setViewSafetyNumber] = React.useState(undefined);
        const onClose = contact
            ? () => {
                setViewSafetyNumber(undefined);
            }
            : onCancel;
        return (React.createElement(ConfirmationModal_1.ConfirmationModal, { actions: [], i18n: i18n, onClose: onClose },
            contact && renderSafetyNumber({ contactID: contact.id, onClose }),
            !contact && (React.createElement(SafetyDialogContents, Object.assign({}, props, {
                onView: selectedContact => {
                    setViewSafetyNumber(selectedContact);
                }
            })))));
    };
});