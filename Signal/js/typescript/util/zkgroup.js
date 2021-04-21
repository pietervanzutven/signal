require(exports => {
    "use strict";

    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(window.zkgroup);
    const zkgroup_1 = require("zkgroup");
    const Crypto_1 = window.ts.Crypto;
    function arrayBufferToCompatArray(arrayBuffer) {
        const buffer = Buffer.from(arrayBuffer);
        return new zkgroup_1.FFICompatArray(buffer);
    }
    exports.arrayBufferToCompatArray = arrayBufferToCompatArray;
    function compatArrayToArrayBuffer(compatArray) {
        return Crypto_1.typedArrayToArrayBuffer(compatArray.buffer);
    }
    exports.compatArrayToArrayBuffer = compatArrayToArrayBuffer;
    function base64ToCompatArray(base64) {
        return arrayBufferToCompatArray(Crypto_1.base64ToArrayBuffer(base64));
    }
    exports.base64ToCompatArray = base64ToCompatArray;
    function compatArrayToBase64(compatArray) {
        return Crypto_1.arrayBufferToBase64(compatArrayToArrayBuffer(compatArray));
    }
    exports.compatArrayToBase64 = compatArrayToBase64;
    function compatArrayToHex(compatArray) {
        return Crypto_1.arrayBufferToHex(compatArrayToArrayBuffer(compatArray));
    }
    exports.compatArrayToHex = compatArrayToHex;
    function deriveProfileKeyVersion(profileKeyBase64, uuid) {
        const profileKeyArray = base64ToCompatArray(profileKeyBase64);
        const profileKey = new zkgroup_1.ProfileKey(profileKeyArray);
        const profileKeyVersion = profileKey.getProfileKeyVersion(uuid);
        return profileKeyVersion.toString();
    }
    exports.deriveProfileKeyVersion = deriveProfileKeyVersion;
    function getClientZkProfileOperations(serverPublicParamsBase64) {
        const serverPublicParamsArray = base64ToCompatArray(serverPublicParamsBase64);
        const serverPublicParams = new zkgroup_1.ServerPublicParams(serverPublicParamsArray);
        return new zkgroup_1.ClientZkProfileOperations(serverPublicParams);
    }
    exports.getClientZkProfileOperations = getClientZkProfileOperations;
    function generateProfileKeyCredentialRequest(clientZkProfileCipher, uuid, profileKeyBase64) {
        const profileKeyArray = base64ToCompatArray(profileKeyBase64);
        const profileKey = new zkgroup_1.ProfileKey(profileKeyArray);
        const context = clientZkProfileCipher.createProfileKeyCredentialRequestContext(uuid, profileKey);
        const request = context.getRequest();
        const requestArray = request.serialize();
        return {
            context,
            requestHex: compatArrayToHex(requestArray),
        };
    }
    exports.generateProfileKeyCredentialRequest = generateProfileKeyCredentialRequest;
    function handleProfileKeyCredential(clientZkProfileCipher, context, responseBase64) {
        const responseArray = base64ToCompatArray(responseBase64);
        const response = new zkgroup_1.ProfileKeyCredentialResponse(responseArray);
        const profileKeyCredential = clientZkProfileCipher.receiveProfileKeyCredential(context, response);
        const credentialArray = profileKeyCredential.serialize();
        return compatArrayToBase64(credentialArray);
    }
    exports.handleProfileKeyCredential = handleProfileKeyCredential;
});