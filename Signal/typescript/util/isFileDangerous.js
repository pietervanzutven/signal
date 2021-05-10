require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const DANGEROUS_FILE_TYPES = /\.(ADE|ADP|APK|BAT|CAB|CHM|CMD|COM|CPL|DIAGCAB|DLL|DMG|EXE|HTA|INF|INS|ISP|JAR|JS|JSE|LIB|LNK|MDE|MHT|MSC|MSI|MSP|MST|NSH|PIF|PS1|PSC1|PSM1|PSRC|REG|SCR|SCT|SETTINGCONTENT-MS|SHB|SYS|VB|VBE|VBS|VXD|WSC|WSF|WSH)\.?$/i;
    function isFileDangerous(fileName) {
        return DANGEROUS_FILE_TYPES.test(fileName);
    }
    exports.isFileDangerous = isFileDangerous;
});