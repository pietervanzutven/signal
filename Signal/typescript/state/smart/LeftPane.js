require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const react_redux_1 = require("react-redux");
    const actions_1 = require("../actions");
    const LeftPane_1 = require("../../components/LeftPane");
    const search_1 = require("../selectors/search");
    const user_1 = require("../selectors/user");
    const conversations_1 = require("../selectors/conversations");
    const ExpiredBuildDialog_1 = require("./ExpiredBuildDialog");
    const MainHeader_1 = require("./MainHeader");
    const MessageSearchResult_1 = require("./MessageSearchResult");
    const NetworkStatus_1 = require("./NetworkStatus");
    const RelinkDialog_1 = require("./RelinkDialog");
    const UpdateDialog_1 = require("./UpdateDialog");
    // Workaround: A react component's required properties are filtering up through connect()
    //   https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31363
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const FilteredSmartMessageSearchResult = MessageSearchResult_1.SmartMessageSearchResult;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    function renderExpiredBuildDialog() {
        return react_1.default.createElement(ExpiredBuildDialog_1.SmartExpiredBuildDialog, null);
    }
    function renderMainHeader() {
        return react_1.default.createElement(MainHeader_1.SmartMainHeader, null);
    }
    function renderMessageSearchResult(id) {
        return react_1.default.createElement(FilteredSmartMessageSearchResult, { id: id });
    }
    function renderNetworkStatus() {
        return react_1.default.createElement(NetworkStatus_1.SmartNetworkStatus, null);
    }
    function renderRelinkDialog() {
        return react_1.default.createElement(RelinkDialog_1.SmartRelinkDialog, null);
    }
    function renderUpdateDialog() {
        return react_1.default.createElement(UpdateDialog_1.SmartUpdateDialog, null);
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
});