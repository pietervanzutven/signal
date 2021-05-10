require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const BAD_CHARACTERS = /[^A-Za-z\s]+/g;
    const WHITESPACE = /\s+/g;
    function removeNonInitials(name) {
        return name.replace(BAD_CHARACTERS, '').replace(WHITESPACE, ' ');
    }
    function getInitials(name) {
        if (!name) {
            return undefined;
        }
        const cleaned = removeNonInitials(name);
        const parts = cleaned.split(' ');
        const initials = parts.map(part => part.trim()[0]);
        if (!initials.length) {
            return undefined;
        }
        return initials.slice(0, 2).join('');
    }
    exports.getInitials = getInitials;
});