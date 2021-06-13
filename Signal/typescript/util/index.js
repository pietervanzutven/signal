require(exports => {
    "use strict";
    // Copyright 2018-2021 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }));
    var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    });
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.zkgroup = exports.sleep = exports.Registration = exports.parseRemoteClientExpiration = exports.missingCaseError = exports.makeLookup = exports.isFileDangerous = exports.hasExpired = exports.GoogleChrome = exports.getUserAgent = exports.getTextWithMentions = exports.getStringForProfileChange = exports.getSafetyNumberPlaceholder = exports.generateSecurityNumber = exports.downloadAttachment = exports.deleteForEveryone = exports.createWaitBatcher = exports.createBatcher = exports.combineNames = exports.arrayBufferToObjectURL = void 0;
    const GoogleChrome = __importStar(require("./GoogleChrome"));
    exports.GoogleChrome = GoogleChrome;
    const Registration = __importStar(require("./registration"));
    exports.Registration = Registration;
    const arrayBufferToObjectURL_1 = require("./arrayBufferToObjectURL");
    Object.defineProperty(exports, "arrayBufferToObjectURL", { enumerable: true, get: function () { return arrayBufferToObjectURL_1.arrayBufferToObjectURL; } });
    const combineNames_1 = require("./combineNames");
    Object.defineProperty(exports, "combineNames", { enumerable: true, get: function () { return combineNames_1.combineNames; } });
    const batcher_1 = require("./batcher");
    Object.defineProperty(exports, "createBatcher", { enumerable: true, get: function () { return batcher_1.createBatcher; } });
    const waitBatcher_1 = require("./waitBatcher");
    Object.defineProperty(exports, "createWaitBatcher", { enumerable: true, get: function () { return waitBatcher_1.createWaitBatcher; } });
    const deleteForEveryone_1 = require("./deleteForEveryone");
    Object.defineProperty(exports, "deleteForEveryone", { enumerable: true, get: function () { return deleteForEveryone_1.deleteForEveryone; } });
    const downloadAttachment_1 = require("./downloadAttachment");
    Object.defineProperty(exports, "downloadAttachment", { enumerable: true, get: function () { return downloadAttachment_1.downloadAttachment; } });
    const safetyNumber_1 = require("./safetyNumber");
    Object.defineProperty(exports, "generateSecurityNumber", { enumerable: true, get: function () { return safetyNumber_1.generateSecurityNumber; } });
    Object.defineProperty(exports, "getSafetyNumberPlaceholder", { enumerable: true, get: function () { return safetyNumber_1.getPlaceholder; } });
    const getStringForProfileChange_1 = require("./getStringForProfileChange");
    Object.defineProperty(exports, "getStringForProfileChange", { enumerable: true, get: function () { return getStringForProfileChange_1.getStringForProfileChange; } });
    const getTextWithMentions_1 = require("./getTextWithMentions");
    Object.defineProperty(exports, "getTextWithMentions", { enumerable: true, get: function () { return getTextWithMentions_1.getTextWithMentions; } });
    const getUserAgent_1 = require("./getUserAgent");
    Object.defineProperty(exports, "getUserAgent", { enumerable: true, get: function () { return getUserAgent_1.getUserAgent; } });
    const hasExpired_1 = require("./hasExpired");
    Object.defineProperty(exports, "hasExpired", { enumerable: true, get: function () { return hasExpired_1.hasExpired; } });
    const isFileDangerous_1 = require("./isFileDangerous");
    Object.defineProperty(exports, "isFileDangerous", { enumerable: true, get: function () { return isFileDangerous_1.isFileDangerous; } });
    const makeLookup_1 = require("./makeLookup");
    Object.defineProperty(exports, "makeLookup", { enumerable: true, get: function () { return makeLookup_1.makeLookup; } });
    const missingCaseError_1 = require("./missingCaseError");
    Object.defineProperty(exports, "missingCaseError", { enumerable: true, get: function () { return missingCaseError_1.missingCaseError; } });
    const parseRemoteClientExpiration_1 = require("./parseRemoteClientExpiration");
    Object.defineProperty(exports, "parseRemoteClientExpiration", { enumerable: true, get: function () { return parseRemoteClientExpiration_1.parseRemoteClientExpiration; } });
    const sleep_1 = require("./sleep");
    Object.defineProperty(exports, "sleep", { enumerable: true, get: function () { return sleep_1.sleep; } });
    const zkgroup = __importStar(require("./zkgroup"));
    exports.zkgroup = zkgroup;
});