require(exports => {
    "use strict";
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const fs = __importStar(require("fs"));
    const OS_1 = require("../OS");
    const ZONE_IDENTIFIER_CONTENTS = Buffer.from('[ZoneTransfer]\r\nZoneId=3');
    /**
     * Internet Explorer introduced the concept of "Security Zones". For our purposes, we
     * just need to set the security zone to the "Internet" zone, which Windows will use to
     * offer some protections. This is customizable by the user (or, more likely, by IT).
     *
     * To do this, we write the "Zone.Identifier" for the NTFS alternative data stream.
     *
     * This can fail in a bunch of sitations:
     *
     * - The OS is not Windows.
     * - The filesystem is not NTFS.
     * - Writing the metadata file fails for some reason (permissions, for example).
     * - The metadata file already exists. (We could choose to overwrite it.)
     * - The original file is deleted between the time that we check for its existence and
     *   when we write the metadata. This is a rare race condition, but is possible.
     *
     * Consumers of this module should probably tolerate failures.
     */
    async function writeWindowsZoneIdentifier(filePath) {
        if (!OS_1.isWindows()) {
            throw new Error('writeWindowsZoneIdentifier should only run on Windows');
        }
        // tslint:disable-next-line non-literal-fs-path
        if (!fs.existsSync(filePath)) {
            throw new Error('writeWindowsZoneIdentifier could not find the original file');
        }
        await fs.promises.writeFile(`${filePath}:Zone.Identifier`, ZONE_IDENTIFIER_CONTENTS, {
            flag: 'wx',
        });
    }
    exports.writeWindowsZoneIdentifier = writeWindowsZoneIdentifier;
});