(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.textsecure = window.ts.textsecure || {};
    const exports = window.ts.textsecure.ContactsParser = {};

    /* eslint-disable @typescript-eslint/no-explicit-any */
    /* eslint-disable max-classes-per-file */
    Object.defineProperty(exports, "__esModule", { value: true });
    class ProtoParser {
        constructor(arrayBuffer, protobuf) {
            this.protobuf = protobuf;
            this.buffer = new window.dcodeIO.ByteBuffer();
            this.buffer.append(arrayBuffer);
            this.buffer.offset = 0;
            this.buffer.limit = arrayBuffer.byteLength;
        }
        next() {
            try {
                if (this.buffer.limit === this.buffer.offset) {
                    return undefined; // eof
                }
                const len = this.buffer.readVarint32();
                const nextBuffer = this.buffer
                    .slice(this.buffer.offset, this.buffer.offset + len)
                    .toArrayBuffer();
                const proto = this.protobuf.decode(nextBuffer);
                this.buffer.skip(len);
                if (proto.avatar) {
                    const attachmentLen = proto.avatar.length;
                    proto.avatar.data = this.buffer
                        .slice(this.buffer.offset, this.buffer.offset + attachmentLen)
                        .toArrayBuffer();
                    this.buffer.skip(attachmentLen);
                }
                if (proto.profileKey) {
                    proto.profileKey = proto.profileKey.toArrayBuffer();
                }
                if (proto.uuid) {
                    window.normalizeUuids(proto, ['uuid'], 'ProtoParser::next (proto.uuid)');
                }
                if (proto.members) {
                    window.normalizeUuids(proto, proto.members.map((_member, i) => `members.${i}.uuid`), 'ProtoParser::next (proto.members)');
                }
                return proto;
            }
            catch (error) {
                window.log.error('ProtoParser.next error:', error && error.stack ? error.stack : error);
            }
            return null;
        }
    }
    exports.ProtoParser = ProtoParser;
    class GroupBuffer extends ProtoParser {
        constructor(arrayBuffer) {
            super(arrayBuffer, window.textsecure.protobuf.GroupDetails);
        }
    }
    exports.GroupBuffer = GroupBuffer;
    class ContactBuffer extends ProtoParser {
        constructor(arrayBuffer) {
            super(arrayBuffer, window.textsecure.protobuf.ContactDetails);
        }
    }
    exports.ContactBuffer = ContactBuffer;
})();