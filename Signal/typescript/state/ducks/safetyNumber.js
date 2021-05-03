require(exports => {
    "use strict";
    var __rest = (this && this.__rest) || function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const safetyNumber_1 = require("../../util/safetyNumber");
    const contactVerification_1 = require("../../shims/contactVerification");
    const GENERATE = 'safetyNumber/GENERATE';
    const GENERATE_FULFILLED = 'safetyNumber/GENERATE_FULFILLED';
    const TOGGLE_VERIFIED = 'safetyNumber/TOGGLE_VERIFIED';
    const TOGGLE_VERIFIED_FULFILLED = 'safetyNumber/TOGGLE_VERIFIED_FULFILLED';
    const TOGGLE_VERIFIED_PENDING = 'safetyNumber/TOGGLE_VERIFIED_PENDING';
    function generate(contact) {
        return {
            type: GENERATE,
            payload: doGenerate(contact),
        };
    }
    async function doGenerate(contact) {
        const securityNumberBlock = await safetyNumber_1.generateSecurityNumberBlock(contact);
        return {
            contact,
            safetyNumber: securityNumberBlock.join(' '),
        };
    }
    function toggleVerified(contact) {
        return {
            type: TOGGLE_VERIFIED,
            payload: {
                data: { contact },
                promise: doToggleVerified(contact),
            },
        };
    }
    async function alterVerification(contact) {
        try {
            await contactVerification_1.toggleVerification(contact.id);
        }
        catch (result) {
            if (result instanceof Error) {
                if (result.name === 'OutgoingIdentityKeyError') {
                    throw result;
                }
                else {
                    window.log.error('failed to toggle verified:', result && result.stack ? result.stack : result);
                }
            }
            else {
                const keyError = result.errors.find((error) => error.name === 'OutgoingIdentityKeyError');
                if (keyError) {
                    throw keyError;
                }
                else {
                    result.errors.forEach((error) => {
                        window.log.error('failed to toggle verified:', error && error.stack ? error.stack : error);
                    });
                }
            }
        }
    }
    async function doToggleVerified(contact) {
        try {
            await alterVerification(contact);
        }
        catch (err) {
            if (err.name === 'OutgoingIdentityKeyError') {
                await contactVerification_1.reloadProfiles(contact.id);
                const securityNumberBlock = await safetyNumber_1.generateSecurityNumberBlock(contact);
                return {
                    contact,
                    safetyNumber: securityNumberBlock.join(' '),
                    safetyNumberChanged: true,
                };
            }
        }
        return { contact };
    }
    exports.actions = {
        generateSafetyNumber: generate,
        toggleVerified,
    };
    function getEmptyState() {
        return {
            contacts: {},
        };
    }
    function reducer(state = getEmptyState(), action) {
        if (action.type === TOGGLE_VERIFIED_PENDING) {
            const { contact } = action.payload;
            const { id } = contact;
            const record = state.contacts[id];
            return {
                contacts: Object.assign(Object.assign({}, state.contacts), { [id]: Object.assign(Object.assign({}, record), { safetyNumberChanged: false, verificationDisabled: true }) }),
            };
        }
        if (action.type === TOGGLE_VERIFIED_FULFILLED) {
            const _a = action.payload, { contact } = _a, restProps = __rest(_a, ["contact"]);
            const { id } = contact;
            const record = state.contacts[id];
            return {
                contacts: Object.assign(Object.assign({}, state.contacts), { [id]: Object.assign(Object.assign(Object.assign({}, record), restProps), { verificationDisabled: false }) }),
            };
        }
        if (action.type === GENERATE_FULFILLED) {
            const { contact, safetyNumber } = action.payload;
            const { id } = contact;
            const record = state.contacts[id];
            return {
                contacts: Object.assign(Object.assign({}, state.contacts), { [id]: Object.assign(Object.assign({}, record), { safetyNumber }) }),
            };
        }
        return state;
    }
    exports.reducer = reducer;
});