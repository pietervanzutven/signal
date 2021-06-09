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
    const react_measure_1 = __importDefault(require("react-measure"));
    const Timestamp_1 = require("./Timestamp");
    const Calling_1 = require("../../types/Calling");
    const callingNotification_1 = require("../../util/callingNotification");
    const missingCaseError_1 = require("../../util/missingCaseError");
    const Tooltip_1 = require("../Tooltip");
    exports.CallingNotification = react_1.default.memo(props => {
        const { conversationId, i18n, messageId, messageSizeChanged } = props;
        const previousHeightRef = react_1.useRef(null);
        const [height, setHeight] = react_1.useState(null);
        react_1.useEffect(() => {
            if (height === null) {
                return;
            }
            if (previousHeightRef.current !== null &&
                height !== previousHeightRef.current) {
                messageSizeChanged(messageId, conversationId);
            }
            previousHeightRef.current = height;
        }, [height, conversationId, messageId, messageSizeChanged]);
        let timestamp;
        let callType;
        switch (props.callMode) {
            case Calling_1.CallMode.Direct:
                timestamp = props.acceptedTime || props.endedTime;
                callType = props.wasVideoCall ? 'video' : 'audio';
                break;
            case Calling_1.CallMode.Group:
                timestamp = props.startedTime;
                callType = 'video';
                break;
            default:
                window.log.error(missingCaseError_1.missingCaseError(props));
                return null;
        }
        return (react_1.default.createElement(react_measure_1.default, {
            bounds: true, onResize: ({ bounds }) => {
                if (!bounds) {
                    window.log.error('We should be measuring the bounds');
                    return;
                }
                setHeight(bounds.height);
            }
        }, ({ measureRef }) => (react_1.default.createElement("div", { className: `module-message-calling--notification module-message-calling--${callType}`, ref: measureRef },
            react_1.default.createElement("div", { className: `module-message-calling--${callType}__icon` }),
            callingNotification_1.getCallingNotificationText(props, i18n),
            react_1.default.createElement("div", null,
                react_1.default.createElement(Timestamp_1.Timestamp, { i18n: i18n, timestamp: timestamp, extended: true, direction: "outgoing", withImageNoCaption: false, withSticker: false, withTapToViewExpired: false, module: "module-message__metadata__date" })),
            react_1.default.createElement(CallingNotificationButton, Object.assign({}, props))))));
    });
    function CallingNotificationButton(props) {
        if (props.callMode !== Calling_1.CallMode.Group || props.ended) {
            return null;
        }
        const { activeCallConversationId, conversationId, deviceCount, i18n, maxDevices, returnToActiveCall, startCallingLobby, } = props;
        let buttonText;
        let disabledTooltipText;
        let onClick;
        if (activeCallConversationId) {
            if (activeCallConversationId === conversationId) {
                buttonText = i18n('calling__return');
                onClick = returnToActiveCall;
            }
            else {
                buttonText = i18n('calling__join');
                disabledTooltipText = i18n('calling__call-notification__button__in-another-call-tooltip');
            }
        }
        else if (deviceCount >= maxDevices) {
            buttonText = i18n('calling__call-is-full');
            disabledTooltipText = i18n('calling__call-notification__button__call-full-tooltip', [String(deviceCount)]);
        }
        else {
            buttonText = i18n('calling__join');
            onClick = () => {
                startCallingLobby({ conversationId, isVideoCall: true });
            };
        }
        const button = (react_1.default.createElement("button", { className: "module-message-calling--notification__button", disabled: Boolean(disabledTooltipText), onClick: onClick, type: "button" }, buttonText));
        if (disabledTooltipText) {
            return (react_1.default.createElement(Tooltip_1.Tooltip, { content: disabledTooltipText, direction: Tooltip_1.TooltipPlacement.Top }, button));
        }
        return button;
    }
});