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
    exports.GroupV1DisabledActions = ({ i18n, onStartGroupMigration, }) => {
        return (React.createElement("div", { className: "module-group-v1-disabled-actions" },
            React.createElement("p", { className: "module-group-v1-disabled-actions__message" },
                React.createElement(Intl_1.Intl, {
                    i18n: i18n, id: "GroupV1--Migration--disabled", components: {
                        learnMore: (React.createElement("a", { href: "https://support.signal.org/hc/articles/360007319331", target: "_blank", rel: "noreferrer", className: "module-group-v1-disabled-actions__message__learn-more" }, i18n('MessageRequests--learn-more'))),
                    }
                })),
            React.createElement("div", { className: "module-group-v1-disabled-actions__buttons" },
                React.createElement("button", { type: "button", onClick: onStartGroupMigration, tabIndex: 0, className: "module-group-v1-disabled-actions__buttons__button" }, i18n('MessageRequests--continue')))));
    };
});