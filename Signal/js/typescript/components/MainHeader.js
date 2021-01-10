(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.MainHeader = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const lodash_1 = window.lodash;
    const Avatar_1 = window.ts.components.Avatar;
    class MainHeader extends react_1.default.Component {
        constructor(props) {
            super(props);
            // tslint:disable-next-line member-ordering
            this.search = lodash_1.debounce((searchTerm) => {
                const { i18n, ourNumber, regionCode, searchDiscussions, searchMessages, searchConversationId, } = this.props;
                if (searchDiscussions && !searchConversationId) {
                    searchDiscussions(searchTerm, {
                        noteToSelf: i18n('noteToSelf').toLowerCase(),
                        ourNumber,
                    });
                }
                if (searchMessages) {
                    searchMessages(searchTerm, {
                        searchConversationId,
                        regionCode,
                    });
                }
            }, 200);
            this.updateSearch = (event) => {
                const { updateSearchTerm, clearConversationSearch, clearSearch, searchConversationId, } = this.props;
                const searchTerm = event.currentTarget.value;
                if (!searchTerm) {
                    if (searchConversationId) {
                        clearConversationSearch();
                    }
                    else {
                        clearSearch();
                    }
                    return;
                }
                if (updateSearchTerm) {
                    updateSearchTerm(searchTerm);
                }
                if (searchTerm.length < 2) {
                    return;
                }
                this.search(searchTerm);
            };
            this.clearSearch = () => {
                const { clearSearch } = this.props;
                clearSearch();
                this.setFocus();
            };
            this.clearConversationSearch = () => {
                const { clearConversationSearch } = this.props;
                clearConversationSearch();
                this.setFocus();
            };
            this.handleKeyUp = (event) => {
                const { clearConversationSearch, clearSearch, searchConversationId, searchTerm, } = this.props;
                if (event.key !== 'Escape') {
                    return;
                }
                if (searchConversationId && searchTerm) {
                    clearConversationSearch();
                }
                else {
                    clearSearch();
                }
            };
            this.handleXButton = () => {
                const { searchConversationId, clearConversationSearch, clearSearch, } = this.props;
                if (searchConversationId) {
                    clearConversationSearch();
                }
                else {
                    clearSearch();
                }
                this.setFocus();
            };
            this.setFocus = () => {
                if (this.inputRef.current) {
                    // @ts-ignore
                    this.inputRef.current.focus();
                }
            };
            this.inputRef = react_1.default.createRef();
        }
        componentDidUpdate(prevProps) {
            const { searchConversationId } = this.props;
            // When user chooses to search in a given conversation we focus the field for them
            if (searchConversationId &&
                searchConversationId !== prevProps.searchConversationId) {
                this.setFocus();
            }
        }
        render() {
            const { avatarPath, color, i18n, name, phoneNumber, profileName, searchConversationId, searchConversationName, searchTerm, } = this.props;
            const placeholder = searchConversationName
                ? i18n('searchIn', [searchConversationName])
                : i18n('search');
            return (react_1.default.createElement("div", { className: "module-main-header" },
                react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color, conversationType: "direct", i18n: i18n, name: name, phoneNumber: phoneNumber, profileName: profileName, size: 28 }),
                react_1.default.createElement("div", { className: "module-main-header__search" },
                    searchConversationId ? (react_1.default.createElement("button", { className: "module-main-header__search__in-conversation-pill", onClick: this.clearSearch },
                        react_1.default.createElement("div", { className: "module-main-header__search__in-conversation-pill__avatar-container" },
                            react_1.default.createElement("div", { className: "module-main-header__search__in-conversation-pill__avatar" })),
                        react_1.default.createElement("div", { className: "module-main-header__search__in-conversation-pill__x-button" }))) : (react_1.default.createElement("button", { className: "module-main-header__search__icon", onClick: this.setFocus })),
                    react_1.default.createElement("input", {
                        type: "text", ref: this.inputRef, className: classnames_1.default('module-main-header__search__input', searchTerm
                            ? 'module-main-header__search__input--with-text'
                            : null, searchConversationId
                            ? 'module-main-header__search__input--in-conversation'
                            : null), placeholder: placeholder, dir: "auto", onKeyUp: this.handleKeyUp, value: searchTerm, onChange: this.updateSearch
                    }),
                    searchTerm ? (react_1.default.createElement("div", { role: "button", className: "module-main-header__search__cancel-icon", onClick: this.handleXButton })) : null)));
        }
    }
    exports.MainHeader = MainHeader;
})();