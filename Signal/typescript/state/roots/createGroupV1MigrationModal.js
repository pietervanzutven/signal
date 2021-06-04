require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const react_redux_1 = require("react-redux");
    const ModalHost_1 = require("../../components/ModalHost");
    const GroupV1MigrationDialog_1 = require("../smart/GroupV1MigrationDialog");
    exports.createGroupV1MigrationModal = (store, props) => {
        const { onClose } = props;
        return (react_1.default.createElement(react_redux_1.Provider, { store: store },
            react_1.default.createElement(ModalHost_1.ModalHost, { onClose: onClose },
                react_1.default.createElement(GroupV1MigrationDialog_1.SmartGroupV1MigrationDialog, Object.assign({}, props)))));
    };
});