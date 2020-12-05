(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.StagedGenericAttachment = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const Message_1 = window.ts.components.conversation.Message;
    class StagedGenericAttachment extends react_1.default.Component {
        render() {
            const { attachment, onClose } = this.props;
            const { fileName, contentType } = attachment;
            const extension = Message_1.getExtension({ contentType, fileName });
            return (react_1.default.createElement("div", { className: "module-staged-generic-attachment" },
                react_1.default.createElement("div", {
                    className: "module-staged-generic-attachment__close-button", role: "button", onClick: () => {
                        if (onClose) {
                            onClose(attachment);
                        }
                    }
                }),
                react_1.default.createElement("div", { className: "module-staged-generic-attachment__icon" }, extension ? (react_1.default.createElement("div", { className: "module-staged-generic-attachment__icon__extension" }, extension)) : null),
                react_1.default.createElement("div", { className: "module-staged-generic-attachment__filename" }, fileName)));
        }
    }
    exports.StagedGenericAttachment = StagedGenericAttachment;
})();