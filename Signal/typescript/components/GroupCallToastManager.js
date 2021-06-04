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
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importStar(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const Calling_1 = require("../types/Calling");
    // In the future, this component should show toasts when users join or leave. See
    //   DESKTOP-902.
    exports.GroupCallToastManager = ({ connectionState, i18n, }) => {
        const [isVisible, setIsVisible] = react_1.useState(false);
        react_1.useEffect(() => {
            setIsVisible(connectionState === Calling_1.GroupCallConnectionState.Reconnecting);
        }, [connectionState, setIsVisible]);
        const message = i18n('callReconnecting');
        return (react_1.default.createElement("div", {
            className: classnames_1.default('module-ongoing-call__toast', {
                'module-ongoing-call__toast--hidden': !isVisible,
            })
        }, message));
    };
});