(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.smart = window.ts.state.smart || {};
    const exports = window.ts.state.smart.LeftPane = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const react_redux_1 = window.react_redux;
    const actions_1 = window.ts.state.actions;
    const LeftPane_1 = window.ts.components.LeftPane;
    const search_1 = window.ts.state.selectors.search;
    const user_1 = window.ts.state.selectors.user;
    const conversations_1 = window.ts.state.selectors.conversations;
    const ExpiredBuildDialog_1 = window.ts.state.smart.ExpiredBuildDialog;
    const MainHeader_1 = window.ts.state.smart.MainHeader;
    const MessageSearchResult_1 = window.ts.state.smart.MessageSearchResult;
    const NetworkStatus_1 = window.ts.state.smart.NetworkStatus;
    const RelinkDialog_1 = window.ts.state.smart.RelinkDialog;
    const UpdateDialog_1 = window.ts.state.smart.UpdateDialog;
    // Workaround: A react component's required properties are filtering up through connect()
    //   https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31363
    const FilteredSmartMainHeader = MainHeader_1.SmartMainHeader;
    const FilteredSmartMessageSearchResult = MessageSearchResult_1.SmartMessageSearchResult;
    const FilteredSmartNetworkStatus = NetworkStatus_1.SmartNetworkStatus;
    const FilteredSmartUpdateDialog = UpdateDialog_1.SmartUpdateDialog;
    const FilteredSmartExpiredBuildDialog = ExpiredBuildDialog_1.SmartExpiredBuildDialog;
    const FilteredSmartRelinkDialog = RelinkDialog_1.SmartRelinkDialog;
    function renderExpiredBuildDialog() {
        return react_1.default.createElement(FilteredSmartExpiredBuildDialog, null);
    }
    function renderMainHeader() {
        return react_1.default.createElement(FilteredSmartMainHeader, null);
    }
    function renderMessageSearchResult(id) {
        return react_1.default.createElement(FilteredSmartMessageSearchResult, { id: id });
    }
    function renderNetworkStatus() {
        return react_1.default.createElement(FilteredSmartNetworkStatus, null);
    }
    function renderRelinkDialog() {
        return react_1.default.createElement(FilteredSmartRelinkDialog, null);
    }
    function renderUpdateDialog() {
        return react_1.default.createElement(FilteredSmartUpdateDialog, null);
    }
    const mapStateToProps = (state) => {
        const showSearch = search_1.isSearching(state);
        const lists = showSearch ? undefined : conversations_1.getLeftPaneLists(state);
        const searchResults = showSearch ? search_1.getSearchResults(state) : undefined;
        const selectedConversationId = conversations_1.getSelectedConversation(state);
        return Object.assign(Object.assign({}, lists), {
            searchResults,
            selectedConversationId, showArchived: conversations_1.getShowArchived(state), i18n: user_1.getIntl(state), renderExpiredBuildDialog,
            renderMainHeader,
            renderMessageSearchResult,
            renderNetworkStatus,
            renderRelinkDialog,
            renderUpdateDialog
        });
    };
    const smart = react_redux_1.connect(mapStateToProps, actions_1.mapDispatchToProps);
    exports.SmartLeftPane = smart(LeftPane_1.LeftPane);
})();