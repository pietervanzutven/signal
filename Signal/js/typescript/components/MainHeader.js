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
    const lodash_1 = window.lodash;
    const Avatar_1 = window.ts.components.Avatar;
    const cleanSearchTerm_1 = window.ts.util.cleanSearchTerm;
    class MainHeader extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.updateSearchBound = this.updateSearch.bind(this);
            this.clearSearchBound = this.clearSearch.bind(this);
            this.handleKeyUpBound = this.handleKeyUp.bind(this);
            this.setFocusBound = this.setFocus.bind(this);
            this.inputRef = react_1.default.createRef();
            this.debouncedSearch = lodash_1.debounce(this.search.bind(this), 20);
        }
        search() {
            const { searchTerm, search, i18n, ourNumber, regionCode } = this.props;
            if (search) {
                search(searchTerm, {
                    noteToSelf: i18n('noteToSelf').toLowerCase(),
                    ourNumber,
                    regionCode,
                });
            }
        }
        updateSearch(event) {
            const { updateSearchTerm, clearSearch } = this.props;
            const searchTerm = event.currentTarget.value;
            if (!searchTerm) {
                clearSearch();
                return;
            }
            if (updateSearchTerm) {
                updateSearchTerm(searchTerm);
            }
            if (searchTerm.length < 2) {
                return;
            }
            const cleanedTerm = cleanSearchTerm_1.cleanSearchTerm(searchTerm);
            if (!cleanedTerm) {
                return;
            }
            this.debouncedSearch(cleanedTerm);
        }
        clearSearch() {
            const { clearSearch } = this.props;
            clearSearch();
            this.setFocus();
        }
        handleKeyUp(event) {
            const { clearSearch } = this.props;
            if (event.key === 'Escape') {
                clearSearch();
            }
        }
        setFocus() {
            if (this.inputRef.current) {
                // @ts-ignore
                this.inputRef.current.focus();
            }
        }
        render() {
            const { searchTerm, avatarPath, i18n, color, name, phoneNumber, profileName, } = this.props;
            return (react_1.default.createElement("div", { className: "module-main-header" },
                react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color, conversationType: "direct", i18n: i18n, name: name, phoneNumber: phoneNumber, profileName: profileName, size: 28 }),
                react_1.default.createElement("div", { className: "module-main-header__search" },
                    react_1.default.createElement("div", { role: "button", className: "module-main-header__search__icon", onClick: this.setFocusBound }),
                    react_1.default.createElement("input", { type: "text", ref: this.inputRef, className: "module-main-header__search__input", placeholder: i18n('search'), dir: "auto", onKeyUp: this.handleKeyUpBound, value: searchTerm, onChange: this.updateSearchBound }),
                    searchTerm ? (react_1.default.createElement("div", { role: "button", className: "module-main-header__search__cancel-icon", onClick: this.clearSearchBound })) : null)));
        }
    }
    exports.MainHeader = MainHeader;
})();