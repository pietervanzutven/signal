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
    const ContactName_1 = require("./ContactName");
    const ConfirmationModal_1 = require("../ConfirmationModal");
    const Intl_1 = require("../Intl");
    var MessageRequestState;
    (function (MessageRequestState) {
        MessageRequestState[MessageRequestState["blocking"] = 0] = "blocking";
        MessageRequestState[MessageRequestState["deleting"] = 1] = "deleting";
        MessageRequestState[MessageRequestState["unblocking"] = 2] = "unblocking";
        MessageRequestState[MessageRequestState["default"] = 3] = "default";
    })(MessageRequestState = exports.MessageRequestState || (exports.MessageRequestState = {}));
    // tslint:disable-next-line: max-func-body-length
    exports.MessageRequestActionsConfirmation = ({ conversationType, i18n, name, onBlock, onBlockAndDelete, onChangeState, onDelete, onUnblock, phoneNumber, profileName, state, title, }) => {
        if (state === MessageRequestState.blocking) {
            return (
                // tslint:disable-next-line: use-simple-attributes
                React.createElement(ConfirmationModal_1.ConfirmationModal, {
                    i18n: i18n, onClose: () => {
                        onChangeState(MessageRequestState.default);
                    }, title: React.createElement(Intl_1.Intl, {
                        i18n: i18n, id: `MessageRequests--block-${conversationType}-confirm-title`, components: [
                            React.createElement(ContactName_1.ContactName, { key: "name", name: name, profileName: profileName, phoneNumber: phoneNumber, title: title, i18n: i18n }),
                        ]
                    }), actions: [
                        {
                            text: i18n('MessageRequests--block'),
                            action: onBlock,
                            style: 'negative',
                        },
                        {
                            text: i18n('MessageRequests--block-and-delete'),
                            action: onBlockAndDelete,
                            style: 'negative',
                        },
                    ]
                }, i18n(`MessageRequests--block-${conversationType}-confirm-body`)));
        }
        if (state === MessageRequestState.unblocking) {
            return (
                // tslint:disable-next-line: use-simple-attributes
                React.createElement(ConfirmationModal_1.ConfirmationModal, {
                    i18n: i18n, onClose: () => {
                        onChangeState(MessageRequestState.default);
                    }, title: React.createElement(Intl_1.Intl, {
                        i18n: i18n, id: 'MessageRequests--unblock-confirm-title', components: [
                            React.createElement(ContactName_1.ContactName, { key: "name", name: name, profileName: profileName, phoneNumber: phoneNumber, title: title, i18n: i18n }),
                        ]
                    }), actions: [
                        {
                            text: i18n('MessageRequests--unblock'),
                            action: onUnblock,
                            style: 'affirmative',
                        },
                        {
                            text: i18n('MessageRequests--delete'),
                            action: onDelete,
                            style: 'negative',
                        },
                    ]
                }, i18n(`MessageRequests--unblock-${conversationType}-confirm-body`)));
        }
        if (state === MessageRequestState.deleting) {
            return (
                // tslint:disable-next-line: use-simple-attributes
                React.createElement(ConfirmationModal_1.ConfirmationModal, {
                    i18n: i18n, onClose: () => {
                        onChangeState(MessageRequestState.default);
                    }, title: React.createElement(Intl_1.Intl, {
                        i18n: i18n, id: `MessageRequests--delete-${conversationType}-confirm-title`, components: [
                            React.createElement(ContactName_1.ContactName, { key: "name", name: name, profileName: profileName, phoneNumber: phoneNumber, title: title, i18n: i18n }),
                        ]
                    }), actions: [
                        {
                            text: i18n(`MessageRequests--delete-${conversationType}`),
                            action: onDelete,
                            style: 'negative',
                        },
                    ]
                }, i18n(`MessageRequests--delete-${conversationType}-confirm-body`)));
        }
        return null;
    };
});