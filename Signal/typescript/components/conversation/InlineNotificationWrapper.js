(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.InlineNotificationWrapper = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    class InlineNotificationWrapper extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.focusRef = react_1.default.createRef();
            this.setFocus = () => {
                const container = this.focusRef.current;
                if (container && !container.contains(document.activeElement)) {
                    container.focus();
                }
            };
            this.handleFocus = () => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (window.getInteractionMode() === 'keyboard') {
                    this.setSelected();
                }
            };
            this.setSelected = () => {
                const { id, conversationId, selectMessage } = this.props;
                if (selectMessage) {
                    selectMessage(id, conversationId);
                }
            };
        }
        componentDidMount() {
            const { isSelected } = this.props;
            if (isSelected) {
                this.setFocus();
            }
        }
        componentDidUpdate(prevProps) {
            const { isSelected } = this.props;
            if (!prevProps.isSelected && isSelected) {
                this.setFocus();
            }
        }
        render() {
            const { children } = this.props;
            return (react_1.default.createElement("div", {
                className: "module-inline-notification-wrapper",
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                tabIndex: 0, ref: this.focusRef, onFocus: this.handleFocus
            }, children));
        }
    }
    exports.InlineNotificationWrapper = InlineNotificationWrapper;
})();