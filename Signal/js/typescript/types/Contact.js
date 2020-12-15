(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.types = window.ts.types || {};
    const exports = window.ts.types.Contact = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const PhoneNumber_1 = window.ts.types.PhoneNumber;
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
        const { getAbsoluteAttachmentPath, hasSignalAccount, onClick, onSendMessage, regionCode, } = options;
        let { avatar } = contact;
        if (avatar && avatar.avatar) {
            if (avatar.avatar.error) {
                avatar = undefined;
            }
            else {
                avatar = Object.assign({}, avatar, {
                    avatar: Object.assign({}, avatar.avatar, {
                        path: avatar.avatar.path
                            ? getAbsoluteAttachmentPath(avatar.avatar.path)
                            : undefined
                    })
                });
            }
        }
        return Object.assign({}, contact, {
            hasSignalAccount,
            onSendMessage,
            onClick,
            avatar, number: contact.number &&
                contact.number.map(item => (Object.assign({}, item, {
                    value: PhoneNumber_1.format(item.value, {
                        ourRegionCode: regionCode,
                    })
                })))
        });
    }
    exports.contactSelector = contactSelector;
    function getName(contact) {
        const { name, organization } = contact;
        const displayName = (name && name.displayName) || undefined;
        const givenName = (name && name.givenName) || undefined;
        const familyName = (name && name.familyName) || undefined;
        const backupName = (givenName && familyName && `${givenName} ${familyName}`) || undefined;
        return displayName || organization || backupName || givenName || familyName;
    }
    exports.getName = getName;
})();