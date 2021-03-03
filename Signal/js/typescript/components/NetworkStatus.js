(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.NetworkStatus = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const FIVE_SECONDS = 5 * 1000;
    function renderDialog({ title, subtext, renderActionableButton, }) {
        return (react_1.default.createElement("div", { className: "module-left-pane-dialog module-left-pane-dialog--warning" },
            react_1.default.createElement("div", { className: "module-left-pane-dialog__message" },
                react_1.default.createElement("h3", null, title),
                react_1.default.createElement("span", null, subtext)),
            renderActionableButton && renderActionableButton()));
    }
    exports.NetworkStatus = ({ hasNetworkDialog, i18n, isOnline, isRegistrationDone, socketStatus, relinkDevice, manualReconnect, }) => {
        if (!hasNetworkDialog) {
            return null;
        }
        const [isConnecting, setIsConnecting] = react_1.default.useState(false);
        react_1.default.useEffect(() => {
            let timeout;
            if (isConnecting) {
                timeout = setTimeout(() => {
                    setIsConnecting(false);
                }, FIVE_SECONDS);
            }
            return () => {
                if (timeout) {
                    clearTimeout(timeout);
                }
            };
        }, [isConnecting, setIsConnecting]);
        const reconnect = () => {
            setIsConnecting(true);
            manualReconnect();
        };
        const manualReconnectButton = () => (react_1.default.createElement("div", { className: "module-left-pane-dialog__actions" },
            react_1.default.createElement("button", { onClick: reconnect }, i18n('connect'))));
        if (!isRegistrationDone) {
            return renderDialog({
                renderActionableButton: () => (react_1.default.createElement("div", { className: "module-left-pane-dialog__actions" },
                    react_1.default.createElement("button", { onClick: relinkDevice }, i18n('relink')))),
                subtext: i18n('unlinkedWarning'),
                title: i18n('unlinked'),
            });
        }
        else if (isConnecting) {
            return renderDialog({
                subtext: i18n('connectingHangOn'),
                title: i18n('connecting'),
            });
        }
        else if (!isOnline) {
            return renderDialog({
                renderActionableButton: manualReconnectButton,
                subtext: i18n('checkNetworkConnection'),
                title: i18n('offline'),
            });
        }
        let subtext = '';
        let title = '';
        let renderActionableButton;
        switch (socketStatus) {
            case WebSocket.CONNECTING:
                subtext = i18n('connectingHangOn');
                title = i18n('connecting');
                break;
            case WebSocket.CLOSED:
            case WebSocket.CLOSING:
            default:
                renderActionableButton = manualReconnectButton;
                title = i18n('disconnected');
                subtext = i18n('checkNetworkConnection');
        }
        return renderDialog({
            renderActionableButton,
            subtext,
            title,
        });
    };
})();