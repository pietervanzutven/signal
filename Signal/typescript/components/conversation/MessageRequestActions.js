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
    const classnames_1 = __importDefault(require("classnames"));
    const ContactName_1 = require("./ContactName");
    const MessageRequestActionsConfirmation_1 = require("./MessageRequestActionsConfirmation");
    const Intl_1 = require("../Intl");
    exports.MessageRequestActions = ({ i18n, name, profileName, phoneNumber, conversationType, isBlocked, onBlock, onBlockAndDelete, onUnblock, onDelete, onAccept, }) => {
        const [mrState, setMrState] = React.useState(MessageRequestActionsConfirmation_1.MessageRequestState.default);
        return (React.createElement(React.Fragment, null,
            mrState !== MessageRequestActionsConfirmation_1.MessageRequestState.default ? (React.createElement(MessageRequestActionsConfirmation_1.MessageRequestActionsConfirmation, { i18n: i18n, onBlock: onBlock, onBlockAndDelete: onBlockAndDelete, onUnblock: onUnblock, onDelete: onDelete, name: name, profileName: profileName, phoneNumber: phoneNumber, conversationType: conversationType, state: mrState, onChangeState: setMrState })) : null,
            React.createElement("div", { className: "module-message-request-actions" },
                React.createElement("p", { className: "module-message-request-actions__message" },
                    React.createElement(Intl_1.Intl, {
                        i18n: i18n, id: `MessageRequests--message-${conversationType}${isBlocked ? '-blocked' : ''}`, components: [
                            React.createElement("strong", { key: "name", className: "module-message-request-actions__message__name" },
                                React.createElement(ContactName_1.ContactName, { name: name, profileName: profileName, phoneNumber: phoneNumber })),
                        ]
                    })),
                React.createElement("div", { className: "module-message-request-actions__buttons" },
                    isBlocked ? (React.createElement("button", {
                        onClick: () => {
                            setMrState(MessageRequestActionsConfirmation_1.MessageRequestState.unblocking);
                        }, tabIndex: 0, className: classnames_1.default('module-message-request-actions__buttons__button', 'module-message-request-actions__buttons__button--accept')
                    }, i18n('MessageRequests--unblock'))) : (React.createElement("button", {
                        onClick: () => {
                            setMrState(MessageRequestActionsConfirmation_1.MessageRequestState.blocking);
                        }, tabIndex: 0, className: classnames_1.default('module-message-request-actions__buttons__button', 'module-message-request-actions__buttons__button--deny')
                    }, i18n('MessageRequests--block'))),
                    React.createElement("button", {
                        onClick: () => {
                            setMrState(MessageRequestActionsConfirmation_1.MessageRequestState.deleting);
                        }, tabIndex: 0, className: classnames_1.default('module-message-request-actions__buttons__button', 'module-message-request-actions__buttons__button--deny')
                    }, i18n('MessageRequests--delete')),
                    !isBlocked ? (React.createElement("button", { onClick: onAccept, tabIndex: 0, className: classnames_1.default('module-message-request-actions__buttons__button', 'module-message-request-actions__buttons__button--accept') }, i18n('MessageRequests--accept'))) : null))));
    };
});