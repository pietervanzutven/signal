require(exports => {
    "use strict";
    // Copyright 2019-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
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
    const Avatar_1 = require("./Avatar");
    function focusRef(el) {
        if (el) {
            el.focus();
        }
    }
    function sort(list) {
        return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    exports.GroupV1MigrationDialog = React.memo((props) => {
        const { areWeInvited, droppedMembers, hasMigrated, i18n, invitedMembers, migrate, onClose, } = props;
        const title = hasMigrated
            ? i18n('GroupV1--Migration--info--title')
            : i18n('GroupV1--Migration--migrate--title');
        const keepHistory = hasMigrated
            ? i18n('GroupV1--Migration--info--keep-history')
            : i18n('GroupV1--Migration--migrate--keep-history');
        const migrationKey = hasMigrated ? 'after' : 'before';
        const droppedMembersKey = `GroupV1--Migration--info--removed--${migrationKey}`;
        return (React.createElement("div", { className: "module-group-v2-migration-dialog" },
            React.createElement("button", { "aria-label": i18n('close'), type: "button", className: "module-group-v2-migration-dialog__close-button", onClick: onClose }),
            React.createElement("div", { className: "module-group-v2-migration-dialog__title" }, title),
            React.createElement("div", { className: "module-group-v2-migration-dialog__scrollable" },
                React.createElement("div", { className: "module-group-v2-migration-dialog__item" },
                    React.createElement("div", { className: "module-group-v2-migration-dialog__item__bullet" }),
                    React.createElement("div", { className: "module-group-v2-migration-dialog__item__content" }, i18n('GroupV1--Migration--info--summary'))),
                React.createElement("div", { className: "module-group-v2-migration-dialog__item" },
                    React.createElement("div", { className: "module-group-v2-migration-dialog__item__bullet" }),
                    React.createElement("div", { className: "module-group-v2-migration-dialog__item__content" }, keepHistory)),
                areWeInvited ? (React.createElement("div", { className: "module-group-v2-migration-dialog__item" },
                    React.createElement("div", { className: "module-group-v2-migration-dialog__item__bullet" }),
                    React.createElement("div", { className: "module-group-v2-migration-dialog__item__content" }, i18n('GroupV1--Migration--info--invited--you')))) : (React.createElement(React.Fragment, null,
                        renderMembers(invitedMembers, 'GroupV1--Migration--info--invited', i18n),
                        renderMembers(droppedMembers, droppedMembersKey, i18n)))),
            renderButtons(hasMigrated, onClose, migrate, i18n)));
    });
    function renderButtons(hasMigrated, onClose, migrate, i18n) {
        if (hasMigrated) {
            return (React.createElement("div", { className: classnames_1.default('module-group-v2-migration-dialog__buttons', 'module-group-v2-migration-dialog__buttons--narrow') },
                React.createElement("button", { className: "module-group-v2-migration-dialog__button", ref: focusRef, type: "button", onClick: onClose }, i18n('Confirmation--confirm'))));
        }
        return (React.createElement("div", { className: "module-group-v2-migration-dialog__buttons" },
            React.createElement("button", { className: classnames_1.default('module-group-v2-migration-dialog__button', 'module-group-v2-migration-dialog__button--secondary'), type: "button", onClick: onClose }, i18n('cancel')),
            React.createElement("button", { className: "module-group-v2-migration-dialog__button", ref: focusRef, type: "button", onClick: migrate }, i18n('GroupV1--Migration--migrate'))));
    }
    function renderMembers(members, prefix, i18n) {
        if (!members.length) {
            return null;
        }
        const postfix = members.length === 1 ? '--one' : '--many';
        const key = `${prefix}${postfix}`;
        return (React.createElement("div", { className: "module-group-v2-migration-dialog__item" },
            React.createElement("div", { className: "module-group-v2-migration-dialog__item__bullet" }),
            React.createElement("div", { className: "module-group-v2-migration-dialog__item__content" },
                React.createElement("div", null, i18n(key)),
                sort(members).map(member => (React.createElement("div", { key: member.id, className: "module-group-v2-migration-dialog__member" },
                    React.createElement(Avatar_1.Avatar, Object.assign({}, member, { conversationType: member.type, size: 28, i18n: i18n })),
                    ' ',
                    React.createElement("span", { className: "module-group-v2-migration-dialog__member__name" }, member.title)))))));
    }
});