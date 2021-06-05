require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(require("react"));
    const Intl_1 = require("../Intl");
    const ContactName_1 = require("./ContactName");
    const ModalHost_1 = require("../ModalHost");
    const GroupV1MigrationDialog_1 = require("../GroupV1MigrationDialog");
    function GroupV1Migration(props) {
        const { areWeInvited, droppedMembers, i18n, invitedMembers } = props;
        const [showingDialog, setShowingDialog] = React.useState(false);
        const showDialog = React.useCallback(() => {
            setShowingDialog(true);
        }, [setShowingDialog]);
        const dismissDialog = React.useCallback(() => {
            setShowingDialog(false);
        }, [setShowingDialog]);
        return (React.createElement("div", { className: "module-group-v1-migration" },
            React.createElement("div", { className: "module-group-v1-migration--icon" }),
            React.createElement("div", { className: "module-group-v1-migration--text" }, i18n('GroupV1--Migration--was-upgraded')),
            areWeInvited ? (React.createElement("div", { className: "module-group-v1-migration--text" }, i18n('GroupV1--Migration--invited--you'))) : (React.createElement(React.Fragment, null,
                renderUsers(invitedMembers, i18n, 'GroupV1--Migration--invited'),
                renderUsers(droppedMembers, i18n, 'GroupV1--Migration--removed'))),
            React.createElement("button", { type: "button", className: "module-group-v1-migration--button", onClick: showDialog }, i18n('GroupV1--Migration--learn-more')),
            showingDialog ? (React.createElement(ModalHost_1.ModalHost, { onClose: dismissDialog },
                React.createElement(GroupV1MigrationDialog_1.GroupV1MigrationDialog, { areWeInvited: true, droppedMembers: droppedMembers, hasMigrated: true, i18n: i18n, invitedMembers: invitedMembers, migrate: () => window.log.warn('GroupV1Migration: Modal called migrate()'), onClose: dismissDialog }))) : null));
    }
    exports.GroupV1Migration = GroupV1Migration;
    function renderUsers(members, i18n, keyPrefix) {
        if (!members || members.length === 0) {
            return null;
        }
        const className = 'module-group-v1-migration--text';
        if (members.length === 1) {
            return (React.createElement("div", { className: className },
                React.createElement(Intl_1.Intl, { i18n: i18n, id: `${keyPrefix}--one`, components: [React.createElement(ContactName_1.ContactName, { title: members[0].title, i18n: i18n })] })));
        }
        return (React.createElement("div", { className: className }, i18n(`${keyPrefix}--many`, [members.length.toString()])));
    }
});