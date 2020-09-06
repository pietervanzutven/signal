(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.types = window.ts.types || {};
    const exports = window.ts.types.Contact = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const formatPhoneNumber_1 = window.ts.util.formatPhoneNumber;
    var ContactType;
    (function (ContactType) {
        ContactType[ContactType["HOME"] = 1] = "HOME";
        ContactType[ContactType["MOBILE"] = 2] = "MOBILE";
        ContactType[ContactType["WORK"] = 3] = "WORK";
        ContactType[ContactType["CUSTOM"] = 4] = "CUSTOM";
    })(ContactType = exports.ContactType || (exports.ContactType = {}));
    var AddressType;
    (function (AddressType) {
        AddressType[AddressType["HOME"] = 1] = "HOME";
        AddressType[AddressType["WORK"] = 2] = "WORK";
        AddressType[AddressType["CUSTOM"] = 3] = "CUSTOM";
    })(AddressType = exports.AddressType || (exports.AddressType = {}));
    function contactSelector(contact, options) {
        const { regionCode, getAbsoluteAttachmentPath } = options;
        let { avatar } = contact;
        if (avatar && avatar.avatar && avatar.avatar.path) {
            avatar = Object.assign({}, avatar, { avatar: Object.assign({}, avatar.avatar, { path: getAbsoluteAttachmentPath(avatar.avatar.path) }) });
        }
        return Object.assign({}, contact, {
            avatar, number: contact.number &&
                contact.number.map(item => (Object.assign({}, item, {
                    value: formatPhoneNumber_1.formatPhoneNumber(item.value, {
                        ourRegionCode: regionCode,
                    })
                })))
        });
    }
    exports.contactSelector = contactSelector;
    function getName(contact) {
        const { name, organization } = contact;
        return (name && name.displayName) || organization || null;
    }
    exports.getName = getName;
})();