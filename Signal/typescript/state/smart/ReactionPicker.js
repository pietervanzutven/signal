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
    const react_redux_1 = require("react-redux");
    const lodash_1 = require("lodash");
    const user_1 = require("../selectors/user");
    const ReactionPicker_1 = require("../../components/conversation/ReactionPicker");
    exports.SmartReactionPicker = React.forwardRef((props, ref) => {
        const i18n = react_redux_1.useSelector(user_1.getIntl);
        const skinTone = react_redux_1.useSelector(state => lodash_1.get(state, ['items', 'skinTone'], 0));
        return (React.createElement(ReactionPicker_1.ReactionPicker, Object.assign({ ref: ref, skinTone: skinTone, i18n: i18n }, props)));
    });
});