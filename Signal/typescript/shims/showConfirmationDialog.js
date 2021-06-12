require(exports => {
    "use strict";
    // Copyright 2015-2021 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    let confirmationDialogViewNode = null;
    let confirmationDialogPreviousFocus = null;
    function removeConfirmationDialog() {
        if (!confirmationDialogViewNode) {
            return;
        }
        window.ReactDOM.unmountComponentAtNode(confirmationDialogViewNode);
        document.body.removeChild(confirmationDialogViewNode);
        if (confirmationDialogPreviousFocus &&
            typeof confirmationDialogPreviousFocus.focus === 'function') {
            confirmationDialogPreviousFocus.focus();
        }
        confirmationDialogViewNode = null;
    }
    function showConfirmationDialog(options) {
        if (confirmationDialogViewNode) {
            removeConfirmationDialog();
        }
        confirmationDialogViewNode = document.createElement('div');
        document.body.appendChild(confirmationDialogViewNode);
        confirmationDialogPreviousFocus = document.activeElement;
        window.ReactDOM.render(
            // eslint-disable-next-line react/react-in-jsx-scope, react/jsx-no-undef
            React.createElement(window.Signal.Components.ConfirmationModal, {
                actions: [
                    {
                        action: () => {
                            removeConfirmationDialog();
                            options.resolve();
                        },
                        style: options.confirmStyle,
                        text: options.okText || window.i18n('ok'),
                    },
                ], cancelText: options.cancelText || window.i18n('cancel'), i18n: window.i18n, onClose: () => {
                    removeConfirmationDialog();
                    if (options.reject) {
                        options.reject();
                    }
                }, title: options.message
            }), confirmationDialogViewNode);
    }
    window.showConfirmationDialog = showConfirmationDialog;
});