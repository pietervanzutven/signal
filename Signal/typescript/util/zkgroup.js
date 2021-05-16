require(exports => {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    const zkgroup_1 = require("zkgroup");
    const Crypto_1 = require("../Crypto");
    __export(require("zkgroup"));
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
    // Scenarios
    function decryptGroupBlob(clientZkGroupCipher, ciphertext) {
        return compatArrayToArrayBuffer(clientZkGroupCipher.decryptBlob(arrayBufferToCompatArray(ciphertext)));
    }
    exports.decryptGroupBlob = decryptGroupBlob;
    function decryptProfileKeyCredentialPresentation(clientZkGroupCipher, presentationBuffer) {
        const presentation = new zkgroup_1.ProfileKeyCredentialPresentation(arrayBufferToCompatArray(presentationBuffer));
        const uuidCiphertext = presentation.getUuidCiphertext();
        const uuid = clientZkGroupCipher.decryptUuid(uuidCiphertext);
        const profileKeyCiphertext = presentation.getProfileKeyCiphertext();
        const profileKey = clientZkGroupCipher.decryptProfileKey(profileKeyCiphertext, uuid);
        return {
            profileKey: compatArrayToArrayBuffer(profileKey.serialize()),
            uuid,
        };
    }
    exports.decryptProfileKeyCredentialPresentation = decryptProfileKeyCredentialPresentation;
    function decryptProfileKey(clientZkGroupCipher, profileKeyCiphertextBuffer, uuid) {
        const profileKeyCiphertext = new zkgroup_1.ProfileKeyCiphertext(arrayBufferToCompatArray(profileKeyCiphertextBuffer));
        const profileKey = clientZkGroupCipher.decryptProfileKey(profileKeyCiphertext, uuid);
        return compatArrayToArrayBuffer(profileKey.serialize());
    }
    exports.decryptProfileKey = decryptProfileKey;
    function decryptUuid(clientZkGroupCipher, uuidCiphertextBuffer) {
        const uuidCiphertext = new zkgroup_1.UuidCiphertext(arrayBufferToCompatArray(uuidCiphertextBuffer));
        return clientZkGroupCipher.decryptUuid(uuidCiphertext);
    }
    exports.decryptUuid = decryptUuid;
    function deriveProfileKeyVersion(profileKeyBase64, uuid) {
        const profileKeyArray = base64ToCompatArray(profileKeyBase64);
        const profileKey = new zkgroup_1.ProfileKey(profileKeyArray);
        const profileKeyVersion = profileKey.getProfileKeyVersion(uuid);
        return profileKeyVersion.toString();
    }
    exports.deriveProfileKeyVersion = deriveProfileKeyVersion;
    function deriveGroupPublicParams(groupSecretParamsBuffer) {
        const groupSecretParams = new zkgroup_1.GroupSecretParams(arrayBufferToCompatArray(groupSecretParamsBuffer));
        return compatArrayToArrayBuffer(groupSecretParams.getPublicParams().serialize());
    }
    exports.deriveGroupPublicParams = deriveGroupPublicParams;
    function deriveGroupID(groupSecretParamsBuffer) {
        const groupSecretParams = new zkgroup_1.GroupSecretParams(arrayBufferToCompatArray(groupSecretParamsBuffer));
        return compatArrayToArrayBuffer(groupSecretParams
            .getPublicParams()
            .getGroupIdentifier()
            .serialize());
    }
    exports.deriveGroupID = deriveGroupID;
    function deriveGroupSecretParams(masterKeyBuffer) {
        const masterKey = new zkgroup_1.GroupMasterKey(arrayBufferToCompatArray(masterKeyBuffer));
        const groupSecretParams = zkgroup_1.GroupSecretParams.deriveFromMasterKey(masterKey);
        return compatArrayToArrayBuffer(groupSecretParams.serialize());
    }
    exports.deriveGroupSecretParams = deriveGroupSecretParams;
    function encryptGroupBlob(clientZkGroupCipher, plaintext) {
        return compatArrayToArrayBuffer(clientZkGroupCipher.encryptBlob(arrayBufferToCompatArray(plaintext)));
    }
    exports.encryptGroupBlob = encryptGroupBlob;
    function encryptUuid(clientZkGroupCipher, uuidPlaintext) {
        const uuidCiphertext = clientZkGroupCipher.encryptUuid(uuidPlaintext);
        return compatArrayToArrayBuffer(uuidCiphertext.serialize());
    }
    exports.encryptUuid = encryptUuid;
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
    function getAuthCredentialPresentation(clientZkAuthOperations, authCredentialBase64, groupSecretParamsBase64) {
        const authCredential = new zkgroup_1.AuthCredential(base64ToCompatArray(authCredentialBase64));
        const secretParams = new zkgroup_1.GroupSecretParams(base64ToCompatArray(groupSecretParamsBase64));
        const presentation = clientZkAuthOperations.createAuthCredentialPresentation(secretParams, authCredential);
        return compatArrayToArrayBuffer(presentation.serialize());
    }
    exports.getAuthCredentialPresentation = getAuthCredentialPresentation;
    function createProfileKeyCredentialPresentation(clientZkProfileCipher, profileKeyCredentialBase64, groupSecretParamsBase64) {
        const profileKeyCredentialArray = base64ToCompatArray(profileKeyCredentialBase64);
        const profileKeyCredential = new zkgroup_1.ProfileKeyCredential(profileKeyCredentialArray);
        const secretParams = new zkgroup_1.GroupSecretParams(base64ToCompatArray(groupSecretParamsBase64));
        const presentation = clientZkProfileCipher.createProfileKeyCredentialPresentation(secretParams, profileKeyCredential);
        return compatArrayToArrayBuffer(presentation.serialize());
    }
    exports.createProfileKeyCredentialPresentation = createProfileKeyCredentialPresentation;
    function getClientZkAuthOperations(serverPublicParamsBase64) {
        const serverPublicParams = new zkgroup_1.ServerPublicParams(base64ToCompatArray(serverPublicParamsBase64));
        return new zkgroup_1.ClientZkAuthOperations(serverPublicParams);
    }
    exports.getClientZkAuthOperations = getClientZkAuthOperations;
    function getClientZkGroupCipher(groupSecretParamsBase64) {
        const serverPublicParams = new zkgroup_1.GroupSecretParams(base64ToCompatArray(groupSecretParamsBase64));
        return new zkgroup_1.ClientZkGroupCipher(serverPublicParams);
    }
    exports.getClientZkGroupCipher = getClientZkGroupCipher;
    function getClientZkProfileOperations(serverPublicParamsBase64) {
        const serverPublicParams = new zkgroup_1.ServerPublicParams(base64ToCompatArray(serverPublicParamsBase64));
        return new zkgroup_1.ClientZkProfileOperations(serverPublicParams);
    }
    exports.getClientZkProfileOperations = getClientZkProfileOperations;
    function handleProfileKeyCredential(clientZkProfileCipher, context, responseBase64) {
        const response = new zkgroup_1.ProfileKeyCredentialResponse(base64ToCompatArray(responseBase64));
        const profileKeyCredential = clientZkProfileCipher.receiveProfileKeyCredential(context, response);
        const credentialArray = profileKeyCredential.serialize();
        return compatArrayToBase64(credentialArray);
    }
    exports.handleProfileKeyCredential = handleProfileKeyCredential;
});