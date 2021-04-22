require(exports => {
    "use strict";

    Object.defineProperty(exports, "__esModule", { value: true });
    // tslint:disable-next-line max-line-length
    const DANGEROUS_FILE_TYPES = /\.(ADE|ADP|APK|BAT|CHM|CMD|COM|CPL|DLL|DMG|EXE|HTA|INS|ISP|JAR|JS|JSE|LIB|LNK|MDE|MSC|MSI|MSP|MST|NSH|PIF|SCR|SCT|SHB|SYS|VB|VBE|VBS|VXD|WSC|WSF|WSH|CAB)$/i;
    function isFileDangerous(fileName) {
        return DANGEROUS_FILE_TYPES.test(fileName);
    }
    exports.isFileDangerous = isFileDangerous;
});