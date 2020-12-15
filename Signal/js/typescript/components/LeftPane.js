(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.LeftPane = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const ConversationListItem_1 = window.ts.components.ConversationListItem;
    const SearchResults_1 = window.ts.components.SearchResults;
    class LeftPane extends react_1.default.Component {
        renderList() {
            const { conversations, i18n, openConversationInternal, startNewConversation, searchResults, } = this.props;
            if (searchResults) {
                return (react_1.default.createElement(SearchResults_1.SearchResults, Object.assign({}, searchResults, { openConversation: openConversationInternal, startNewConversation: startNewConversation, i18n: i18n })));
            }
            return (react_1.default.createElement("div", { className: "module-left-pane__list" }, (conversations || []).map(conversation => (react_1.default.createElement(ConversationListItem_1.ConversationListItem, Object.assign({ key: conversation.phoneNumber }, conversation, { onClick: openConversationInternal, i18n: i18n }))))));
        }
        render() {
            const { renderMainHeader } = this.props;
            return (react_1.default.createElement("div", { className: "module-left-pane" },
                react_1.default.createElement("div", { className: "module-left-pane__header" }, renderMainHeader()),
                this.renderList()));
        }
    }
    exports.LeftPane = LeftPane;
})();