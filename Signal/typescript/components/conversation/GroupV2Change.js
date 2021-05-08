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
    const Intl_1 = require("../Intl");
    const groupChange_1 = require("../../groupChange");
    function renderStringToIntl(id, i18n, components) {
        return React.createElement(Intl_1.Intl, { id: id, i18n: i18n, components: components });
    }
    function GroupV2Change(props) {
        const { AccessControlEnum, change, i18n, ourConversationId, renderContact, RoleEnum, } = props;
        return (React.createElement("div", { className: "module-group-v2-change" },
            React.createElement("div", { className: "module-group-v2-change--icon" }),
            groupChange_1.renderChange(change, {
                AccessControlEnum,
                i18n,
                ourConversationId,
                renderContact,
                renderString: renderStringToIntl,
                RoleEnum,
            }).map((item, index) => (React.createElement("div", { key: index }, item)))));
    }
    exports.GroupV2Change = GroupV2Change;
});