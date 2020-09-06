(function () {
    /*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
    "use strict";

    window.ts = window.ts || {};

    var $protobuf = window.protobuf;

    // Common aliases
    var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

    // Exported root namespace
    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

    $root.SignalService = (function () {

        /**
         * Namespace signalservice.
         * @exports signalservice
         * @namespace
         */
        var signalservice = {};

        signalservice.ProvisioningUuid = (function () {

            /**
             * Properties of a ProvisioningUuid.
             * @memberof signalservice
             * @interface IProvisioningUuid
             * @property {string|null} [uuid] ProvisioningUuid uuid
             */

            /**
             * Constructs a new ProvisioningUuid.
             * @memberof signalservice
             * @classdesc Represents a ProvisioningUuid.
             * @implements IProvisioningUuid
             * @constructor
             * @param {signalservice.IProvisioningUuid=} [properties] Properties to set
             */
            function ProvisioningUuid(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ProvisioningUuid uuid.
             * @member {string} uuid
             * @memberof signalservice.ProvisioningUuid
             * @instance
             */
            ProvisioningUuid.prototype.uuid = "";

            /**
             * Creates a new ProvisioningUuid instance using the specified properties.
             * @function create
             * @memberof signalservice.ProvisioningUuid
             * @static
             * @param {signalservice.IProvisioningUuid=} [properties] Properties to set
             * @returns {signalservice.ProvisioningUuid} ProvisioningUuid instance
             */
            ProvisioningUuid.create = function create(properties) {
                return new ProvisioningUuid(properties);
            };

            /**
             * Encodes the specified ProvisioningUuid message. Does not implicitly {@link signalservice.ProvisioningUuid.verify|verify} messages.
             * @function encode
             * @memberof signalservice.ProvisioningUuid
             * @static
             * @param {signalservice.IProvisioningUuid} message ProvisioningUuid message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ProvisioningUuid.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.uuid != null && message.hasOwnProperty("uuid"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.uuid);
                return writer;
            };

            /**
             * Encodes the specified ProvisioningUuid message, length delimited. Does not implicitly {@link signalservice.ProvisioningUuid.verify|verify} messages.
             * @function encodeDelimited
             * @memberof signalservice.ProvisioningUuid
             * @static
             * @param {signalservice.IProvisioningUuid} message ProvisioningUuid message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ProvisioningUuid.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ProvisioningUuid message from the specified reader or buffer.
             * @function decode
             * @memberof signalservice.ProvisioningUuid
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {signalservice.ProvisioningUuid} ProvisioningUuid
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ProvisioningUuid.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.ProvisioningUuid();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            message.uuid = reader.string();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ProvisioningUuid message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof signalservice.ProvisioningUuid
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {signalservice.ProvisioningUuid} ProvisioningUuid
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ProvisioningUuid.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ProvisioningUuid message.
             * @function verify
             * @memberof signalservice.ProvisioningUuid
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ProvisioningUuid.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.uuid != null && message.hasOwnProperty("uuid"))
                    if (!$util.isString(message.uuid))
                        return "uuid: string expected";
                return null;
            };

            /**
             * Creates a ProvisioningUuid message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof signalservice.ProvisioningUuid
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {signalservice.ProvisioningUuid} ProvisioningUuid
             */
            ProvisioningUuid.fromObject = function fromObject(object) {
                if (object instanceof $root.signalservice.ProvisioningUuid)
                    return object;
                var message = new $root.signalservice.ProvisioningUuid();
                if (object.uuid != null)
                    message.uuid = String(object.uuid);
                return message;
            };

            /**
             * Creates a plain object from a ProvisioningUuid message. Also converts values to other types if specified.
             * @function toObject
             * @memberof signalservice.ProvisioningUuid
             * @static
             * @param {signalservice.ProvisioningUuid} message ProvisioningUuid
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ProvisioningUuid.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.uuid = "";
                if (message.uuid != null && message.hasOwnProperty("uuid"))
                    object.uuid = message.uuid;
                return object;
            };

            /**
             * Converts this ProvisioningUuid to JSON.
             * @function toJSON
             * @memberof signalservice.ProvisioningUuid
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ProvisioningUuid.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return ProvisioningUuid;
        })();

        signalservice.ProvisionEnvelope = (function () {

            /**
             * Properties of a ProvisionEnvelope.
             * @memberof signalservice
             * @interface IProvisionEnvelope
             * @property {Uint8Array|null} [publicKey] ProvisionEnvelope publicKey
             * @property {Uint8Array|null} [body] ProvisionEnvelope body
             */

            /**
             * Constructs a new ProvisionEnvelope.
             * @memberof signalservice
             * @classdesc Represents a ProvisionEnvelope.
             * @implements IProvisionEnvelope
             * @constructor
             * @param {signalservice.IProvisionEnvelope=} [properties] Properties to set
             */
            function ProvisionEnvelope(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ProvisionEnvelope publicKey.
             * @member {Uint8Array} publicKey
             * @memberof signalservice.ProvisionEnvelope
             * @instance
             */
            ProvisionEnvelope.prototype.publicKey = $util.newBuffer([]);

            /**
             * ProvisionEnvelope body.
             * @member {Uint8Array} body
             * @memberof signalservice.ProvisionEnvelope
             * @instance
             */
            ProvisionEnvelope.prototype.body = $util.newBuffer([]);

            /**
             * Creates a new ProvisionEnvelope instance using the specified properties.
             * @function create
             * @memberof signalservice.ProvisionEnvelope
             * @static
             * @param {signalservice.IProvisionEnvelope=} [properties] Properties to set
             * @returns {signalservice.ProvisionEnvelope} ProvisionEnvelope instance
             */
            ProvisionEnvelope.create = function create(properties) {
                return new ProvisionEnvelope(properties);
            };

            /**
             * Encodes the specified ProvisionEnvelope message. Does not implicitly {@link signalservice.ProvisionEnvelope.verify|verify} messages.
             * @function encode
             * @memberof signalservice.ProvisionEnvelope
             * @static
             * @param {signalservice.IProvisionEnvelope} message ProvisionEnvelope message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ProvisionEnvelope.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.publicKey);
                if (message.body != null && message.hasOwnProperty("body"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.body);
                return writer;
            };

            /**
             * Encodes the specified ProvisionEnvelope message, length delimited. Does not implicitly {@link signalservice.ProvisionEnvelope.verify|verify} messages.
             * @function encodeDelimited
             * @memberof signalservice.ProvisionEnvelope
             * @static
             * @param {signalservice.IProvisionEnvelope} message ProvisionEnvelope message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ProvisionEnvelope.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ProvisionEnvelope message from the specified reader or buffer.
             * @function decode
             * @memberof signalservice.ProvisionEnvelope
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {signalservice.ProvisionEnvelope} ProvisionEnvelope
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ProvisionEnvelope.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.ProvisionEnvelope();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            message.publicKey = reader.bytes();
                            break;
                        case 2:
                            message.body = reader.bytes();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ProvisionEnvelope message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof signalservice.ProvisionEnvelope
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {signalservice.ProvisionEnvelope} ProvisionEnvelope
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ProvisionEnvelope.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ProvisionEnvelope message.
             * @function verify
             * @memberof signalservice.ProvisionEnvelope
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ProvisionEnvelope.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                    if (!(message.publicKey && typeof message.publicKey.length === "number" || $util.isString(message.publicKey)))
                        return "publicKey: buffer expected";
                if (message.body != null && message.hasOwnProperty("body"))
                    if (!(message.body && typeof message.body.length === "number" || $util.isString(message.body)))
                        return "body: buffer expected";
                return null;
            };

            /**
             * Creates a ProvisionEnvelope message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof signalservice.ProvisionEnvelope
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {signalservice.ProvisionEnvelope} ProvisionEnvelope
             */
            ProvisionEnvelope.fromObject = function fromObject(object) {
                if (object instanceof $root.signalservice.ProvisionEnvelope)
                    return object;
                var message = new $root.signalservice.ProvisionEnvelope();
                if (object.publicKey != null)
                    if (typeof object.publicKey === "string")
                        $util.base64.decode(object.publicKey, message.publicKey = $util.newBuffer($util.base64.length(object.publicKey)), 0);
                    else if (object.publicKey.length)
                        message.publicKey = object.publicKey;
                if (object.body != null)
                    if (typeof object.body === "string")
                        $util.base64.decode(object.body, message.body = $util.newBuffer($util.base64.length(object.body)), 0);
                    else if (object.body.length)
                        message.body = object.body;
                return message;
            };

            /**
             * Creates a plain object from a ProvisionEnvelope message. Also converts values to other types if specified.
             * @function toObject
             * @memberof signalservice.ProvisionEnvelope
             * @static
             * @param {signalservice.ProvisionEnvelope} message ProvisionEnvelope
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ProvisionEnvelope.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.publicKey = options.bytes === String ? "" : [];
                    object.body = options.bytes === String ? "" : [];
                }
                if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                    object.publicKey = options.bytes === String ? $util.base64.encode(message.publicKey, 0, message.publicKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.publicKey) : message.publicKey;
                if (message.body != null && message.hasOwnProperty("body"))
                    object.body = options.bytes === String ? $util.base64.encode(message.body, 0, message.body.length) : options.bytes === Array ? Array.prototype.slice.call(message.body) : message.body;
                return object;
            };

            /**
             * Converts this ProvisionEnvelope to JSON.
             * @function toJSON
             * @memberof signalservice.ProvisionEnvelope
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ProvisionEnvelope.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return ProvisionEnvelope;
        })();

        signalservice.ProvisionMessage = (function () {

            /**
             * Properties of a ProvisionMessage.
             * @memberof signalservice
             * @interface IProvisionMessage
             * @property {Uint8Array|null} [identityKeyPrivate] ProvisionMessage identityKeyPrivate
             * @property {string|null} [number] ProvisionMessage number
             * @property {string|null} [provisioningCode] ProvisionMessage provisioningCode
             * @property {string|null} [userAgent] ProvisionMessage userAgent
             * @property {Uint8Array|null} [profileKey] ProvisionMessage profileKey
             * @property {boolean|null} [readReceipts] ProvisionMessage readReceipts
             */

            /**
             * Constructs a new ProvisionMessage.
             * @memberof signalservice
             * @classdesc Represents a ProvisionMessage.
             * @implements IProvisionMessage
             * @constructor
             * @param {signalservice.IProvisionMessage=} [properties] Properties to set
             */
            function ProvisionMessage(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ProvisionMessage identityKeyPrivate.
             * @member {Uint8Array} identityKeyPrivate
             * @memberof signalservice.ProvisionMessage
             * @instance
             */
            ProvisionMessage.prototype.identityKeyPrivate = $util.newBuffer([]);

            /**
             * ProvisionMessage number.
             * @member {string} number
             * @memberof signalservice.ProvisionMessage
             * @instance
             */
            ProvisionMessage.prototype.number = "";

            /**
             * ProvisionMessage provisioningCode.
             * @member {string} provisioningCode
             * @memberof signalservice.ProvisionMessage
             * @instance
             */
            ProvisionMessage.prototype.provisioningCode = "";

            /**
             * ProvisionMessage userAgent.
             * @member {string} userAgent
             * @memberof signalservice.ProvisionMessage
             * @instance
             */
            ProvisionMessage.prototype.userAgent = "";

            /**
             * ProvisionMessage profileKey.
             * @member {Uint8Array} profileKey
             * @memberof signalservice.ProvisionMessage
             * @instance
             */
            ProvisionMessage.prototype.profileKey = $util.newBuffer([]);

            /**
             * ProvisionMessage readReceipts.
             * @member {boolean} readReceipts
             * @memberof signalservice.ProvisionMessage
             * @instance
             */
            ProvisionMessage.prototype.readReceipts = false;

            /**
             * Creates a new ProvisionMessage instance using the specified properties.
             * @function create
             * @memberof signalservice.ProvisionMessage
             * @static
             * @param {signalservice.IProvisionMessage=} [properties] Properties to set
             * @returns {signalservice.ProvisionMessage} ProvisionMessage instance
             */
            ProvisionMessage.create = function create(properties) {
                return new ProvisionMessage(properties);
            };

            /**
             * Encodes the specified ProvisionMessage message. Does not implicitly {@link signalservice.ProvisionMessage.verify|verify} messages.
             * @function encode
             * @memberof signalservice.ProvisionMessage
             * @static
             * @param {signalservice.IProvisionMessage} message ProvisionMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ProvisionMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.identityKeyPrivate != null && message.hasOwnProperty("identityKeyPrivate"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.identityKeyPrivate);
                if (message.number != null && message.hasOwnProperty("number"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.number);
                if (message.provisioningCode != null && message.hasOwnProperty("provisioningCode"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.provisioningCode);
                if (message.userAgent != null && message.hasOwnProperty("userAgent"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.userAgent);
                if (message.profileKey != null && message.hasOwnProperty("profileKey"))
                    writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.profileKey);
                if (message.readReceipts != null && message.hasOwnProperty("readReceipts"))
                    writer.uint32(/* id 7, wireType 0 =*/56).bool(message.readReceipts);
                return writer;
            };

            /**
             * Encodes the specified ProvisionMessage message, length delimited. Does not implicitly {@link signalservice.ProvisionMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof signalservice.ProvisionMessage
             * @static
             * @param {signalservice.IProvisionMessage} message ProvisionMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ProvisionMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ProvisionMessage message from the specified reader or buffer.
             * @function decode
             * @memberof signalservice.ProvisionMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {signalservice.ProvisionMessage} ProvisionMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ProvisionMessage.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.ProvisionMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 2:
                            message.identityKeyPrivate = reader.bytes();
                            break;
                        case 3:
                            message.number = reader.string();
                            break;
                        case 4:
                            message.provisioningCode = reader.string();
                            break;
                        case 5:
                            message.userAgent = reader.string();
                            break;
                        case 6:
                            message.profileKey = reader.bytes();
                            break;
                        case 7:
                            message.readReceipts = reader.bool();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ProvisionMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof signalservice.ProvisionMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {signalservice.ProvisionMessage} ProvisionMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ProvisionMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ProvisionMessage message.
             * @function verify
             * @memberof signalservice.ProvisionMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ProvisionMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.identityKeyPrivate != null && message.hasOwnProperty("identityKeyPrivate"))
                    if (!(message.identityKeyPrivate && typeof message.identityKeyPrivate.length === "number" || $util.isString(message.identityKeyPrivate)))
                        return "identityKeyPrivate: buffer expected";
                if (message.number != null && message.hasOwnProperty("number"))
                    if (!$util.isString(message.number))
                        return "number: string expected";
                if (message.provisioningCode != null && message.hasOwnProperty("provisioningCode"))
                    if (!$util.isString(message.provisioningCode))
                        return "provisioningCode: string expected";
                if (message.userAgent != null && message.hasOwnProperty("userAgent"))
                    if (!$util.isString(message.userAgent))
                        return "userAgent: string expected";
                if (message.profileKey != null && message.hasOwnProperty("profileKey"))
                    if (!(message.profileKey && typeof message.profileKey.length === "number" || $util.isString(message.profileKey)))
                        return "profileKey: buffer expected";
                if (message.readReceipts != null && message.hasOwnProperty("readReceipts"))
                    if (typeof message.readReceipts !== "boolean")
                        return "readReceipts: boolean expected";
                return null;
            };

            /**
             * Creates a ProvisionMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof signalservice.ProvisionMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {signalservice.ProvisionMessage} ProvisionMessage
             */
            ProvisionMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.signalservice.ProvisionMessage)
                    return object;
                var message = new $root.signalservice.ProvisionMessage();
                if (object.identityKeyPrivate != null)
                    if (typeof object.identityKeyPrivate === "string")
                        $util.base64.decode(object.identityKeyPrivate, message.identityKeyPrivate = $util.newBuffer($util.base64.length(object.identityKeyPrivate)), 0);
                    else if (object.identityKeyPrivate.length)
                        message.identityKeyPrivate = object.identityKeyPrivate;
                if (object.number != null)
                    message.number = String(object.number);
                if (object.provisioningCode != null)
                    message.provisioningCode = String(object.provisioningCode);
                if (object.userAgent != null)
                    message.userAgent = String(object.userAgent);
                if (object.profileKey != null)
                    if (typeof object.profileKey === "string")
                        $util.base64.decode(object.profileKey, message.profileKey = $util.newBuffer($util.base64.length(object.profileKey)), 0);
                    else if (object.profileKey.length)
                        message.profileKey = object.profileKey;
                if (object.readReceipts != null)
                    message.readReceipts = Boolean(object.readReceipts);
                return message;
            };

            /**
             * Creates a plain object from a ProvisionMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof signalservice.ProvisionMessage
             * @static
             * @param {signalservice.ProvisionMessage} message ProvisionMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ProvisionMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.identityKeyPrivate = options.bytes === String ? "" : [];
                    object.number = "";
                    object.provisioningCode = "";
                    object.userAgent = "";
                    object.profileKey = options.bytes === String ? "" : [];
                    object.readReceipts = false;
                }
                if (message.identityKeyPrivate != null && message.hasOwnProperty("identityKeyPrivate"))
                    object.identityKeyPrivate = options.bytes === String ? $util.base64.encode(message.identityKeyPrivate, 0, message.identityKeyPrivate.length) : options.bytes === Array ? Array.prototype.slice.call(message.identityKeyPrivate) : message.identityKeyPrivate;
                if (message.number != null && message.hasOwnProperty("number"))
                    object.number = message.number;
                if (message.provisioningCode != null && message.hasOwnProperty("provisioningCode"))
                    object.provisioningCode = message.provisioningCode;
                if (message.userAgent != null && message.hasOwnProperty("userAgent"))
                    object.userAgent = message.userAgent;
                if (message.profileKey != null && message.hasOwnProperty("profileKey"))
                    object.profileKey = options.bytes === String ? $util.base64.encode(message.profileKey, 0, message.profileKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.profileKey) : message.profileKey;
                if (message.readReceipts != null && message.hasOwnProperty("readReceipts"))
                    object.readReceipts = message.readReceipts;
                return object;
            };

            /**
             * Converts this ProvisionMessage to JSON.
             * @function toJSON
             * @memberof signalservice.ProvisionMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ProvisionMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return ProvisionMessage;
        })();

        signalservice.Envelope = (function () {

            /**
             * Properties of an Envelope.
             * @memberof signalservice
             * @interface IEnvelope
             * @property {signalservice.Envelope.Type|null} [type] Envelope type
             * @property {string|null} [source] Envelope source
             * @property {number|null} [sourceDevice] Envelope sourceDevice
             * @property {string|null} [relay] Envelope relay
             * @property {number|Long|null} [timestamp] Envelope timestamp
             * @property {Uint8Array|null} [legacyMessage] Envelope legacyMessage
             * @property {Uint8Array|null} [content] Envelope content
             */

            /**
             * Constructs a new Envelope.
             * @memberof signalservice
             * @classdesc Represents an Envelope.
             * @implements IEnvelope
             * @constructor
             * @param {signalservice.IEnvelope=} [properties] Properties to set
             */
            function Envelope(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Envelope type.
             * @member {signalservice.Envelope.Type} type
             * @memberof signalservice.Envelope
             * @instance
             */
            Envelope.prototype.type = 0;

            /**
             * Envelope source.
             * @member {string} source
             * @memberof signalservice.Envelope
             * @instance
             */
            Envelope.prototype.source = "";

            /**
             * Envelope sourceDevice.
             * @member {number} sourceDevice
             * @memberof signalservice.Envelope
             * @instance
             */
            Envelope.prototype.sourceDevice = 0;

            /**
             * Envelope relay.
             * @member {string} relay
             * @memberof signalservice.Envelope
             * @instance
             */
            Envelope.prototype.relay = "";

            /**
             * Envelope timestamp.
             * @member {number|Long} timestamp
             * @memberof signalservice.Envelope
             * @instance
             */
            Envelope.prototype.timestamp = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;

            /**
             * Envelope legacyMessage.
             * @member {Uint8Array} legacyMessage
             * @memberof signalservice.Envelope
             * @instance
             */
            Envelope.prototype.legacyMessage = $util.newBuffer([]);

            /**
             * Envelope content.
             * @member {Uint8Array} content
             * @memberof signalservice.Envelope
             * @instance
             */
            Envelope.prototype.content = $util.newBuffer([]);

            /**
             * Creates a new Envelope instance using the specified properties.
             * @function create
             * @memberof signalservice.Envelope
             * @static
             * @param {signalservice.IEnvelope=} [properties] Properties to set
             * @returns {signalservice.Envelope} Envelope instance
             */
            Envelope.create = function create(properties) {
                return new Envelope(properties);
            };

            /**
             * Encodes the specified Envelope message. Does not implicitly {@link signalservice.Envelope.verify|verify} messages.
             * @function encode
             * @memberof signalservice.Envelope
             * @static
             * @param {signalservice.IEnvelope} message Envelope message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Envelope.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.type != null && message.hasOwnProperty("type"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
                if (message.source != null && message.hasOwnProperty("source"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.source);
                if (message.relay != null && message.hasOwnProperty("relay"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.relay);
                if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                    writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.timestamp);
                if (message.legacyMessage != null && message.hasOwnProperty("legacyMessage"))
                    writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.legacyMessage);
                if (message.sourceDevice != null && message.hasOwnProperty("sourceDevice"))
                    writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.sourceDevice);
                if (message.content != null && message.hasOwnProperty("content"))
                    writer.uint32(/* id 8, wireType 2 =*/66).bytes(message.content);
                return writer;
            };

            /**
             * Encodes the specified Envelope message, length delimited. Does not implicitly {@link signalservice.Envelope.verify|verify} messages.
             * @function encodeDelimited
             * @memberof signalservice.Envelope
             * @static
             * @param {signalservice.IEnvelope} message Envelope message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Envelope.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Envelope message from the specified reader or buffer.
             * @function decode
             * @memberof signalservice.Envelope
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {signalservice.Envelope} Envelope
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Envelope.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.Envelope();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            message.type = reader.int32();
                            break;
                        case 2:
                            message.source = reader.string();
                            break;
                        case 7:
                            message.sourceDevice = reader.uint32();
                            break;
                        case 3:
                            message.relay = reader.string();
                            break;
                        case 5:
                            message.timestamp = reader.uint64();
                            break;
                        case 6:
                            message.legacyMessage = reader.bytes();
                            break;
                        case 8:
                            message.content = reader.bytes();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Envelope message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof signalservice.Envelope
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {signalservice.Envelope} Envelope
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Envelope.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Envelope message.
             * @function verify
             * @memberof signalservice.Envelope
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Envelope.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    switch (message.type) {
                        default:
                            return "type: enum value expected";
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                        case 5:
                            break;
                    }
                if (message.source != null && message.hasOwnProperty("source"))
                    if (!$util.isString(message.source))
                        return "source: string expected";
                if (message.sourceDevice != null && message.hasOwnProperty("sourceDevice"))
                    if (!$util.isInteger(message.sourceDevice))
                        return "sourceDevice: integer expected";
                if (message.relay != null && message.hasOwnProperty("relay"))
                    if (!$util.isString(message.relay))
                        return "relay: string expected";
                if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                    if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                        return "timestamp: integer|Long expected";
                if (message.legacyMessage != null && message.hasOwnProperty("legacyMessage"))
                    if (!(message.legacyMessage && typeof message.legacyMessage.length === "number" || $util.isString(message.legacyMessage)))
                        return "legacyMessage: buffer expected";
                if (message.content != null && message.hasOwnProperty("content"))
                    if (!(message.content && typeof message.content.length === "number" || $util.isString(message.content)))
                        return "content: buffer expected";
                return null;
            };

            /**
             * Creates an Envelope message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof signalservice.Envelope
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {signalservice.Envelope} Envelope
             */
            Envelope.fromObject = function fromObject(object) {
                if (object instanceof $root.signalservice.Envelope)
                    return object;
                var message = new $root.signalservice.Envelope();
                switch (object.type) {
                    case "UNKNOWN":
                    case 0:
                        message.type = 0;
                        break;
                    case "CIPHERTEXT":
                    case 1:
                        message.type = 1;
                        break;
                    case "KEY_EXCHANGE":
                    case 2:
                        message.type = 2;
                        break;
                    case "PREKEY_BUNDLE":
                    case 3:
                        message.type = 3;
                        break;
                    case "RECEIPT":
                    case 5:
                        message.type = 5;
                        break;
                }
                if (object.source != null)
                    message.source = String(object.source);
                if (object.sourceDevice != null)
                    message.sourceDevice = object.sourceDevice >>> 0;
                if (object.relay != null)
                    message.relay = String(object.relay);
                if (object.timestamp != null)
                    if ($util.Long)
                        (message.timestamp = $util.Long.fromValue(object.timestamp)).unsigned = true;
                    else if (typeof object.timestamp === "string")
                        message.timestamp = parseInt(object.timestamp, 10);
                    else if (typeof object.timestamp === "number")
                        message.timestamp = object.timestamp;
                    else if (typeof object.timestamp === "object")
                        message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber(true);
                if (object.legacyMessage != null)
                    if (typeof object.legacyMessage === "string")
                        $util.base64.decode(object.legacyMessage, message.legacyMessage = $util.newBuffer($util.base64.length(object.legacyMessage)), 0);
                    else if (object.legacyMessage.length)
                        message.legacyMessage = object.legacyMessage;
                if (object.content != null)
                    if (typeof object.content === "string")
                        $util.base64.decode(object.content, message.content = $util.newBuffer($util.base64.length(object.content)), 0);
                    else if (object.content.length)
                        message.content = object.content;
                return message;
            };

            /**
             * Creates a plain object from an Envelope message. Also converts values to other types if specified.
             * @function toObject
             * @memberof signalservice.Envelope
             * @static
             * @param {signalservice.Envelope} message Envelope
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Envelope.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.type = options.enums === String ? "UNKNOWN" : 0;
                    object.source = "";
                    object.relay = "";
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestamp = options.longs === String ? "0" : 0;
                    object.legacyMessage = options.bytes === String ? "" : [];
                    object.sourceDevice = 0;
                    object.content = options.bytes === String ? "" : [];
                }
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.signalservice.Envelope.Type[message.type] : message.type;
                if (message.source != null && message.hasOwnProperty("source"))
                    object.source = message.source;
                if (message.relay != null && message.hasOwnProperty("relay"))
                    object.relay = message.relay;
                if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                    if (typeof message.timestamp === "number")
                        object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                    else
                        object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber(true) : message.timestamp;
                if (message.legacyMessage != null && message.hasOwnProperty("legacyMessage"))
                    object.legacyMessage = options.bytes === String ? $util.base64.encode(message.legacyMessage, 0, message.legacyMessage.length) : options.bytes === Array ? Array.prototype.slice.call(message.legacyMessage) : message.legacyMessage;
                if (message.sourceDevice != null && message.hasOwnProperty("sourceDevice"))
                    object.sourceDevice = message.sourceDevice;
                if (message.content != null && message.hasOwnProperty("content"))
                    object.content = options.bytes === String ? $util.base64.encode(message.content, 0, message.content.length) : options.bytes === Array ? Array.prototype.slice.call(message.content) : message.content;
                return object;
            };

            /**
             * Converts this Envelope to JSON.
             * @function toJSON
             * @memberof signalservice.Envelope
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Envelope.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Type enum.
             * @name signalservice.Envelope.Type
             * @enum {string}
             * @property {number} UNKNOWN=0 UNKNOWN value
             * @property {number} CIPHERTEXT=1 CIPHERTEXT value
             * @property {number} KEY_EXCHANGE=2 KEY_EXCHANGE value
             * @property {number} PREKEY_BUNDLE=3 PREKEY_BUNDLE value
             * @property {number} RECEIPT=5 RECEIPT value
             */
            Envelope.Type = (function () {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "UNKNOWN"] = 0;
                values[valuesById[1] = "CIPHERTEXT"] = 1;
                values[valuesById[2] = "KEY_EXCHANGE"] = 2;
                values[valuesById[3] = "PREKEY_BUNDLE"] = 3;
                values[valuesById[5] = "RECEIPT"] = 5;
                return values;
            })();

            return Envelope;
        })();

        signalservice.Content = (function () {

            /**
             * Properties of a Content.
             * @memberof signalservice
             * @interface IContent
             * @property {signalservice.IDataMessage|null} [dataMessage] Content dataMessage
             * @property {signalservice.ISyncMessage|null} [syncMessage] Content syncMessage
             * @property {signalservice.ICallMessage|null} [callMessage] Content callMessage
             * @property {signalservice.INullMessage|null} [nullMessage] Content nullMessage
             * @property {signalservice.IReceiptMessage|null} [receiptMessage] Content receiptMessage
             */

            /**
             * Constructs a new Content.
             * @memberof signalservice
             * @classdesc Represents a Content.
             * @implements IContent
             * @constructor
             * @param {signalservice.IContent=} [properties] Properties to set
             */
            function Content(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Content dataMessage.
             * @member {signalservice.IDataMessage|null|undefined} dataMessage
             * @memberof signalservice.Content
             * @instance
             */
            Content.prototype.dataMessage = null;

            /**
             * Content syncMessage.
             * @member {signalservice.ISyncMessage|null|undefined} syncMessage
             * @memberof signalservice.Content
             * @instance
             */
            Content.prototype.syncMessage = null;

            /**
             * Content callMessage.
             * @member {signalservice.ICallMessage|null|undefined} callMessage
             * @memberof signalservice.Content
             * @instance
             */
            Content.prototype.callMessage = null;

            /**
             * Content nullMessage.
             * @member {signalservice.INullMessage|null|undefined} nullMessage
             * @memberof signalservice.Content
             * @instance
             */
            Content.prototype.nullMessage = null;

            /**
             * Content receiptMessage.
             * @member {signalservice.IReceiptMessage|null|undefined} receiptMessage
             * @memberof signalservice.Content
             * @instance
             */
            Content.prototype.receiptMessage = null;

            /**
             * Creates a new Content instance using the specified properties.
             * @function create
             * @memberof signalservice.Content
             * @static
             * @param {signalservice.IContent=} [properties] Properties to set
             * @returns {signalservice.Content} Content instance
             */
            Content.create = function create(properties) {
                return new Content(properties);
            };

            /**
             * Encodes the specified Content message. Does not implicitly {@link signalservice.Content.verify|verify} messages.
             * @function encode
             * @memberof signalservice.Content
             * @static
             * @param {signalservice.IContent} message Content message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Content.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.dataMessage != null && message.hasOwnProperty("dataMessage"))
                    $root.signalservice.DataMessage.encode(message.dataMessage, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.syncMessage != null && message.hasOwnProperty("syncMessage"))
                    $root.signalservice.SyncMessage.encode(message.syncMessage, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.callMessage != null && message.hasOwnProperty("callMessage"))
                    $root.signalservice.CallMessage.encode(message.callMessage, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.nullMessage != null && message.hasOwnProperty("nullMessage"))
                    $root.signalservice.NullMessage.encode(message.nullMessage, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.receiptMessage != null && message.hasOwnProperty("receiptMessage"))
                    $root.signalservice.ReceiptMessage.encode(message.receiptMessage, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Content message, length delimited. Does not implicitly {@link signalservice.Content.verify|verify} messages.
             * @function encodeDelimited
             * @memberof signalservice.Content
             * @static
             * @param {signalservice.IContent} message Content message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Content.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Content message from the specified reader or buffer.
             * @function decode
             * @memberof signalservice.Content
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {signalservice.Content} Content
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Content.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.Content();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            message.dataMessage = $root.signalservice.DataMessage.decode(reader, reader.uint32());
                            break;
                        case 2:
                            message.syncMessage = $root.signalservice.SyncMessage.decode(reader, reader.uint32());
                            break;
                        case 3:
                            message.callMessage = $root.signalservice.CallMessage.decode(reader, reader.uint32());
                            break;
                        case 4:
                            message.nullMessage = $root.signalservice.NullMessage.decode(reader, reader.uint32());
                            break;
                        case 5:
                            message.receiptMessage = $root.signalservice.ReceiptMessage.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Content message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof signalservice.Content
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {signalservice.Content} Content
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Content.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Content message.
             * @function verify
             * @memberof signalservice.Content
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Content.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.dataMessage != null && message.hasOwnProperty("dataMessage")) {
                    var error = $root.signalservice.DataMessage.verify(message.dataMessage);
                    if (error)
                        return "dataMessage." + error;
                }
                if (message.syncMessage != null && message.hasOwnProperty("syncMessage")) {
                    var error = $root.signalservice.SyncMessage.verify(message.syncMessage);
                    if (error)
                        return "syncMessage." + error;
                }
                if (message.callMessage != null && message.hasOwnProperty("callMessage")) {
                    var error = $root.signalservice.CallMessage.verify(message.callMessage);
                    if (error)
                        return "callMessage." + error;
                }
                if (message.nullMessage != null && message.hasOwnProperty("nullMessage")) {
                    var error = $root.signalservice.NullMessage.verify(message.nullMessage);
                    if (error)
                        return "nullMessage." + error;
                }
                if (message.receiptMessage != null && message.hasOwnProperty("receiptMessage")) {
                    var error = $root.signalservice.ReceiptMessage.verify(message.receiptMessage);
                    if (error)
                        return "receiptMessage." + error;
                }
                return null;
            };

            /**
             * Creates a Content message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof signalservice.Content
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {signalservice.Content} Content
             */
            Content.fromObject = function fromObject(object) {
                if (object instanceof $root.signalservice.Content)
                    return object;
                var message = new $root.signalservice.Content();
                if (object.dataMessage != null) {
                    if (typeof object.dataMessage !== "object")
                        throw TypeError(".signalservice.Content.dataMessage: object expected");
                    message.dataMessage = $root.signalservice.DataMessage.fromObject(object.dataMessage);
                }
                if (object.syncMessage != null) {
                    if (typeof object.syncMessage !== "object")
                        throw TypeError(".signalservice.Content.syncMessage: object expected");
                    message.syncMessage = $root.signalservice.SyncMessage.fromObject(object.syncMessage);
                }
                if (object.callMessage != null) {
                    if (typeof object.callMessage !== "object")
                        throw TypeError(".signalservice.Content.callMessage: object expected");
                    message.callMessage = $root.signalservice.CallMessage.fromObject(object.callMessage);
                }
                if (object.nullMessage != null) {
                    if (typeof object.nullMessage !== "object")
                        throw TypeError(".signalservice.Content.nullMessage: object expected");
                    message.nullMessage = $root.signalservice.NullMessage.fromObject(object.nullMessage);
                }
                if (object.receiptMessage != null) {
                    if (typeof object.receiptMessage !== "object")
                        throw TypeError(".signalservice.Content.receiptMessage: object expected");
                    message.receiptMessage = $root.signalservice.ReceiptMessage.fromObject(object.receiptMessage);
                }
                return message;
            };

            /**
             * Creates a plain object from a Content message. Also converts values to other types if specified.
             * @function toObject
             * @memberof signalservice.Content
             * @static
             * @param {signalservice.Content} message Content
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Content.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.dataMessage = null;
                    object.syncMessage = null;
                    object.callMessage = null;
                    object.nullMessage = null;
                    object.receiptMessage = null;
                }
                if (message.dataMessage != null && message.hasOwnProperty("dataMessage"))
                    object.dataMessage = $root.signalservice.DataMessage.toObject(message.dataMessage, options);
                if (message.syncMessage != null && message.hasOwnProperty("syncMessage"))
                    object.syncMessage = $root.signalservice.SyncMessage.toObject(message.syncMessage, options);
                if (message.callMessage != null && message.hasOwnProperty("callMessage"))
                    object.callMessage = $root.signalservice.CallMessage.toObject(message.callMessage, options);
                if (message.nullMessage != null && message.hasOwnProperty("nullMessage"))
                    object.nullMessage = $root.signalservice.NullMessage.toObject(message.nullMessage, options);
                if (message.receiptMessage != null && message.hasOwnProperty("receiptMessage"))
                    object.receiptMessage = $root.signalservice.ReceiptMessage.toObject(message.receiptMessage, options);
                return object;
            };

            /**
             * Converts this Content to JSON.
             * @function toJSON
             * @memberof signalservice.Content
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Content.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Content;
        })();

        signalservice.CallMessage = (function () {

            /**
             * Properties of a CallMessage.
             * @memberof signalservice
             * @interface ICallMessage
             * @property {signalservice.CallMessage.IOffer|null} [offer] CallMessage offer
             * @property {signalservice.CallMessage.IAnswer|null} [answer] CallMessage answer
             * @property {Array.<signalservice.CallMessage.IIceUpdate>|null} [iceUpdate] CallMessage iceUpdate
             * @property {signalservice.CallMessage.IHangup|null} [hangup] CallMessage hangup
             * @property {signalservice.CallMessage.IBusy|null} [busy] CallMessage busy
             */

            /**
             * Constructs a new CallMessage.
             * @memberof signalservice
             * @classdesc Represents a CallMessage.
             * @implements ICallMessage
             * @constructor
             * @param {signalservice.ICallMessage=} [properties] Properties to set
             */
            function CallMessage(properties) {
                this.iceUpdate = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CallMessage offer.
             * @member {signalservice.CallMessage.IOffer|null|undefined} offer
             * @memberof signalservice.CallMessage
             * @instance
             */
            CallMessage.prototype.offer = null;

            /**
             * CallMessage answer.
             * @member {signalservice.CallMessage.IAnswer|null|undefined} answer
             * @memberof signalservice.CallMessage
             * @instance
             */
            CallMessage.prototype.answer = null;

            /**
             * CallMessage iceUpdate.
             * @member {Array.<signalservice.CallMessage.IIceUpdate>} iceUpdate
             * @memberof signalservice.CallMessage
             * @instance
             */
            CallMessage.prototype.iceUpdate = $util.emptyArray;

            /**
             * CallMessage hangup.
             * @member {signalservice.CallMessage.IHangup|null|undefined} hangup
             * @memberof signalservice.CallMessage
             * @instance
             */
            CallMessage.prototype.hangup = null;

            /**
             * CallMessage busy.
             * @member {signalservice.CallMessage.IBusy|null|undefined} busy
             * @memberof signalservice.CallMessage
             * @instance
             */
            CallMessage.prototype.busy = null;

            /**
             * Creates a new CallMessage instance using the specified properties.
             * @function create
             * @memberof signalservice.CallMessage
             * @static
             * @param {signalservice.ICallMessage=} [properties] Properties to set
             * @returns {signalservice.CallMessage} CallMessage instance
             */
            CallMessage.create = function create(properties) {
                return new CallMessage(properties);
            };

            /**
             * Encodes the specified CallMessage message. Does not implicitly {@link signalservice.CallMessage.verify|verify} messages.
             * @function encode
             * @memberof signalservice.CallMessage
             * @static
             * @param {signalservice.ICallMessage} message CallMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CallMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.offer != null && message.hasOwnProperty("offer"))
                    $root.signalservice.CallMessage.Offer.encode(message.offer, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.answer != null && message.hasOwnProperty("answer"))
                    $root.signalservice.CallMessage.Answer.encode(message.answer, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.iceUpdate != null && message.iceUpdate.length)
                    for (var i = 0; i < message.iceUpdate.length; ++i)
                        $root.signalservice.CallMessage.IceUpdate.encode(message.iceUpdate[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.hangup != null && message.hasOwnProperty("hangup"))
                    $root.signalservice.CallMessage.Hangup.encode(message.hangup, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.busy != null && message.hasOwnProperty("busy"))
                    $root.signalservice.CallMessage.Busy.encode(message.busy, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified CallMessage message, length delimited. Does not implicitly {@link signalservice.CallMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof signalservice.CallMessage
             * @static
             * @param {signalservice.ICallMessage} message CallMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CallMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CallMessage message from the specified reader or buffer.
             * @function decode
             * @memberof signalservice.CallMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {signalservice.CallMessage} CallMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CallMessage.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.CallMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            message.offer = $root.signalservice.CallMessage.Offer.decode(reader, reader.uint32());
                            break;
                        case 2:
                            message.answer = $root.signalservice.CallMessage.Answer.decode(reader, reader.uint32());
                            break;
                        case 3:
                            if (!(message.iceUpdate && message.iceUpdate.length))
                                message.iceUpdate = [];
                            message.iceUpdate.push($root.signalservice.CallMessage.IceUpdate.decode(reader, reader.uint32()));
                            break;
                        case 4:
                            message.hangup = $root.signalservice.CallMessage.Hangup.decode(reader, reader.uint32());
                            break;
                        case 5:
                            message.busy = $root.signalservice.CallMessage.Busy.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return message;
            };

            /**
             * Decodes a CallMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof signalservice.CallMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {signalservice.CallMessage} CallMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CallMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CallMessage message.
             * @function verify
             * @memberof signalservice.CallMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CallMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.offer != null && message.hasOwnProperty("offer")) {
                    var error = $root.signalservice.CallMessage.Offer.verify(message.offer);
                    if (error)
                        return "offer." + error;
                }
                if (message.answer != null && message.hasOwnProperty("answer")) {
                    var error = $root.signalservice.CallMessage.Answer.verify(message.answer);
                    if (error)
                        return "answer." + error;
                }
                if (message.iceUpdate != null && message.hasOwnProperty("iceUpdate")) {
                    if (!Array.isArray(message.iceUpdate))
                        return "iceUpdate: array expected";
                    for (var i = 0; i < message.iceUpdate.length; ++i) {
                        var error = $root.signalservice.CallMessage.IceUpdate.verify(message.iceUpdate[i]);
                        if (error)
                            return "iceUpdate." + error;
                    }
                }
                if (message.hangup != null && message.hasOwnProperty("hangup")) {
                    var error = $root.signalservice.CallMessage.Hangup.verify(message.hangup);
                    if (error)
                        return "hangup." + error;
                }
                if (message.busy != null && message.hasOwnProperty("busy")) {
                    var error = $root.signalservice.CallMessage.Busy.verify(message.busy);
                    if (error)
                        return "busy." + error;
                }
                return null;
            };

            /**
             * Creates a CallMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof signalservice.CallMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {signalservice.CallMessage} CallMessage
             */
            CallMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.signalservice.CallMessage)
                    return object;
                var message = new $root.signalservice.CallMessage();
                if (object.offer != null) {
                    if (typeof object.offer !== "object")
                        throw TypeError(".signalservice.CallMessage.offer: object expected");
                    message.offer = $root.signalservice.CallMessage.Offer.fromObject(object.offer);
                }
                if (object.answer != null) {
                    if (typeof object.answer !== "object")
                        throw TypeError(".signalservice.CallMessage.answer: object expected");
                    message.answer = $root.signalservice.CallMessage.Answer.fromObject(object.answer);
                }
                if (object.iceUpdate) {
                    if (!Array.isArray(object.iceUpdate))
                        throw TypeError(".signalservice.CallMessage.iceUpdate: array expected");
                    message.iceUpdate = [];
                    for (var i = 0; i < object.iceUpdate.length; ++i) {
                        if (typeof object.iceUpdate[i] !== "object")
                            throw TypeError(".signalservice.CallMessage.iceUpdate: object expected");
                        message.iceUpdate[i] = $root.signalservice.CallMessage.IceUpdate.fromObject(object.iceUpdate[i]);
                    }
                }
                if (object.hangup != null) {
                    if (typeof object.hangup !== "object")
                        throw TypeError(".signalservice.CallMessage.hangup: object expected");
                    message.hangup = $root.signalservice.CallMessage.Hangup.fromObject(object.hangup);
                }
                if (object.busy != null) {
                    if (typeof object.busy !== "object")
                        throw TypeError(".signalservice.CallMessage.busy: object expected");
                    message.busy = $root.signalservice.CallMessage.Busy.fromObject(object.busy);
                }
                return message;
            };

            /**
             * Creates a plain object from a CallMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof signalservice.CallMessage
             * @static
             * @param {signalservice.CallMessage} message CallMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CallMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.iceUpdate = [];
                if (options.defaults) {
                    object.offer = null;
                    object.answer = null;
                    object.hangup = null;
                    object.busy = null;
                }
                if (message.offer != null && message.hasOwnProperty("offer"))
                    object.offer = $root.signalservice.CallMessage.Offer.toObject(message.offer, options);
                if (message.answer != null && message.hasOwnProperty("answer"))
                    object.answer = $root.signalservice.CallMessage.Answer.toObject(message.answer, options);
                if (message.iceUpdate && message.iceUpdate.length) {
                    object.iceUpdate = [];
                    for (var j = 0; j < message.iceUpdate.length; ++j)
                        object.iceUpdate[j] = $root.signalservice.CallMessage.IceUpdate.toObject(message.iceUpdate[j], options);
                }
                if (message.hangup != null && message.hasOwnProperty("hangup"))
                    object.hangup = $root.signalservice.CallMessage.Hangup.toObject(message.hangup, options);
                if (message.busy != null && message.hasOwnProperty("busy"))
                    object.busy = $root.signalservice.CallMessage.Busy.toObject(message.busy, options);
                return object;
            };

            /**
             * Converts this CallMessage to JSON.
             * @function toJSON
             * @memberof signalservice.CallMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CallMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            CallMessage.Offer = (function () {

                /**
                 * Properties of an Offer.
                 * @memberof signalservice.CallMessage
                 * @interface IOffer
                 * @property {number|Long|null} [id] Offer id
                 * @property {string|null} [description] Offer description
                 */

                /**
                 * Constructs a new Offer.
                 * @memberof signalservice.CallMessage
                 * @classdesc Represents an Offer.
                 * @implements IOffer
                 * @constructor
                 * @param {signalservice.CallMessage.IOffer=} [properties] Properties to set
                 */
                function Offer(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Offer id.
                 * @member {number|Long} id
                 * @memberof signalservice.CallMessage.Offer
                 * @instance
                 */
                Offer.prototype.id = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;

                /**
                 * Offer description.
                 * @member {string} description
                 * @memberof signalservice.CallMessage.Offer
                 * @instance
                 */
                Offer.prototype.description = "";

                /**
                 * Creates a new Offer instance using the specified properties.
                 * @function create
                 * @memberof signalservice.CallMessage.Offer
                 * @static
                 * @param {signalservice.CallMessage.IOffer=} [properties] Properties to set
                 * @returns {signalservice.CallMessage.Offer} Offer instance
                 */
                Offer.create = function create(properties) {
                    return new Offer(properties);
                };

                /**
                 * Encodes the specified Offer message. Does not implicitly {@link signalservice.CallMessage.Offer.verify|verify} messages.
                 * @function encode
                 * @memberof signalservice.CallMessage.Offer
                 * @static
                 * @param {signalservice.CallMessage.IOffer} message Offer message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Offer.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.id != null && message.hasOwnProperty("id"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
                    if (message.description != null && message.hasOwnProperty("description"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.description);
                    return writer;
                };

                /**
                 * Encodes the specified Offer message, length delimited. Does not implicitly {@link signalservice.CallMessage.Offer.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof signalservice.CallMessage.Offer
                 * @static
                 * @param {signalservice.CallMessage.IOffer} message Offer message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Offer.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an Offer message from the specified reader or buffer.
                 * @function decode
                 * @memberof signalservice.CallMessage.Offer
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {signalservice.CallMessage.Offer} Offer
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Offer.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.CallMessage.Offer();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                message.id = reader.uint64();
                                break;
                            case 2:
                                message.description = reader.string();
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an Offer message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof signalservice.CallMessage.Offer
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {signalservice.CallMessage.Offer} Offer
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Offer.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an Offer message.
                 * @function verify
                 * @memberof signalservice.CallMessage.Offer
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Offer.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.id != null && message.hasOwnProperty("id"))
                        if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                            return "id: integer|Long expected";
                    if (message.description != null && message.hasOwnProperty("description"))
                        if (!$util.isString(message.description))
                            return "description: string expected";
                    return null;
                };

                /**
                 * Creates an Offer message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof signalservice.CallMessage.Offer
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {signalservice.CallMessage.Offer} Offer
                 */
                Offer.fromObject = function fromObject(object) {
                    if (object instanceof $root.signalservice.CallMessage.Offer)
                        return object;
                    var message = new $root.signalservice.CallMessage.Offer();
                    if (object.id != null)
                        if ($util.Long)
                            (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                        else if (typeof object.id === "string")
                            message.id = parseInt(object.id, 10);
                        else if (typeof object.id === "number")
                            message.id = object.id;
                        else if (typeof object.id === "object")
                            message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
                    if (object.description != null)
                        message.description = String(object.description);
                    return message;
                };

                /**
                 * Creates a plain object from an Offer message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof signalservice.CallMessage.Offer
                 * @static
                 * @param {signalservice.CallMessage.Offer} message Offer
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Offer.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        if ($util.Long) {
                            var long = new $util.Long(0, 0, true);
                            object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.id = options.longs === String ? "0" : 0;
                        object.description = "";
                    }
                    if (message.id != null && message.hasOwnProperty("id"))
                        if (typeof message.id === "number")
                            object.id = options.longs === String ? String(message.id) : message.id;
                        else
                            object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
                    if (message.description != null && message.hasOwnProperty("description"))
                        object.description = message.description;
                    return object;
                };

                /**
                 * Converts this Offer to JSON.
                 * @function toJSON
                 * @memberof signalservice.CallMessage.Offer
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Offer.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Offer;
            })();

            CallMessage.Answer = (function () {

                /**
                 * Properties of an Answer.
                 * @memberof signalservice.CallMessage
                 * @interface IAnswer
                 * @property {number|Long|null} [id] Answer id
                 * @property {string|null} [description] Answer description
                 */

                /**
                 * Constructs a new Answer.
                 * @memberof signalservice.CallMessage
                 * @classdesc Represents an Answer.
                 * @implements IAnswer
                 * @constructor
                 * @param {signalservice.CallMessage.IAnswer=} [properties] Properties to set
                 */
                function Answer(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Answer id.
                 * @member {number|Long} id
                 * @memberof signalservice.CallMessage.Answer
                 * @instance
                 */
                Answer.prototype.id = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;

                /**
                 * Answer description.
                 * @member {string} description
                 * @memberof signalservice.CallMessage.Answer
                 * @instance
                 */
                Answer.prototype.description = "";

                /**
                 * Creates a new Answer instance using the specified properties.
                 * @function create
                 * @memberof signalservice.CallMessage.Answer
                 * @static
                 * @param {signalservice.CallMessage.IAnswer=} [properties] Properties to set
                 * @returns {signalservice.CallMessage.Answer} Answer instance
                 */
                Answer.create = function create(properties) {
                    return new Answer(properties);
                };

                /**
                 * Encodes the specified Answer message. Does not implicitly {@link signalservice.CallMessage.Answer.verify|verify} messages.
                 * @function encode
                 * @memberof signalservice.CallMessage.Answer
                 * @static
                 * @param {signalservice.CallMessage.IAnswer} message Answer message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Answer.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.id != null && message.hasOwnProperty("id"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
                    if (message.description != null && message.hasOwnProperty("description"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.description);
                    return writer;
                };

                /**
                 * Encodes the specified Answer message, length delimited. Does not implicitly {@link signalservice.CallMessage.Answer.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof signalservice.CallMessage.Answer
                 * @static
                 * @param {signalservice.CallMessage.IAnswer} message Answer message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Answer.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an Answer message from the specified reader or buffer.
                 * @function decode
                 * @memberof signalservice.CallMessage.Answer
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {signalservice.CallMessage.Answer} Answer
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Answer.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.CallMessage.Answer();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                message.id = reader.uint64();
                                break;
                            case 2:
                                message.description = reader.string();
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an Answer message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof signalservice.CallMessage.Answer
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {signalservice.CallMessage.Answer} Answer
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Answer.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an Answer message.
                 * @function verify
                 * @memberof signalservice.CallMessage.Answer
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Answer.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.id != null && message.hasOwnProperty("id"))
                        if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                            return "id: integer|Long expected";
                    if (message.description != null && message.hasOwnProperty("description"))
                        if (!$util.isString(message.description))
                            return "description: string expected";
                    return null;
                };

                /**
                 * Creates an Answer message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof signalservice.CallMessage.Answer
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {signalservice.CallMessage.Answer} Answer
                 */
                Answer.fromObject = function fromObject(object) {
                    if (object instanceof $root.signalservice.CallMessage.Answer)
                        return object;
                    var message = new $root.signalservice.CallMessage.Answer();
                    if (object.id != null)
                        if ($util.Long)
                            (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                        else if (typeof object.id === "string")
                            message.id = parseInt(object.id, 10);
                        else if (typeof object.id === "number")
                            message.id = object.id;
                        else if (typeof object.id === "object")
                            message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
                    if (object.description != null)
                        message.description = String(object.description);
                    return message;
                };

                /**
                 * Creates a plain object from an Answer message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof signalservice.CallMessage.Answer
                 * @static
                 * @param {signalservice.CallMessage.Answer} message Answer
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Answer.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        if ($util.Long) {
                            var long = new $util.Long(0, 0, true);
                            object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.id = options.longs === String ? "0" : 0;
                        object.description = "";
                    }
                    if (message.id != null && message.hasOwnProperty("id"))
                        if (typeof message.id === "number")
                            object.id = options.longs === String ? String(message.id) : message.id;
                        else
                            object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
                    if (message.description != null && message.hasOwnProperty("description"))
                        object.description = message.description;
                    return object;
                };

                /**
                 * Converts this Answer to JSON.
                 * @function toJSON
                 * @memberof signalservice.CallMessage.Answer
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Answer.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Answer;
            })();

            CallMessage.IceUpdate = (function () {

                /**
                 * Properties of an IceUpdate.
                 * @memberof signalservice.CallMessage
                 * @interface IIceUpdate
                 * @property {number|Long|null} [id] IceUpdate id
                 * @property {string|null} [sdpMid] IceUpdate sdpMid
                 * @property {number|null} [sdpMLineIndex] IceUpdate sdpMLineIndex
                 * @property {string|null} [sdp] IceUpdate sdp
                 */

                /**
                 * Constructs a new IceUpdate.
                 * @memberof signalservice.CallMessage
                 * @classdesc Represents an IceUpdate.
                 * @implements IIceUpdate
                 * @constructor
                 * @param {signalservice.CallMessage.IIceUpdate=} [properties] Properties to set
                 */
                function IceUpdate(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * IceUpdate id.
                 * @member {number|Long} id
                 * @memberof signalservice.CallMessage.IceUpdate
                 * @instance
                 */
                IceUpdate.prototype.id = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;

                /**
                 * IceUpdate sdpMid.
                 * @member {string} sdpMid
                 * @memberof signalservice.CallMessage.IceUpdate
                 * @instance
                 */
                IceUpdate.prototype.sdpMid = "";

                /**
                 * IceUpdate sdpMLineIndex.
                 * @member {number} sdpMLineIndex
                 * @memberof signalservice.CallMessage.IceUpdate
                 * @instance
                 */
                IceUpdate.prototype.sdpMLineIndex = 0;

                /**
                 * IceUpdate sdp.
                 * @member {string} sdp
                 * @memberof signalservice.CallMessage.IceUpdate
                 * @instance
                 */
                IceUpdate.prototype.sdp = "";

                /**
                 * Creates a new IceUpdate instance using the specified properties.
                 * @function create
                 * @memberof signalservice.CallMessage.IceUpdate
                 * @static
                 * @param {signalservice.CallMessage.IIceUpdate=} [properties] Properties to set
                 * @returns {signalservice.CallMessage.IceUpdate} IceUpdate instance
                 */
                IceUpdate.create = function create(properties) {
                    return new IceUpdate(properties);
                };

                /**
                 * Encodes the specified IceUpdate message. Does not implicitly {@link signalservice.CallMessage.IceUpdate.verify|verify} messages.
                 * @function encode
                 * @memberof signalservice.CallMessage.IceUpdate
                 * @static
                 * @param {signalservice.CallMessage.IIceUpdate} message IceUpdate message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                IceUpdate.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.id != null && message.hasOwnProperty("id"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
                    if (message.sdpMid != null && message.hasOwnProperty("sdpMid"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.sdpMid);
                    if (message.sdpMLineIndex != null && message.hasOwnProperty("sdpMLineIndex"))
                        writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.sdpMLineIndex);
                    if (message.sdp != null && message.hasOwnProperty("sdp"))
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.sdp);
                    return writer;
                };

                /**
                 * Encodes the specified IceUpdate message, length delimited. Does not implicitly {@link signalservice.CallMessage.IceUpdate.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof signalservice.CallMessage.IceUpdate
                 * @static
                 * @param {signalservice.CallMessage.IIceUpdate} message IceUpdate message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                IceUpdate.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an IceUpdate message from the specified reader or buffer.
                 * @function decode
                 * @memberof signalservice.CallMessage.IceUpdate
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {signalservice.CallMessage.IceUpdate} IceUpdate
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                IceUpdate.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.CallMessage.IceUpdate();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                message.id = reader.uint64();
                                break;
                            case 2:
                                message.sdpMid = reader.string();
                                break;
                            case 3:
                                message.sdpMLineIndex = reader.uint32();
                                break;
                            case 4:
                                message.sdp = reader.string();
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an IceUpdate message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof signalservice.CallMessage.IceUpdate
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {signalservice.CallMessage.IceUpdate} IceUpdate
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                IceUpdate.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an IceUpdate message.
                 * @function verify
                 * @memberof signalservice.CallMessage.IceUpdate
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                IceUpdate.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.id != null && message.hasOwnProperty("id"))
                        if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                            return "id: integer|Long expected";
                    if (message.sdpMid != null && message.hasOwnProperty("sdpMid"))
                        if (!$util.isString(message.sdpMid))
                            return "sdpMid: string expected";
                    if (message.sdpMLineIndex != null && message.hasOwnProperty("sdpMLineIndex"))
                        if (!$util.isInteger(message.sdpMLineIndex))
                            return "sdpMLineIndex: integer expected";
                    if (message.sdp != null && message.hasOwnProperty("sdp"))
                        if (!$util.isString(message.sdp))
                            return "sdp: string expected";
                    return null;
                };

                /**
                 * Creates an IceUpdate message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof signalservice.CallMessage.IceUpdate
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {signalservice.CallMessage.IceUpdate} IceUpdate
                 */
                IceUpdate.fromObject = function fromObject(object) {
                    if (object instanceof $root.signalservice.CallMessage.IceUpdate)
                        return object;
                    var message = new $root.signalservice.CallMessage.IceUpdate();
                    if (object.id != null)
                        if ($util.Long)
                            (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                        else if (typeof object.id === "string")
                            message.id = parseInt(object.id, 10);
                        else if (typeof object.id === "number")
                            message.id = object.id;
                        else if (typeof object.id === "object")
                            message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
                    if (object.sdpMid != null)
                        message.sdpMid = String(object.sdpMid);
                    if (object.sdpMLineIndex != null)
                        message.sdpMLineIndex = object.sdpMLineIndex >>> 0;
                    if (object.sdp != null)
                        message.sdp = String(object.sdp);
                    return message;
                };

                /**
                 * Creates a plain object from an IceUpdate message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof signalservice.CallMessage.IceUpdate
                 * @static
                 * @param {signalservice.CallMessage.IceUpdate} message IceUpdate
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                IceUpdate.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        if ($util.Long) {
                            var long = new $util.Long(0, 0, true);
                            object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.id = options.longs === String ? "0" : 0;
                        object.sdpMid = "";
                        object.sdpMLineIndex = 0;
                        object.sdp = "";
                    }
                    if (message.id != null && message.hasOwnProperty("id"))
                        if (typeof message.id === "number")
                            object.id = options.longs === String ? String(message.id) : message.id;
                        else
                            object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
                    if (message.sdpMid != null && message.hasOwnProperty("sdpMid"))
                        object.sdpMid = message.sdpMid;
                    if (message.sdpMLineIndex != null && message.hasOwnProperty("sdpMLineIndex"))
                        object.sdpMLineIndex = message.sdpMLineIndex;
                    if (message.sdp != null && message.hasOwnProperty("sdp"))
                        object.sdp = message.sdp;
                    return object;
                };

                /**
                 * Converts this IceUpdate to JSON.
                 * @function toJSON
                 * @memberof signalservice.CallMessage.IceUpdate
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                IceUpdate.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return IceUpdate;
            })();

            CallMessage.Busy = (function () {

                /**
                 * Properties of a Busy.
                 * @memberof signalservice.CallMessage
                 * @interface IBusy
                 * @property {number|Long|null} [id] Busy id
                 */

                /**
                 * Constructs a new Busy.
                 * @memberof signalservice.CallMessage
                 * @classdesc Represents a Busy.
                 * @implements IBusy
                 * @constructor
                 * @param {signalservice.CallMessage.IBusy=} [properties] Properties to set
                 */
                function Busy(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Busy id.
                 * @member {number|Long} id
                 * @memberof signalservice.CallMessage.Busy
                 * @instance
                 */
                Busy.prototype.id = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;

                /**
                 * Creates a new Busy instance using the specified properties.
                 * @function create
                 * @memberof signalservice.CallMessage.Busy
                 * @static
                 * @param {signalservice.CallMessage.IBusy=} [properties] Properties to set
                 * @returns {signalservice.CallMessage.Busy} Busy instance
                 */
                Busy.create = function create(properties) {
                    return new Busy(properties);
                };

                /**
                 * Encodes the specified Busy message. Does not implicitly {@link signalservice.CallMessage.Busy.verify|verify} messages.
                 * @function encode
                 * @memberof signalservice.CallMessage.Busy
                 * @static
                 * @param {signalservice.CallMessage.IBusy} message Busy message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Busy.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.id != null && message.hasOwnProperty("id"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
                    return writer;
                };

                /**
                 * Encodes the specified Busy message, length delimited. Does not implicitly {@link signalservice.CallMessage.Busy.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof signalservice.CallMessage.Busy
                 * @static
                 * @param {signalservice.CallMessage.IBusy} message Busy message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Busy.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Busy message from the specified reader or buffer.
                 * @function decode
                 * @memberof signalservice.CallMessage.Busy
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {signalservice.CallMessage.Busy} Busy
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Busy.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.CallMessage.Busy();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                message.id = reader.uint64();
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Busy message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof signalservice.CallMessage.Busy
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {signalservice.CallMessage.Busy} Busy
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Busy.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Busy message.
                 * @function verify
                 * @memberof signalservice.CallMessage.Busy
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Busy.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.id != null && message.hasOwnProperty("id"))
                        if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                            return "id: integer|Long expected";
                    return null;
                };

                /**
                 * Creates a Busy message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof signalservice.CallMessage.Busy
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {signalservice.CallMessage.Busy} Busy
                 */
                Busy.fromObject = function fromObject(object) {
                    if (object instanceof $root.signalservice.CallMessage.Busy)
                        return object;
                    var message = new $root.signalservice.CallMessage.Busy();
                    if (object.id != null)
                        if ($util.Long)
                            (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                        else if (typeof object.id === "string")
                            message.id = parseInt(object.id, 10);
                        else if (typeof object.id === "number")
                            message.id = object.id;
                        else if (typeof object.id === "object")
                            message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
                    return message;
                };

                /**
                 * Creates a plain object from a Busy message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof signalservice.CallMessage.Busy
                 * @static
                 * @param {signalservice.CallMessage.Busy} message Busy
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Busy.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults)
                        if ($util.Long) {
                            var long = new $util.Long(0, 0, true);
                            object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.id = options.longs === String ? "0" : 0;
                    if (message.id != null && message.hasOwnProperty("id"))
                        if (typeof message.id === "number")
                            object.id = options.longs === String ? String(message.id) : message.id;
                        else
                            object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
                    return object;
                };

                /**
                 * Converts this Busy to JSON.
                 * @function toJSON
                 * @memberof signalservice.CallMessage.Busy
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Busy.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Busy;
            })();

            CallMessage.Hangup = (function () {

                /**
                 * Properties of a Hangup.
                 * @memberof signalservice.CallMessage
                 * @interface IHangup
                 * @property {number|Long|null} [id] Hangup id
                 */

                /**
                 * Constructs a new Hangup.
                 * @memberof signalservice.CallMessage
                 * @classdesc Represents a Hangup.
                 * @implements IHangup
                 * @constructor
                 * @param {signalservice.CallMessage.IHangup=} [properties] Properties to set
                 */
                function Hangup(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Hangup id.
                 * @member {number|Long} id
                 * @memberof signalservice.CallMessage.Hangup
                 * @instance
                 */
                Hangup.prototype.id = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;

                /**
                 * Creates a new Hangup instance using the specified properties.
                 * @function create
                 * @memberof signalservice.CallMessage.Hangup
                 * @static
                 * @param {signalservice.CallMessage.IHangup=} [properties] Properties to set
                 * @returns {signalservice.CallMessage.Hangup} Hangup instance
                 */
                Hangup.create = function create(properties) {
                    return new Hangup(properties);
                };

                /**
                 * Encodes the specified Hangup message. Does not implicitly {@link signalservice.CallMessage.Hangup.verify|verify} messages.
                 * @function encode
                 * @memberof signalservice.CallMessage.Hangup
                 * @static
                 * @param {signalservice.CallMessage.IHangup} message Hangup message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Hangup.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.id != null && message.hasOwnProperty("id"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
                    return writer;
                };

                /**
                 * Encodes the specified Hangup message, length delimited. Does not implicitly {@link signalservice.CallMessage.Hangup.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof signalservice.CallMessage.Hangup
                 * @static
                 * @param {signalservice.CallMessage.IHangup} message Hangup message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Hangup.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Hangup message from the specified reader or buffer.
                 * @function decode
                 * @memberof signalservice.CallMessage.Hangup
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {signalservice.CallMessage.Hangup} Hangup
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Hangup.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.CallMessage.Hangup();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                message.id = reader.uint64();
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Hangup message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof signalservice.CallMessage.Hangup
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {signalservice.CallMessage.Hangup} Hangup
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Hangup.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Hangup message.
                 * @function verify
                 * @memberof signalservice.CallMessage.Hangup
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Hangup.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.id != null && message.hasOwnProperty("id"))
                        if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                            return "id: integer|Long expected";
                    return null;
                };

                /**
                 * Creates a Hangup message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof signalservice.CallMessage.Hangup
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {signalservice.CallMessage.Hangup} Hangup
                 */
                Hangup.fromObject = function fromObject(object) {
                    if (object instanceof $root.signalservice.CallMessage.Hangup)
                        return object;
                    var message = new $root.signalservice.CallMessage.Hangup();
                    if (object.id != null)
                        if ($util.Long)
                            (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                        else if (typeof object.id === "string")
                            message.id = parseInt(object.id, 10);
                        else if (typeof object.id === "number")
                            message.id = object.id;
                        else if (typeof object.id === "object")
                            message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
                    return message;
                };

                /**
                 * Creates a plain object from a Hangup message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof signalservice.CallMessage.Hangup
                 * @static
                 * @param {signalservice.CallMessage.Hangup} message Hangup
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Hangup.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults)
                        if ($util.Long) {
                            var long = new $util.Long(0, 0, true);
                            object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.id = options.longs === String ? "0" : 0;
                    if (message.id != null && message.hasOwnProperty("id"))
                        if (typeof message.id === "number")
                            object.id = options.longs === String ? String(message.id) : message.id;
                        else
                            object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
                    return object;
                };

                /**
                 * Converts this Hangup to JSON.
                 * @function toJSON
                 * @memberof signalservice.CallMessage.Hangup
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Hangup.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Hangup;
            })();

            return CallMessage;
        })();

        signalservice.DataMessage = (function () {

            /**
             * Properties of a DataMessage.
             * @memberof signalservice
             * @interface IDataMessage
             * @property {string|null} [body] DataMessage body
             * @property {Array.<signalservice.IAttachmentPointer>|null} [attachments] DataMessage attachments
             * @property {signalservice.IGroupContext|null} [group] DataMessage group
             * @property {number|null} [flags] DataMessage flags
             * @property {number|null} [expireTimer] DataMessage expireTimer
             * @property {Uint8Array|null} [profileKey] DataMessage profileKey
             * @property {number|Long|null} [timestamp] DataMessage timestamp
             * @property {signalservice.DataMessage.IQuote|null} [quote] DataMessage quote
         * @property {Array.<signalservice.DataMessage.IContact>|null} [contact] DataMessage contact
             */

            /**
             * Constructs a new DataMessage.
             * @memberof signalservice
             * @classdesc Represents a DataMessage.
             * @implements IDataMessage
             * @constructor
             * @param {signalservice.IDataMessage=} [properties] Properties to set
             */
            function DataMessage(properties) {
                this.attachments = [];
                this.contact = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DataMessage body.
             * @member {string} body
             * @memberof signalservice.DataMessage
             * @instance
             */
            DataMessage.prototype.body = "";

            /**
             * DataMessage attachments.
             * @member {Array.<signalservice.IAttachmentPointer>} attachments
             * @memberof signalservice.DataMessage
             * @instance
             */
            DataMessage.prototype.attachments = $util.emptyArray;

            /**
             * DataMessage group.
             * @member {signalservice.IGroupContext|null|undefined} group
             * @memberof signalservice.DataMessage
             * @instance
             */
            DataMessage.prototype.group = null;

            /**
             * DataMessage flags.
             * @member {number} flags
             * @memberof signalservice.DataMessage
             * @instance
             */
            DataMessage.prototype.flags = 0;

            /**
             * DataMessage expireTimer.
             * @member {number} expireTimer
             * @memberof signalservice.DataMessage
             * @instance
             */
            DataMessage.prototype.expireTimer = 0;

            /**
             * DataMessage profileKey.
             * @member {Uint8Array} profileKey
             * @memberof signalservice.DataMessage
             * @instance
             */
            DataMessage.prototype.profileKey = $util.newBuffer([]);

            /**
             * DataMessage timestamp.
             * @member {number|Long} timestamp
             * @memberof signalservice.DataMessage
             * @instance
             */
            DataMessage.prototype.timestamp = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;

            /**
             * DataMessage quote.
             * @member {signalservice.DataMessage.IQuote|null|undefined} quote
             * @memberof signalservice.DataMessage
             * @instance
             */
            DataMessage.prototype.quote = null;

            /**
             * DataMessage contact.
             * @member {Array.<signalservice.DataMessage.IContact>} contact
             * @memberof signalservice.DataMessage
             * @instance
             */
            DataMessage.prototype.contact = $util.emptyArray;

            /**
             * Creates a new DataMessage instance using the specified properties.
             * @function create
             * @memberof signalservice.DataMessage
             * @static
             * @param {signalservice.IDataMessage=} [properties] Properties to set
             * @returns {signalservice.DataMessage} DataMessage instance
             */
            DataMessage.create = function create(properties) {
                return new DataMessage(properties);
            };

            /**
             * Encodes the specified DataMessage message. Does not implicitly {@link signalservice.DataMessage.verify|verify} messages.
             * @function encode
             * @memberof signalservice.DataMessage
             * @static
             * @param {signalservice.IDataMessage} message DataMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DataMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.body != null && message.hasOwnProperty("body"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.body);
                if (message.attachments != null && message.attachments.length)
                    for (var i = 0; i < message.attachments.length; ++i)
                        $root.signalservice.AttachmentPointer.encode(message.attachments[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.group != null && message.hasOwnProperty("group"))
                    $root.signalservice.GroupContext.encode(message.group, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.flags != null && message.hasOwnProperty("flags"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.flags);
                if (message.expireTimer != null && message.hasOwnProperty("expireTimer"))
                    writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.expireTimer);
                if (message.profileKey != null && message.hasOwnProperty("profileKey"))
                    writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.profileKey);
                if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                    writer.uint32(/* id 7, wireType 0 =*/56).uint64(message.timestamp);
                if (message.quote != null && message.hasOwnProperty("quote"))
                    $root.signalservice.DataMessage.Quote.encode(message.quote, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
                if (message.contact != null && message.contact.length)
                    for (var i = 0; i < message.contact.length; ++i)
                        $root.signalservice.DataMessage.Contact.encode(message.contact[i], writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified DataMessage message, length delimited. Does not implicitly {@link signalservice.DataMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof signalservice.DataMessage
             * @static
             * @param {signalservice.IDataMessage} message DataMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DataMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DataMessage message from the specified reader or buffer.
             * @function decode
             * @memberof signalservice.DataMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {signalservice.DataMessage} DataMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DataMessage.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.DataMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            message.body = reader.string();
                            break;
                        case 2:
                            if (!(message.attachments && message.attachments.length))
                                message.attachments = [];
                            message.attachments.push($root.signalservice.AttachmentPointer.decode(reader, reader.uint32()));
                            break;
                        case 3:
                            message.group = $root.signalservice.GroupContext.decode(reader, reader.uint32());
                            break;
                        case 4:
                            message.flags = reader.uint32();
                            break;
                        case 5:
                            message.expireTimer = reader.uint32();
                            break;
                        case 6:
                            message.profileKey = reader.bytes();
                            break;
                        case 7:
                            message.timestamp = reader.uint64();
                            break;
                        case 8:
                            message.quote = $root.signalservice.DataMessage.Quote.decode(reader, reader.uint32());
                            break;
                        case 9:
                            if (!(message.contact && message.contact.length))
                                message.contact = [];
                            message.contact.push($root.signalservice.DataMessage.Contact.decode(reader, reader.uint32()));
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return message;
            };

            /**
             * Decodes a DataMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof signalservice.DataMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {signalservice.DataMessage} DataMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DataMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DataMessage message.
             * @function verify
             * @memberof signalservice.DataMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DataMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.body != null && message.hasOwnProperty("body"))
                    if (!$util.isString(message.body))
                        return "body: string expected";
                if (message.attachments != null && message.hasOwnProperty("attachments")) {
                    if (!Array.isArray(message.attachments))
                        return "attachments: array expected";
                    for (var i = 0; i < message.attachments.length; ++i) {
                        var error = $root.signalservice.AttachmentPointer.verify(message.attachments[i]);
                        if (error)
                            return "attachments." + error;
                    }
                }
                if (message.group != null && message.hasOwnProperty("group")) {
                    var error = $root.signalservice.GroupContext.verify(message.group);
                    if (error)
                        return "group." + error;
                }
                if (message.flags != null && message.hasOwnProperty("flags"))
                    if (!$util.isInteger(message.flags))
                        return "flags: integer expected";
                if (message.expireTimer != null && message.hasOwnProperty("expireTimer"))
                    if (!$util.isInteger(message.expireTimer))
                        return "expireTimer: integer expected";
                if (message.profileKey != null && message.hasOwnProperty("profileKey"))
                    if (!(message.profileKey && typeof message.profileKey.length === "number" || $util.isString(message.profileKey)))
                        return "profileKey: buffer expected";
                if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                    if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                        return "timestamp: integer|Long expected";
                if (message.quote != null && message.hasOwnProperty("quote")) {
                    var error = $root.signalservice.DataMessage.Quote.verify(message.quote);
                    if (error)
                        return "quote." + error;
                }
                if (message.contact != null && message.hasOwnProperty("contact")) {
                    if (!Array.isArray(message.contact))
                        return "contact: array expected";
                    for (var i = 0; i < message.contact.length; ++i) {
                        var error = $root.signalservice.DataMessage.Contact.verify(message.contact[i]);
                        if (error)
                            return "contact." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a DataMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof signalservice.DataMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {signalservice.DataMessage} DataMessage
             */
            DataMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.signalservice.DataMessage)
                    return object;
                var message = new $root.signalservice.DataMessage();
                if (object.body != null)
                    message.body = String(object.body);
                if (object.attachments) {
                    if (!Array.isArray(object.attachments))
                        throw TypeError(".signalservice.DataMessage.attachments: array expected");
                    message.attachments = [];
                    for (var i = 0; i < object.attachments.length; ++i) {
                        if (typeof object.attachments[i] !== "object")
                            throw TypeError(".signalservice.DataMessage.attachments: object expected");
                        message.attachments[i] = $root.signalservice.AttachmentPointer.fromObject(object.attachments[i]);
                    }
                }
                if (object.group != null) {
                    if (typeof object.group !== "object")
                        throw TypeError(".signalservice.DataMessage.group: object expected");
                    message.group = $root.signalservice.GroupContext.fromObject(object.group);
                }
                if (object.flags != null)
                    message.flags = object.flags >>> 0;
                if (object.expireTimer != null)
                    message.expireTimer = object.expireTimer >>> 0;
                if (object.profileKey != null)
                    if (typeof object.profileKey === "string")
                        $util.base64.decode(object.profileKey, message.profileKey = $util.newBuffer($util.base64.length(object.profileKey)), 0);
                    else if (object.profileKey.length)
                        message.profileKey = object.profileKey;
                if (object.timestamp != null)
                    if ($util.Long)
                        (message.timestamp = $util.Long.fromValue(object.timestamp)).unsigned = true;
                    else if (typeof object.timestamp === "string")
                        message.timestamp = parseInt(object.timestamp, 10);
                    else if (typeof object.timestamp === "number")
                        message.timestamp = object.timestamp;
                    else if (typeof object.timestamp === "object")
                        message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber(true);
                if (object.quote != null) {
                    if (typeof object.quote !== "object")
                        throw TypeError(".signalservice.DataMessage.quote: object expected");
                    message.quote = $root.signalservice.DataMessage.Quote.fromObject(object.quote);
                }
                if (object.contact) {
                    if (!Array.isArray(object.contact))
                        throw TypeError(".signalservice.DataMessage.contact: array expected");
                    message.contact = [];
                    for (var i = 0; i < object.contact.length; ++i) {
                        if (typeof object.contact[i] !== "object")
                            throw TypeError(".signalservice.DataMessage.contact: object expected");
                        message.contact[i] = $root.signalservice.DataMessage.Contact.fromObject(object.contact[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a DataMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof signalservice.DataMessage
             * @static
             * @param {signalservice.DataMessage} message DataMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DataMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults) {
                    object.attachments = [];
                    object.contact = [];
                }
                if (options.defaults) {
                    object.body = "";
                    object.group = null;
                    object.flags = 0;
                    object.expireTimer = 0;
                    object.profileKey = options.bytes === String ? "" : [];
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestamp = options.longs === String ? "0" : 0;
                    object.quote = null;
                }
                if (message.body != null && message.hasOwnProperty("body"))
                    object.body = message.body;
                if (message.attachments && message.attachments.length) {
                    object.attachments = [];
                    for (var j = 0; j < message.attachments.length; ++j)
                        object.attachments[j] = $root.signalservice.AttachmentPointer.toObject(message.attachments[j], options);
                }
                if (message.group != null && message.hasOwnProperty("group"))
                    object.group = $root.signalservice.GroupContext.toObject(message.group, options);
                if (message.flags != null && message.hasOwnProperty("flags"))
                    object.flags = message.flags;
                if (message.expireTimer != null && message.hasOwnProperty("expireTimer"))
                    object.expireTimer = message.expireTimer;
                if (message.profileKey != null && message.hasOwnProperty("profileKey"))
                    object.profileKey = options.bytes === String ? $util.base64.encode(message.profileKey, 0, message.profileKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.profileKey) : message.profileKey;
                if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                    if (typeof message.timestamp === "number")
                        object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                    else
                        object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber(true) : message.timestamp;
                if (message.quote != null && message.hasOwnProperty("quote"))
                    object.quote = $root.signalservice.DataMessage.Quote.toObject(message.quote, options);
                if (message.contact && message.contact.length) {
                    object.contact = [];
                    for (var j = 0; j < message.contact.length; ++j)
                        object.contact[j] = $root.signalservice.DataMessage.Contact.toObject(message.contact[j], options);
                }
                return object;
            };

            /**
             * Converts this DataMessage to JSON.
             * @function toJSON
             * @memberof signalservice.DataMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DataMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Flags enum.
             * @name signalservice.DataMessage.Flags
             * @enum {string}
             * @property {number} END_SESSION=1 END_SESSION value
             * @property {number} EXPIRATION_TIMER_UPDATE=2 EXPIRATION_TIMER_UPDATE value
             * @property {number} PROFILE_KEY_UPDATE=4 PROFILE_KEY_UPDATE value
             */
            DataMessage.Flags = (function () {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[1] = "END_SESSION"] = 1;
                values[valuesById[2] = "EXPIRATION_TIMER_UPDATE"] = 2;
                values[valuesById[4] = "PROFILE_KEY_UPDATE"] = 4;
                return values;
            })();

            DataMessage.Quote = (function () {

                /**
                 * Properties of a Quote.
                 * @memberof signalservice.DataMessage
                 * @interface IQuote
                 * @property {number|Long|null} [id] Quote id
                 * @property {string|null} [author] Quote author
                 * @property {string|null} [text] Quote text
                 * @property {Array.<signalservice.DataMessage.Quote.IQuotedAttachment>|null} [attachments] Quote attachments
                 */

                /**
                 * Constructs a new Quote.
                 * @memberof signalservice.DataMessage
                 * @classdesc Represents a Quote.
                 * @implements IQuote
                 * @constructor
                 * @param {signalservice.DataMessage.IQuote=} [properties] Properties to set
                 */
                function Quote(properties) {
                    this.attachments = [];
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Quote id.
                 * @member {number|Long} id
                 * @memberof signalservice.DataMessage.Quote
                 * @instance
                 */
                Quote.prototype.id = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;

                /**
                 * Quote author.
                 * @member {string} author
                 * @memberof signalservice.DataMessage.Quote
                 * @instance
                 */
                Quote.prototype.author = "";

                /**
                 * Quote text.
                 * @member {string} text
                 * @memberof signalservice.DataMessage.Quote
                 * @instance
                 */
                Quote.prototype.text = "";

                /**
                 * Quote attachments.
                 * @member {Array.<signalservice.DataMessage.Quote.IQuotedAttachment>} attachments
                 * @memberof signalservice.DataMessage.Quote
                 * @instance
                 */
                Quote.prototype.attachments = $util.emptyArray;

                /**
                 * Creates a new Quote instance using the specified properties.
                 * @function create
                 * @memberof signalservice.DataMessage.Quote
                 * @static
                 * @param {signalservice.DataMessage.IQuote=} [properties] Properties to set
                 * @returns {signalservice.DataMessage.Quote} Quote instance
                 */
                Quote.create = function create(properties) {
                    return new Quote(properties);
                };

                /**
                 * Encodes the specified Quote message. Does not implicitly {@link signalservice.DataMessage.Quote.verify|verify} messages.
                 * @function encode
                 * @memberof signalservice.DataMessage.Quote
                 * @static
                 * @param {signalservice.DataMessage.IQuote} message Quote message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Quote.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.id != null && message.hasOwnProperty("id"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
                    if (message.author != null && message.hasOwnProperty("author"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.author);
                    if (message.text != null && message.hasOwnProperty("text"))
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.text);
                    if (message.attachments != null && message.attachments.length)
                        for (var i = 0; i < message.attachments.length; ++i)
                            $root.signalservice.DataMessage.Quote.QuotedAttachment.encode(message.attachments[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified Quote message, length delimited. Does not implicitly {@link signalservice.DataMessage.Quote.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof signalservice.DataMessage.Quote
                 * @static
                 * @param {signalservice.DataMessage.IQuote} message Quote message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Quote.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Quote message from the specified reader or buffer.
                 * @function decode
                 * @memberof signalservice.DataMessage.Quote
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {signalservice.DataMessage.Quote} Quote
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Quote.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.DataMessage.Quote();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                message.id = reader.uint64();
                                break;
                            case 2:
                                message.author = reader.string();
                                break;
                            case 3:
                                message.text = reader.string();
                                break;
                            case 4:
                                if (!(message.attachments && message.attachments.length))
                                    message.attachments = [];
                                message.attachments.push($root.signalservice.DataMessage.Quote.QuotedAttachment.decode(reader, reader.uint32()));
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Quote message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof signalservice.DataMessage.Quote
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {signalservice.DataMessage.Quote} Quote
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Quote.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Quote message.
                 * @function verify
                 * @memberof signalservice.DataMessage.Quote
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Quote.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.id != null && message.hasOwnProperty("id"))
                        if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                            return "id: integer|Long expected";
                    if (message.author != null && message.hasOwnProperty("author"))
                        if (!$util.isString(message.author))
                            return "author: string expected";
                    if (message.text != null && message.hasOwnProperty("text"))
                        if (!$util.isString(message.text))
                            return "text: string expected";
                    if (message.attachments != null && message.hasOwnProperty("attachments")) {
                        if (!Array.isArray(message.attachments))
                            return "attachments: array expected";
                        for (var i = 0; i < message.attachments.length; ++i) {
                            var error = $root.signalservice.DataMessage.Quote.QuotedAttachment.verify(message.attachments[i]);
                            if (error)
                                return "attachments." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a Quote message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof signalservice.DataMessage.Quote
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {signalservice.DataMessage.Quote} Quote
                 */
                Quote.fromObject = function fromObject(object) {
                    if (object instanceof $root.signalservice.DataMessage.Quote)
                        return object;
                    var message = new $root.signalservice.DataMessage.Quote();
                    if (object.id != null)
                        if ($util.Long)
                            (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                        else if (typeof object.id === "string")
                            message.id = parseInt(object.id, 10);
                        else if (typeof object.id === "number")
                            message.id = object.id;
                        else if (typeof object.id === "object")
                            message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
                    if (object.author != null)
                        message.author = String(object.author);
                    if (object.text != null)
                        message.text = String(object.text);
                    if (object.attachments) {
                        if (!Array.isArray(object.attachments))
                            throw TypeError(".signalservice.DataMessage.Quote.attachments: array expected");
                        message.attachments = [];
                        for (var i = 0; i < object.attachments.length; ++i) {
                            if (typeof object.attachments[i] !== "object")
                                throw TypeError(".signalservice.DataMessage.Quote.attachments: object expected");
                            message.attachments[i] = $root.signalservice.DataMessage.Quote.QuotedAttachment.fromObject(object.attachments[i]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a Quote message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof signalservice.DataMessage.Quote
                 * @static
                 * @param {signalservice.DataMessage.Quote} message Quote
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Quote.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.arrays || options.defaults)
                        object.attachments = [];
                    if (options.defaults) {
                        if ($util.Long) {
                            var long = new $util.Long(0, 0, true);
                            object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.id = options.longs === String ? "0" : 0;
                        object.author = "";
                        object.text = "";
                    }
                    if (message.id != null && message.hasOwnProperty("id"))
                        if (typeof message.id === "number")
                            object.id = options.longs === String ? String(message.id) : message.id;
                        else
                            object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
                    if (message.author != null && message.hasOwnProperty("author"))
                        object.author = message.author;
                    if (message.text != null && message.hasOwnProperty("text"))
                        object.text = message.text;
                    if (message.attachments && message.attachments.length) {
                        object.attachments = [];
                        for (var j = 0; j < message.attachments.length; ++j)
                            object.attachments[j] = $root.signalservice.DataMessage.Quote.QuotedAttachment.toObject(message.attachments[j], options);
                    }
                    return object;
                };

                /**
                 * Converts this Quote to JSON.
                 * @function toJSON
                 * @memberof signalservice.DataMessage.Quote
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Quote.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                Quote.QuotedAttachment = (function () {

                    /**
                     * Properties of a QuotedAttachment.
                     * @memberof signalservice.DataMessage.Quote
                     * @interface IQuotedAttachment
                     * @property {string|null} [contentType] QuotedAttachment contentType
                     * @property {string|null} [fileName] QuotedAttachment fileName
                     * @property {signalservice.IAttachmentPointer|null} [thumbnail] QuotedAttachment thumbnail
                     */

                    /**
                     * Constructs a new QuotedAttachment.
                     * @memberof signalservice.DataMessage.Quote
                     * @classdesc Represents a QuotedAttachment.
                     * @implements IQuotedAttachment
                     * @constructor
                     * @param {signalservice.DataMessage.Quote.IQuotedAttachment=} [properties] Properties to set
                     */
                    function QuotedAttachment(properties) {
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * QuotedAttachment contentType.
                     * @member {string} contentType
                     * @memberof signalservice.DataMessage.Quote.QuotedAttachment
                     * @instance
                     */
                    QuotedAttachment.prototype.contentType = "";

                    /**
                     * QuotedAttachment fileName.
                     * @member {string} fileName
                     * @memberof signalservice.DataMessage.Quote.QuotedAttachment
                     * @instance
                     */
                    QuotedAttachment.prototype.fileName = "";

                    /**
                     * QuotedAttachment thumbnail.
                     * @member {signalservice.IAttachmentPointer|null|undefined} thumbnail
                     * @memberof signalservice.DataMessage.Quote.QuotedAttachment
                     * @instance
                     */
                    QuotedAttachment.prototype.thumbnail = null;

                    /**
                     * Creates a new QuotedAttachment instance using the specified properties.
                     * @function create
                     * @memberof signalservice.DataMessage.Quote.QuotedAttachment
                     * @static
                     * @param {signalservice.DataMessage.Quote.IQuotedAttachment=} [properties] Properties to set
                     * @returns {signalservice.DataMessage.Quote.QuotedAttachment} QuotedAttachment instance
                     */
                    QuotedAttachment.create = function create(properties) {
                        return new QuotedAttachment(properties);
                    };

                    /**
                     * Encodes the specified QuotedAttachment message. Does not implicitly {@link signalservice.DataMessage.Quote.QuotedAttachment.verify|verify} messages.
                     * @function encode
                     * @memberof signalservice.DataMessage.Quote.QuotedAttachment
                     * @static
                     * @param {signalservice.DataMessage.Quote.IQuotedAttachment} message QuotedAttachment message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    QuotedAttachment.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.contentType != null && message.hasOwnProperty("contentType"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.contentType);
                        if (message.fileName != null && message.hasOwnProperty("fileName"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.fileName);
                        if (message.thumbnail != null && message.hasOwnProperty("thumbnail"))
                            $root.signalservice.AttachmentPointer.encode(message.thumbnail, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified QuotedAttachment message, length delimited. Does not implicitly {@link signalservice.DataMessage.Quote.QuotedAttachment.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof signalservice.DataMessage.Quote.QuotedAttachment
                     * @static
                     * @param {signalservice.DataMessage.Quote.IQuotedAttachment} message QuotedAttachment message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    QuotedAttachment.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a QuotedAttachment message from the specified reader or buffer.
                     * @function decode
                     * @memberof signalservice.DataMessage.Quote.QuotedAttachment
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {signalservice.DataMessage.Quote.QuotedAttachment} QuotedAttachment
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    QuotedAttachment.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.DataMessage.Quote.QuotedAttachment();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                                case 1:
                                    message.contentType = reader.string();
                                    break;
                                case 2:
                                    message.fileName = reader.string();
                                    break;
                                case 3:
                                    message.thumbnail = $root.signalservice.AttachmentPointer.decode(reader, reader.uint32());
                                    break;
                                default:
                                    reader.skipType(tag & 7);
                                    break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a QuotedAttachment message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof signalservice.DataMessage.Quote.QuotedAttachment
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {signalservice.DataMessage.Quote.QuotedAttachment} QuotedAttachment
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    QuotedAttachment.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a QuotedAttachment message.
                     * @function verify
                     * @memberof signalservice.DataMessage.Quote.QuotedAttachment
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    QuotedAttachment.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.contentType != null && message.hasOwnProperty("contentType"))
                            if (!$util.isString(message.contentType))
                                return "contentType: string expected";
                        if (message.fileName != null && message.hasOwnProperty("fileName"))
                            if (!$util.isString(message.fileName))
                                return "fileName: string expected";
                        if (message.thumbnail != null && message.hasOwnProperty("thumbnail")) {
                            var error = $root.signalservice.AttachmentPointer.verify(message.thumbnail);
                            if (error)
                                return "thumbnail." + error;
                        }
                        return null;
                    };

                    /**
                     * Creates a QuotedAttachment message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof signalservice.DataMessage.Quote.QuotedAttachment
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {signalservice.DataMessage.Quote.QuotedAttachment} QuotedAttachment
                     */
                    QuotedAttachment.fromObject = function fromObject(object) {
                        if (object instanceof $root.signalservice.DataMessage.Quote.QuotedAttachment)
                            return object;
                        var message = new $root.signalservice.DataMessage.Quote.QuotedAttachment();
                        if (object.contentType != null)
                            message.contentType = String(object.contentType);
                        if (object.fileName != null)
                            message.fileName = String(object.fileName);
                        if (object.thumbnail != null) {
                            if (typeof object.thumbnail !== "object")
                                throw TypeError(".signalservice.DataMessage.Quote.QuotedAttachment.thumbnail: object expected");
                            message.thumbnail = $root.signalservice.AttachmentPointer.fromObject(object.thumbnail);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a QuotedAttachment message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof signalservice.DataMessage.Quote.QuotedAttachment
                     * @static
                     * @param {signalservice.DataMessage.Quote.QuotedAttachment} message QuotedAttachment
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    QuotedAttachment.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.defaults) {
                            object.contentType = "";
                            object.fileName = "";
                            object.thumbnail = null;
                        }
                        if (message.contentType != null && message.hasOwnProperty("contentType"))
                            object.contentType = message.contentType;
                        if (message.fileName != null && message.hasOwnProperty("fileName"))
                            object.fileName = message.fileName;
                        if (message.thumbnail != null && message.hasOwnProperty("thumbnail"))
                            object.thumbnail = $root.signalservice.AttachmentPointer.toObject(message.thumbnail, options);
                        return object;
                    };

                    /**
                     * Converts this QuotedAttachment to JSON.
                     * @function toJSON
                     * @memberof signalservice.DataMessage.Quote.QuotedAttachment
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    QuotedAttachment.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return QuotedAttachment;
                })();

                return Quote;
            })();

            DataMessage.Contact = (function () {

                /**
                 * Properties of a Contact.
                 * @memberof signalservice.DataMessage
                 * @interface IContact
                 * @property {signalservice.DataMessage.Contact.IName|null} [name] Contact name
                 * @property {Array.<signalservice.DataMessage.Contact.IPhone>|null} [number] Contact number
                 * @property {Array.<signalservice.DataMessage.Contact.IEmail>|null} [email] Contact email
                 * @property {Array.<signalservice.DataMessage.Contact.IPostalAddress>|null} [address] Contact address
                 * @property {signalservice.DataMessage.Contact.IAvatar|null} [avatar] Contact avatar
                 * @property {string|null} [organization] Contact organization
                 */

                /**
                 * Constructs a new Contact.
                 * @memberof signalservice.DataMessage
                 * @classdesc Represents a Contact.
                 * @implements IContact
                 * @constructor
                 * @param {signalservice.DataMessage.IContact=} [properties] Properties to set
                 */
                function Contact(properties) {
                    this.number = [];
                    this.email = [];
                    this.address = [];
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Contact name.
                 * @member {signalservice.DataMessage.Contact.IName|null|undefined} name
                 * @memberof signalservice.DataMessage.Contact
                 * @instance
                 */
                Contact.prototype.name = null;

                /**
                 * Contact number.
                 * @member {Array.<signalservice.DataMessage.Contact.IPhone>} number
                 * @memberof signalservice.DataMessage.Contact
                 * @instance
                 */
                Contact.prototype.number = $util.emptyArray;

                /**
                 * Contact email.
                 * @member {Array.<signalservice.DataMessage.Contact.IEmail>} email
                 * @memberof signalservice.DataMessage.Contact
                 * @instance
                 */
                Contact.prototype.email = $util.emptyArray;

                /**
                 * Contact address.
                 * @member {Array.<signalservice.DataMessage.Contact.IPostalAddress>} address
                 * @memberof signalservice.DataMessage.Contact
                 * @instance
                 */
                Contact.prototype.address = $util.emptyArray;

                /**
                 * Contact avatar.
                 * @member {signalservice.DataMessage.Contact.IAvatar|null|undefined} avatar
                 * @memberof signalservice.DataMessage.Contact
                 * @instance
                 */
                Contact.prototype.avatar = null;

                /**
                 * Contact organization.
                 * @member {string} organization
                 * @memberof signalservice.DataMessage.Contact
                 * @instance
                 */
                Contact.prototype.organization = "";

                /**
                 * Creates a new Contact instance using the specified properties.
                 * @function create
                 * @memberof signalservice.DataMessage.Contact
                 * @static
                 * @param {signalservice.DataMessage.IContact=} [properties] Properties to set
                 * @returns {signalservice.DataMessage.Contact} Contact instance
                 */
                Contact.create = function create(properties) {
                    return new Contact(properties);
                };

                /**
                 * Encodes the specified Contact message. Does not implicitly {@link signalservice.DataMessage.Contact.verify|verify} messages.
                 * @function encode
                 * @memberof signalservice.DataMessage.Contact
                 * @static
                 * @param {signalservice.DataMessage.IContact} message Contact message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Contact.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.name != null && message.hasOwnProperty("name"))
                        $root.signalservice.DataMessage.Contact.Name.encode(message.name, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.number != null && message.number.length)
                        for (var i = 0; i < message.number.length; ++i)
                            $root.signalservice.DataMessage.Contact.Phone.encode(message.number[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    if (message.email != null && message.email.length)
                        for (var i = 0; i < message.email.length; ++i)
                            $root.signalservice.DataMessage.Contact.Email.encode(message.email[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                    if (message.address != null && message.address.length)
                        for (var i = 0; i < message.address.length; ++i)
                            $root.signalservice.DataMessage.Contact.PostalAddress.encode(message.address[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                    if (message.avatar != null && message.hasOwnProperty("avatar"))
                        $root.signalservice.DataMessage.Contact.Avatar.encode(message.avatar, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                    if (message.organization != null && message.hasOwnProperty("organization"))
                        writer.uint32(/* id 7, wireType 2 =*/58).string(message.organization);
                    return writer;
                };

                /**
                 * Encodes the specified Contact message, length delimited. Does not implicitly {@link signalservice.DataMessage.Contact.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof signalservice.DataMessage.Contact
                 * @static
                 * @param {signalservice.DataMessage.IContact} message Contact message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Contact.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Contact message from the specified reader or buffer.
                 * @function decode
                 * @memberof signalservice.DataMessage.Contact
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {signalservice.DataMessage.Contact} Contact
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Contact.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.DataMessage.Contact();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                message.name = $root.signalservice.DataMessage.Contact.Name.decode(reader, reader.uint32());
                                break;
                            case 3:
                                if (!(message.number && message.number.length))
                                    message.number = [];
                                message.number.push($root.signalservice.DataMessage.Contact.Phone.decode(reader, reader.uint32()));
                                break;
                            case 4:
                                if (!(message.email && message.email.length))
                                    message.email = [];
                                message.email.push($root.signalservice.DataMessage.Contact.Email.decode(reader, reader.uint32()));
                                break;
                            case 5:
                                if (!(message.address && message.address.length))
                                    message.address = [];
                                message.address.push($root.signalservice.DataMessage.Contact.PostalAddress.decode(reader, reader.uint32()));
                                break;
                            case 6:
                                message.avatar = $root.signalservice.DataMessage.Contact.Avatar.decode(reader, reader.uint32());
                                break;
                            case 7:
                                message.organization = reader.string();
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Contact message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof signalservice.DataMessage.Contact
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {signalservice.DataMessage.Contact} Contact
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Contact.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Contact message.
                 * @function verify
                 * @memberof signalservice.DataMessage.Contact
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Contact.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.name != null && message.hasOwnProperty("name")) {
                        var error = $root.signalservice.DataMessage.Contact.Name.verify(message.name);
                        if (error)
                            return "name." + error;
                    }
                    if (message.number != null && message.hasOwnProperty("number")) {
                        if (!Array.isArray(message.number))
                            return "number: array expected";
                        for (var i = 0; i < message.number.length; ++i) {
                            var error = $root.signalservice.DataMessage.Contact.Phone.verify(message.number[i]);
                            if (error)
                                return "number." + error;
                        }
                    }
                    if (message.email != null && message.hasOwnProperty("email")) {
                        if (!Array.isArray(message.email))
                            return "email: array expected";
                        for (var i = 0; i < message.email.length; ++i) {
                            var error = $root.signalservice.DataMessage.Contact.Email.verify(message.email[i]);
                            if (error)
                                return "email." + error;
                        }
                    }
                    if (message.address != null && message.hasOwnProperty("address")) {
                        if (!Array.isArray(message.address))
                            return "address: array expected";
                        for (var i = 0; i < message.address.length; ++i) {
                            var error = $root.signalservice.DataMessage.Contact.PostalAddress.verify(message.address[i]);
                            if (error)
                                return "address." + error;
                        }
                    }
                    if (message.avatar != null && message.hasOwnProperty("avatar")) {
                        var error = $root.signalservice.DataMessage.Contact.Avatar.verify(message.avatar);
                        if (error)
                            return "avatar." + error;
                    }
                    if (message.organization != null && message.hasOwnProperty("organization"))
                        if (!$util.isString(message.organization))
                            return "organization: string expected";
                    return null;
                };

                /**
                 * Creates a Contact message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof signalservice.DataMessage.Contact
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {signalservice.DataMessage.Contact} Contact
                 */
                Contact.fromObject = function fromObject(object) {
                    if (object instanceof $root.signalservice.DataMessage.Contact)
                        return object;
                    var message = new $root.signalservice.DataMessage.Contact();
                    if (object.name != null) {
                        if (typeof object.name !== "object")
                            throw TypeError(".signalservice.DataMessage.Contact.name: object expected");
                        message.name = $root.signalservice.DataMessage.Contact.Name.fromObject(object.name);
                    }
                    if (object.number) {
                        if (!Array.isArray(object.number))
                            throw TypeError(".signalservice.DataMessage.Contact.number: array expected");
                        message.number = [];
                        for (var i = 0; i < object.number.length; ++i) {
                            if (typeof object.number[i] !== "object")
                                throw TypeError(".signalservice.DataMessage.Contact.number: object expected");
                            message.number[i] = $root.signalservice.DataMessage.Contact.Phone.fromObject(object.number[i]);
                        }
                    }
                    if (object.email) {
                        if (!Array.isArray(object.email))
                            throw TypeError(".signalservice.DataMessage.Contact.email: array expected");
                        message.email = [];
                        for (var i = 0; i < object.email.length; ++i) {
                            if (typeof object.email[i] !== "object")
                                throw TypeError(".signalservice.DataMessage.Contact.email: object expected");
                            message.email[i] = $root.signalservice.DataMessage.Contact.Email.fromObject(object.email[i]);
                        }
                    }
                    if (object.address) {
                        if (!Array.isArray(object.address))
                            throw TypeError(".signalservice.DataMessage.Contact.address: array expected");
                        message.address = [];
                        for (var i = 0; i < object.address.length; ++i) {
                            if (typeof object.address[i] !== "object")
                                throw TypeError(".signalservice.DataMessage.Contact.address: object expected");
                            message.address[i] = $root.signalservice.DataMessage.Contact.PostalAddress.fromObject(object.address[i]);
                        }
                    }
                    if (object.avatar != null) {
                        if (typeof object.avatar !== "object")
                            throw TypeError(".signalservice.DataMessage.Contact.avatar: object expected");
                        message.avatar = $root.signalservice.DataMessage.Contact.Avatar.fromObject(object.avatar);
                    }
                    if (object.organization != null)
                        message.organization = String(object.organization);
                    return message;
                };

                /**
                 * Creates a plain object from a Contact message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof signalservice.DataMessage.Contact
                 * @static
                 * @param {signalservice.DataMessage.Contact} message Contact
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Contact.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.arrays || options.defaults) {
                        object.number = [];
                        object.email = [];
                        object.address = [];
                    }
                    if (options.defaults) {
                        object.name = null;
                        object.avatar = null;
                        object.organization = "";
                    }
                    if (message.name != null && message.hasOwnProperty("name"))
                        object.name = $root.signalservice.DataMessage.Contact.Name.toObject(message.name, options);
                    if (message.number && message.number.length) {
                        object.number = [];
                        for (var j = 0; j < message.number.length; ++j)
                            object.number[j] = $root.signalservice.DataMessage.Contact.Phone.toObject(message.number[j], options);
                    }
                    if (message.email && message.email.length) {
                        object.email = [];
                        for (var j = 0; j < message.email.length; ++j)
                            object.email[j] = $root.signalservice.DataMessage.Contact.Email.toObject(message.email[j], options);
                    }
                    if (message.address && message.address.length) {
                        object.address = [];
                        for (var j = 0; j < message.address.length; ++j)
                            object.address[j] = $root.signalservice.DataMessage.Contact.PostalAddress.toObject(message.address[j], options);
                    }
                    if (message.avatar != null && message.hasOwnProperty("avatar"))
                        object.avatar = $root.signalservice.DataMessage.Contact.Avatar.toObject(message.avatar, options);
                    if (message.organization != null && message.hasOwnProperty("organization"))
                        object.organization = message.organization;
                    return object;
                };

                /**
                 * Converts this Contact to JSON.
                 * @function toJSON
                 * @memberof signalservice.DataMessage.Contact
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Contact.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                Contact.Name = (function () {

                    /**
                     * Properties of a Name.
                     * @memberof signalservice.DataMessage.Contact
                     * @interface IName
                     * @property {string|null} [givenName] Name givenName
                     * @property {string|null} [familyName] Name familyName
                     * @property {string|null} [prefix] Name prefix
                     * @property {string|null} [suffix] Name suffix
                     * @property {string|null} [middleName] Name middleName
                     * @property {string|null} [displayName] Name displayName
                     */

                    /**
                     * Constructs a new Name.
                     * @memberof signalservice.DataMessage.Contact
                     * @classdesc Represents a Name.
                     * @implements IName
                     * @constructor
                     * @param {signalservice.DataMessage.Contact.IName=} [properties] Properties to set
                     */
                    function Name(properties) {
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Name givenName.
                     * @member {string} givenName
                     * @memberof signalservice.DataMessage.Contact.Name
                     * @instance
                     */
                    Name.prototype.givenName = "";

                    /**
                     * Name familyName.
                     * @member {string} familyName
                     * @memberof signalservice.DataMessage.Contact.Name
                     * @instance
                     */
                    Name.prototype.familyName = "";

                    /**
                     * Name prefix.
                     * @member {string} prefix
                     * @memberof signalservice.DataMessage.Contact.Name
                     * @instance
                     */
                    Name.prototype.prefix = "";

                    /**
                     * Name suffix.
                     * @member {string} suffix
                     * @memberof signalservice.DataMessage.Contact.Name
                     * @instance
                     */
                    Name.prototype.suffix = "";

                    /**
                     * Name middleName.
                     * @member {string} middleName
                     * @memberof signalservice.DataMessage.Contact.Name
                     * @instance
                     */
                    Name.prototype.middleName = "";

                    /**
                     * Name displayName.
                     * @member {string} displayName
                     * @memberof signalservice.DataMessage.Contact.Name
                     * @instance
                     */
                    Name.prototype.displayName = "";

                    /**
                     * Creates a new Name instance using the specified properties.
                     * @function create
                     * @memberof signalservice.DataMessage.Contact.Name
                     * @static
                     * @param {signalservice.DataMessage.Contact.IName=} [properties] Properties to set
                     * @returns {signalservice.DataMessage.Contact.Name} Name instance
                     */
                    Name.create = function create(properties) {
                        return new Name(properties);
                    };

                    /**
                     * Encodes the specified Name message. Does not implicitly {@link signalservice.DataMessage.Contact.Name.verify|verify} messages.
                     * @function encode
                     * @memberof signalservice.DataMessage.Contact.Name
                     * @static
                     * @param {signalservice.DataMessage.Contact.IName} message Name message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Name.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.givenName != null && message.hasOwnProperty("givenName"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.givenName);
                        if (message.familyName != null && message.hasOwnProperty("familyName"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.familyName);
                        if (message.prefix != null && message.hasOwnProperty("prefix"))
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.prefix);
                        if (message.suffix != null && message.hasOwnProperty("suffix"))
                            writer.uint32(/* id 4, wireType 2 =*/34).string(message.suffix);
                        if (message.middleName != null && message.hasOwnProperty("middleName"))
                            writer.uint32(/* id 5, wireType 2 =*/42).string(message.middleName);
                        if (message.displayName != null && message.hasOwnProperty("displayName"))
                            writer.uint32(/* id 6, wireType 2 =*/50).string(message.displayName);
                        return writer;
                    };

                    /**
                     * Encodes the specified Name message, length delimited. Does not implicitly {@link signalservice.DataMessage.Contact.Name.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof signalservice.DataMessage.Contact.Name
                     * @static
                     * @param {signalservice.DataMessage.Contact.IName} message Name message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Name.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a Name message from the specified reader or buffer.
                     * @function decode
                     * @memberof signalservice.DataMessage.Contact.Name
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {signalservice.DataMessage.Contact.Name} Name
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Name.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.DataMessage.Contact.Name();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                                case 1:
                                    message.givenName = reader.string();
                                    break;
                                case 2:
                                    message.familyName = reader.string();
                                    break;
                                case 3:
                                    message.prefix = reader.string();
                                    break;
                                case 4:
                                    message.suffix = reader.string();
                                    break;
                                case 5:
                                    message.middleName = reader.string();
                                    break;
                                case 6:
                                    message.displayName = reader.string();
                                    break;
                                default:
                                    reader.skipType(tag & 7);
                                    break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a Name message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof signalservice.DataMessage.Contact.Name
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {signalservice.DataMessage.Contact.Name} Name
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Name.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a Name message.
                     * @function verify
                     * @memberof signalservice.DataMessage.Contact.Name
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Name.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.givenName != null && message.hasOwnProperty("givenName"))
                            if (!$util.isString(message.givenName))
                                return "givenName: string expected";
                        if (message.familyName != null && message.hasOwnProperty("familyName"))
                            if (!$util.isString(message.familyName))
                                return "familyName: string expected";
                        if (message.prefix != null && message.hasOwnProperty("prefix"))
                            if (!$util.isString(message.prefix))
                                return "prefix: string expected";
                        if (message.suffix != null && message.hasOwnProperty("suffix"))
                            if (!$util.isString(message.suffix))
                                return "suffix: string expected";
                        if (message.middleName != null && message.hasOwnProperty("middleName"))
                            if (!$util.isString(message.middleName))
                                return "middleName: string expected";
                        if (message.displayName != null && message.hasOwnProperty("displayName"))
                            if (!$util.isString(message.displayName))
                                return "displayName: string expected";
                        return null;
                    };

                    /**
                     * Creates a Name message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof signalservice.DataMessage.Contact.Name
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {signalservice.DataMessage.Contact.Name} Name
                     */
                    Name.fromObject = function fromObject(object) {
                        if (object instanceof $root.signalservice.DataMessage.Contact.Name)
                            return object;
                        var message = new $root.signalservice.DataMessage.Contact.Name();
                        if (object.givenName != null)
                            message.givenName = String(object.givenName);
                        if (object.familyName != null)
                            message.familyName = String(object.familyName);
                        if (object.prefix != null)
                            message.prefix = String(object.prefix);
                        if (object.suffix != null)
                            message.suffix = String(object.suffix);
                        if (object.middleName != null)
                            message.middleName = String(object.middleName);
                        if (object.displayName != null)
                            message.displayName = String(object.displayName);
                        return message;
                    };

                    /**
                     * Creates a plain object from a Name message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof signalservice.DataMessage.Contact.Name
                     * @static
                     * @param {signalservice.DataMessage.Contact.Name} message Name
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Name.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.defaults) {
                            object.givenName = "";
                            object.familyName = "";
                            object.prefix = "";
                            object.suffix = "";
                            object.middleName = "";
                            object.displayName = "";
                        }
                        if (message.givenName != null && message.hasOwnProperty("givenName"))
                            object.givenName = message.givenName;
                        if (message.familyName != null && message.hasOwnProperty("familyName"))
                            object.familyName = message.familyName;
                        if (message.prefix != null && message.hasOwnProperty("prefix"))
                            object.prefix = message.prefix;
                        if (message.suffix != null && message.hasOwnProperty("suffix"))
                            object.suffix = message.suffix;
                        if (message.middleName != null && message.hasOwnProperty("middleName"))
                            object.middleName = message.middleName;
                        if (message.displayName != null && message.hasOwnProperty("displayName"))
                            object.displayName = message.displayName;
                        return object;
                    };

                    /**
                     * Converts this Name to JSON.
                     * @function toJSON
                     * @memberof signalservice.DataMessage.Contact.Name
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Name.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return Name;
                })();

                Contact.Phone = (function () {

                    /**
                     * Properties of a Phone.
                     * @memberof signalservice.DataMessage.Contact
                     * @interface IPhone
                     * @property {string|null} [value] Phone value
                     * @property {signalservice.DataMessage.Contact.Phone.Type|null} [type] Phone type
                     * @property {string|null} [label] Phone label
                     */

                    /**
                     * Constructs a new Phone.
                     * @memberof signalservice.DataMessage.Contact
                     * @classdesc Represents a Phone.
                     * @implements IPhone
                     * @constructor
                     * @param {signalservice.DataMessage.Contact.IPhone=} [properties] Properties to set
                     */
                    function Phone(properties) {
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Phone value.
                     * @member {string} value
                     * @memberof signalservice.DataMessage.Contact.Phone
                     * @instance
                     */
                    Phone.prototype.value = "";

                    /**
                     * Phone type.
                     * @member {signalservice.DataMessage.Contact.Phone.Type} type
                     * @memberof signalservice.DataMessage.Contact.Phone
                     * @instance
                     */
                    Phone.prototype.type = 1;

                    /**
                     * Phone label.
                     * @member {string} label
                     * @memberof signalservice.DataMessage.Contact.Phone
                     * @instance
                     */
                    Phone.prototype.label = "";

                    /**
                     * Creates a new Phone instance using the specified properties.
                     * @function create
                     * @memberof signalservice.DataMessage.Contact.Phone
                     * @static
                     * @param {signalservice.DataMessage.Contact.IPhone=} [properties] Properties to set
                     * @returns {signalservice.DataMessage.Contact.Phone} Phone instance
                     */
                    Phone.create = function create(properties) {
                        return new Phone(properties);
                    };

                    /**
                     * Encodes the specified Phone message. Does not implicitly {@link signalservice.DataMessage.Contact.Phone.verify|verify} messages.
                     * @function encode
                     * @memberof signalservice.DataMessage.Contact.Phone
                     * @static
                     * @param {signalservice.DataMessage.Contact.IPhone} message Phone message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Phone.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.value != null && message.hasOwnProperty("value"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.value);
                        if (message.type != null && message.hasOwnProperty("type"))
                            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.type);
                        if (message.label != null && message.hasOwnProperty("label"))
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.label);
                        return writer;
                    };

                    /**
                     * Encodes the specified Phone message, length delimited. Does not implicitly {@link signalservice.DataMessage.Contact.Phone.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof signalservice.DataMessage.Contact.Phone
                     * @static
                     * @param {signalservice.DataMessage.Contact.IPhone} message Phone message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Phone.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a Phone message from the specified reader or buffer.
                     * @function decode
                     * @memberof signalservice.DataMessage.Contact.Phone
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {signalservice.DataMessage.Contact.Phone} Phone
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Phone.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.DataMessage.Contact.Phone();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                                case 1:
                                    message.value = reader.string();
                                    break;
                                case 2:
                                    message.type = reader.int32();
                                    break;
                                case 3:
                                    message.label = reader.string();
                                    break;
                                default:
                                    reader.skipType(tag & 7);
                                    break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a Phone message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof signalservice.DataMessage.Contact.Phone
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {signalservice.DataMessage.Contact.Phone} Phone
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Phone.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a Phone message.
                     * @function verify
                     * @memberof signalservice.DataMessage.Contact.Phone
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Phone.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.value != null && message.hasOwnProperty("value"))
                            if (!$util.isString(message.value))
                                return "value: string expected";
                        if (message.type != null && message.hasOwnProperty("type"))
                            switch (message.type) {
                                default:
                                    return "type: enum value expected";
                                case 1:
                                case 2:
                                case 3:
                                case 4:
                                    break;
                            }
                        if (message.label != null && message.hasOwnProperty("label"))
                            if (!$util.isString(message.label))
                                return "label: string expected";
                        return null;
                    };

                    /**
                     * Creates a Phone message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof signalservice.DataMessage.Contact.Phone
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {signalservice.DataMessage.Contact.Phone} Phone
                     */
                    Phone.fromObject = function fromObject(object) {
                        if (object instanceof $root.signalservice.DataMessage.Contact.Phone)
                            return object;
                        var message = new $root.signalservice.DataMessage.Contact.Phone();
                        if (object.value != null)
                            message.value = String(object.value);
                        switch (object.type) {
                            case "HOME":
                            case 1:
                                message.type = 1;
                                break;
                            case "MOBILE":
                            case 2:
                                message.type = 2;
                                break;
                            case "WORK":
                            case 3:
                                message.type = 3;
                                break;
                            case "CUSTOM":
                            case 4:
                                message.type = 4;
                                break;
                        }
                        if (object.label != null)
                            message.label = String(object.label);
                        return message;
                    };

                    /**
                     * Creates a plain object from a Phone message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof signalservice.DataMessage.Contact.Phone
                     * @static
                     * @param {signalservice.DataMessage.Contact.Phone} message Phone
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Phone.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.defaults) {
                            object.value = "";
                            object.type = options.enums === String ? "HOME" : 1;
                            object.label = "";
                        }
                        if (message.value != null && message.hasOwnProperty("value"))
                            object.value = message.value;
                        if (message.type != null && message.hasOwnProperty("type"))
                            object.type = options.enums === String ? $root.signalservice.DataMessage.Contact.Phone.Type[message.type] : message.type;
                        if (message.label != null && message.hasOwnProperty("label"))
                            object.label = message.label;
                        return object;
                    };

                    /**
                     * Converts this Phone to JSON.
                     * @function toJSON
                     * @memberof signalservice.DataMessage.Contact.Phone
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Phone.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Type enum.
                     * @name signalservice.DataMessage.Contact.Phone.Type
                     * @enum {string}
                     * @property {number} HOME=1 HOME value
                     * @property {number} MOBILE=2 MOBILE value
                     * @property {number} WORK=3 WORK value
                     * @property {number} CUSTOM=4 CUSTOM value
                     */
                    Phone.Type = (function () {
                        var valuesById = {}, values = Object.create(valuesById);
                        values[valuesById[1] = "HOME"] = 1;
                        values[valuesById[2] = "MOBILE"] = 2;
                        values[valuesById[3] = "WORK"] = 3;
                        values[valuesById[4] = "CUSTOM"] = 4;
                        return values;
                    })();

                    return Phone;
                })();

                Contact.Email = (function () {

                    /**
                     * Properties of an Email.
                     * @memberof signalservice.DataMessage.Contact
                     * @interface IEmail
                     * @property {string|null} [value] Email value
                     * @property {signalservice.DataMessage.Contact.Email.Type|null} [type] Email type
                     * @property {string|null} [label] Email label
                     */

                    /**
                     * Constructs a new Email.
                     * @memberof signalservice.DataMessage.Contact
                     * @classdesc Represents an Email.
                     * @implements IEmail
                     * @constructor
                     * @param {signalservice.DataMessage.Contact.IEmail=} [properties] Properties to set
                     */
                    function Email(properties) {
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Email value.
                     * @member {string} value
                     * @memberof signalservice.DataMessage.Contact.Email
                     * @instance
                     */
                    Email.prototype.value = "";

                    /**
                     * Email type.
                     * @member {signalservice.DataMessage.Contact.Email.Type} type
                     * @memberof signalservice.DataMessage.Contact.Email
                     * @instance
                     */
                    Email.prototype.type = 1;

                    /**
                     * Email label.
                     * @member {string} label
                     * @memberof signalservice.DataMessage.Contact.Email
                     * @instance
                     */
                    Email.prototype.label = "";

                    /**
                     * Creates a new Email instance using the specified properties.
                     * @function create
                     * @memberof signalservice.DataMessage.Contact.Email
                     * @static
                     * @param {signalservice.DataMessage.Contact.IEmail=} [properties] Properties to set
                     * @returns {signalservice.DataMessage.Contact.Email} Email instance
                     */
                    Email.create = function create(properties) {
                        return new Email(properties);
                    };

                    /**
                     * Encodes the specified Email message. Does not implicitly {@link signalservice.DataMessage.Contact.Email.verify|verify} messages.
                     * @function encode
                     * @memberof signalservice.DataMessage.Contact.Email
                     * @static
                     * @param {signalservice.DataMessage.Contact.IEmail} message Email message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Email.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.value != null && message.hasOwnProperty("value"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.value);
                        if (message.type != null && message.hasOwnProperty("type"))
                            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.type);
                        if (message.label != null && message.hasOwnProperty("label"))
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.label);
                        return writer;
                    };

                    /**
                     * Encodes the specified Email message, length delimited. Does not implicitly {@link signalservice.DataMessage.Contact.Email.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof signalservice.DataMessage.Contact.Email
                     * @static
                     * @param {signalservice.DataMessage.Contact.IEmail} message Email message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Email.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes an Email message from the specified reader or buffer.
                     * @function decode
                     * @memberof signalservice.DataMessage.Contact.Email
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {signalservice.DataMessage.Contact.Email} Email
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Email.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.DataMessage.Contact.Email();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                                case 1:
                                    message.value = reader.string();
                                    break;
                                case 2:
                                    message.type = reader.int32();
                                    break;
                                case 3:
                                    message.label = reader.string();
                                    break;
                                default:
                                    reader.skipType(tag & 7);
                                    break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes an Email message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof signalservice.DataMessage.Contact.Email
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {signalservice.DataMessage.Contact.Email} Email
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Email.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies an Email message.
                     * @function verify
                     * @memberof signalservice.DataMessage.Contact.Email
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Email.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.value != null && message.hasOwnProperty("value"))
                            if (!$util.isString(message.value))
                                return "value: string expected";
                        if (message.type != null && message.hasOwnProperty("type"))
                            switch (message.type) {
                                default:
                                    return "type: enum value expected";
                                case 1:
                                case 2:
                                case 3:
                                case 4:
                                    break;
                            }
                        if (message.label != null && message.hasOwnProperty("label"))
                            if (!$util.isString(message.label))
                                return "label: string expected";
                        return null;
                    };

                    /**
                     * Creates an Email message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof signalservice.DataMessage.Contact.Email
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {signalservice.DataMessage.Contact.Email} Email
                     */
                    Email.fromObject = function fromObject(object) {
                        if (object instanceof $root.signalservice.DataMessage.Contact.Email)
                            return object;
                        var message = new $root.signalservice.DataMessage.Contact.Email();
                        if (object.value != null)
                            message.value = String(object.value);
                        switch (object.type) {
                            case "HOME":
                            case 1:
                                message.type = 1;
                                break;
                            case "MOBILE":
                            case 2:
                                message.type = 2;
                                break;
                            case "WORK":
                            case 3:
                                message.type = 3;
                                break;
                            case "CUSTOM":
                            case 4:
                                message.type = 4;
                                break;
                        }
                        if (object.label != null)
                            message.label = String(object.label);
                        return message;
                    };

                    /**
                     * Creates a plain object from an Email message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof signalservice.DataMessage.Contact.Email
                     * @static
                     * @param {signalservice.DataMessage.Contact.Email} message Email
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Email.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.defaults) {
                            object.value = "";
                            object.type = options.enums === String ? "HOME" : 1;
                            object.label = "";
                        }
                        if (message.value != null && message.hasOwnProperty("value"))
                            object.value = message.value;
                        if (message.type != null && message.hasOwnProperty("type"))
                            object.type = options.enums === String ? $root.signalservice.DataMessage.Contact.Email.Type[message.type] : message.type;
                        if (message.label != null && message.hasOwnProperty("label"))
                            object.label = message.label;
                        return object;
                    };

                    /**
                     * Converts this Email to JSON.
                     * @function toJSON
                     * @memberof signalservice.DataMessage.Contact.Email
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Email.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Type enum.
                     * @name signalservice.DataMessage.Contact.Email.Type
                     * @enum {string}
                     * @property {number} HOME=1 HOME value
                     * @property {number} MOBILE=2 MOBILE value
                     * @property {number} WORK=3 WORK value
                     * @property {number} CUSTOM=4 CUSTOM value
                     */
                    Email.Type = (function () {
                        var valuesById = {}, values = Object.create(valuesById);
                        values[valuesById[1] = "HOME"] = 1;
                        values[valuesById[2] = "MOBILE"] = 2;
                        values[valuesById[3] = "WORK"] = 3;
                        values[valuesById[4] = "CUSTOM"] = 4;
                        return values;
                    })();

                    return Email;
                })();

                Contact.PostalAddress = (function () {

                    /**
                     * Properties of a PostalAddress.
                     * @memberof signalservice.DataMessage.Contact
                     * @interface IPostalAddress
                     * @property {signalservice.DataMessage.Contact.PostalAddress.Type|null} [type] PostalAddress type
                     * @property {string|null} [label] PostalAddress label
                     * @property {string|null} [street] PostalAddress street
                     * @property {string|null} [pobox] PostalAddress pobox
                     * @property {string|null} [neighborhood] PostalAddress neighborhood
                     * @property {string|null} [city] PostalAddress city
                     * @property {string|null} [region] PostalAddress region
                     * @property {string|null} [postcode] PostalAddress postcode
                     * @property {string|null} [country] PostalAddress country
                     */

                    /**
                     * Constructs a new PostalAddress.
                     * @memberof signalservice.DataMessage.Contact
                     * @classdesc Represents a PostalAddress.
                     * @implements IPostalAddress
                     * @constructor
                     * @param {signalservice.DataMessage.Contact.IPostalAddress=} [properties] Properties to set
                     */
                    function PostalAddress(properties) {
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * PostalAddress type.
                     * @member {signalservice.DataMessage.Contact.PostalAddress.Type} type
                     * @memberof signalservice.DataMessage.Contact.PostalAddress
                     * @instance
                     */
                    PostalAddress.prototype.type = 1;

                    /**
                     * PostalAddress label.
                     * @member {string} label
                     * @memberof signalservice.DataMessage.Contact.PostalAddress
                     * @instance
                     */
                    PostalAddress.prototype.label = "";

                    /**
                     * PostalAddress street.
                     * @member {string} street
                     * @memberof signalservice.DataMessage.Contact.PostalAddress
                     * @instance
                     */
                    PostalAddress.prototype.street = "";

                    /**
                     * PostalAddress pobox.
                     * @member {string} pobox
                     * @memberof signalservice.DataMessage.Contact.PostalAddress
                     * @instance
                     */
                    PostalAddress.prototype.pobox = "";

                    /**
                     * PostalAddress neighborhood.
                     * @member {string} neighborhood
                     * @memberof signalservice.DataMessage.Contact.PostalAddress
                     * @instance
                     */
                    PostalAddress.prototype.neighborhood = "";

                    /**
                     * PostalAddress city.
                     * @member {string} city
                     * @memberof signalservice.DataMessage.Contact.PostalAddress
                     * @instance
                     */
                    PostalAddress.prototype.city = "";

                    /**
                     * PostalAddress region.
                     * @member {string} region
                     * @memberof signalservice.DataMessage.Contact.PostalAddress
                     * @instance
                     */
                    PostalAddress.prototype.region = "";

                    /**
                     * PostalAddress postcode.
                     * @member {string} postcode
                     * @memberof signalservice.DataMessage.Contact.PostalAddress
                     * @instance
                     */
                    PostalAddress.prototype.postcode = "";

                    /**
                     * PostalAddress country.
                     * @member {string} country
                     * @memberof signalservice.DataMessage.Contact.PostalAddress
                     * @instance
                     */
                    PostalAddress.prototype.country = "";

                    /**
                     * Creates a new PostalAddress instance using the specified properties.
                     * @function create
                     * @memberof signalservice.DataMessage.Contact.PostalAddress
                     * @static
                     * @param {signalservice.DataMessage.Contact.IPostalAddress=} [properties] Properties to set
                     * @returns {signalservice.DataMessage.Contact.PostalAddress} PostalAddress instance
                     */
                    PostalAddress.create = function create(properties) {
                        return new PostalAddress(properties);
                    };

                    /**
                     * Encodes the specified PostalAddress message. Does not implicitly {@link signalservice.DataMessage.Contact.PostalAddress.verify|verify} messages.
                     * @function encode
                     * @memberof signalservice.DataMessage.Contact.PostalAddress
                     * @static
                     * @param {signalservice.DataMessage.Contact.IPostalAddress} message PostalAddress message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    PostalAddress.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.type != null && message.hasOwnProperty("type"))
                            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
                        if (message.label != null && message.hasOwnProperty("label"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.label);
                        if (message.street != null && message.hasOwnProperty("street"))
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.street);
                        if (message.pobox != null && message.hasOwnProperty("pobox"))
                            writer.uint32(/* id 4, wireType 2 =*/34).string(message.pobox);
                        if (message.neighborhood != null && message.hasOwnProperty("neighborhood"))
                            writer.uint32(/* id 5, wireType 2 =*/42).string(message.neighborhood);
                        if (message.city != null && message.hasOwnProperty("city"))
                            writer.uint32(/* id 6, wireType 2 =*/50).string(message.city);
                        if (message.region != null && message.hasOwnProperty("region"))
                            writer.uint32(/* id 7, wireType 2 =*/58).string(message.region);
                        if (message.postcode != null && message.hasOwnProperty("postcode"))
                            writer.uint32(/* id 8, wireType 2 =*/66).string(message.postcode);
                        if (message.country != null && message.hasOwnProperty("country"))
                            writer.uint32(/* id 9, wireType 2 =*/74).string(message.country);
                        return writer;
                    };

                    /**
                     * Encodes the specified PostalAddress message, length delimited. Does not implicitly {@link signalservice.DataMessage.Contact.PostalAddress.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof signalservice.DataMessage.Contact.PostalAddress
                     * @static
                     * @param {signalservice.DataMessage.Contact.IPostalAddress} message PostalAddress message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    PostalAddress.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a PostalAddress message from the specified reader or buffer.
                     * @function decode
                     * @memberof signalservice.DataMessage.Contact.PostalAddress
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {signalservice.DataMessage.Contact.PostalAddress} PostalAddress
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    PostalAddress.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.DataMessage.Contact.PostalAddress();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                                case 1:
                                    message.type = reader.int32();
                                    break;
                                case 2:
                                    message.label = reader.string();
                                    break;
                                case 3:
                                    message.street = reader.string();
                                    break;
                                case 4:
                                    message.pobox = reader.string();
                                    break;
                                case 5:
                                    message.neighborhood = reader.string();
                                    break;
                                case 6:
                                    message.city = reader.string();
                                    break;
                                case 7:
                                    message.region = reader.string();
                                    break;
                                case 8:
                                    message.postcode = reader.string();
                                    break;
                                case 9:
                                    message.country = reader.string();
                                    break;
                                default:
                                    reader.skipType(tag & 7);
                                    break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a PostalAddress message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof signalservice.DataMessage.Contact.PostalAddress
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {signalservice.DataMessage.Contact.PostalAddress} PostalAddress
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    PostalAddress.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a PostalAddress message.
                     * @function verify
                     * @memberof signalservice.DataMessage.Contact.PostalAddress
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    PostalAddress.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.type != null && message.hasOwnProperty("type"))
                            switch (message.type) {
                                default:
                                    return "type: enum value expected";
                                case 1:
                                case 2:
                                case 3:
                                    break;
                            }
                        if (message.label != null && message.hasOwnProperty("label"))
                            if (!$util.isString(message.label))
                                return "label: string expected";
                        if (message.street != null && message.hasOwnProperty("street"))
                            if (!$util.isString(message.street))
                                return "street: string expected";
                        if (message.pobox != null && message.hasOwnProperty("pobox"))
                            if (!$util.isString(message.pobox))
                                return "pobox: string expected";
                        if (message.neighborhood != null && message.hasOwnProperty("neighborhood"))
                            if (!$util.isString(message.neighborhood))
                                return "neighborhood: string expected";
                        if (message.city != null && message.hasOwnProperty("city"))
                            if (!$util.isString(message.city))
                                return "city: string expected";
                        if (message.region != null && message.hasOwnProperty("region"))
                            if (!$util.isString(message.region))
                                return "region: string expected";
                        if (message.postcode != null && message.hasOwnProperty("postcode"))
                            if (!$util.isString(message.postcode))
                                return "postcode: string expected";
                        if (message.country != null && message.hasOwnProperty("country"))
                            if (!$util.isString(message.country))
                                return "country: string expected";
                        return null;
                    };

                    /**
                     * Creates a PostalAddress message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof signalservice.DataMessage.Contact.PostalAddress
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {signalservice.DataMessage.Contact.PostalAddress} PostalAddress
                     */
                    PostalAddress.fromObject = function fromObject(object) {
                        if (object instanceof $root.signalservice.DataMessage.Contact.PostalAddress)
                            return object;
                        var message = new $root.signalservice.DataMessage.Contact.PostalAddress();
                        switch (object.type) {
                            case "HOME":
                            case 1:
                                message.type = 1;
                                break;
                            case "WORK":
                            case 2:
                                message.type = 2;
                                break;
                            case "CUSTOM":
                            case 3:
                                message.type = 3;
                                break;
                        }
                        if (object.label != null)
                            message.label = String(object.label);
                        if (object.street != null)
                            message.street = String(object.street);
                        if (object.pobox != null)
                            message.pobox = String(object.pobox);
                        if (object.neighborhood != null)
                            message.neighborhood = String(object.neighborhood);
                        if (object.city != null)
                            message.city = String(object.city);
                        if (object.region != null)
                            message.region = String(object.region);
                        if (object.postcode != null)
                            message.postcode = String(object.postcode);
                        if (object.country != null)
                            message.country = String(object.country);
                        return message;
                    };

                    /**
                     * Creates a plain object from a PostalAddress message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof signalservice.DataMessage.Contact.PostalAddress
                     * @static
                     * @param {signalservice.DataMessage.Contact.PostalAddress} message PostalAddress
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    PostalAddress.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.defaults) {
                            object.type = options.enums === String ? "HOME" : 1;
                            object.label = "";
                            object.street = "";
                            object.pobox = "";
                            object.neighborhood = "";
                            object.city = "";
                            object.region = "";
                            object.postcode = "";
                            object.country = "";
                        }
                        if (message.type != null && message.hasOwnProperty("type"))
                            object.type = options.enums === String ? $root.signalservice.DataMessage.Contact.PostalAddress.Type[message.type] : message.type;
                        if (message.label != null && message.hasOwnProperty("label"))
                            object.label = message.label;
                        if (message.street != null && message.hasOwnProperty("street"))
                            object.street = message.street;
                        if (message.pobox != null && message.hasOwnProperty("pobox"))
                            object.pobox = message.pobox;
                        if (message.neighborhood != null && message.hasOwnProperty("neighborhood"))
                            object.neighborhood = message.neighborhood;
                        if (message.city != null && message.hasOwnProperty("city"))
                            object.city = message.city;
                        if (message.region != null && message.hasOwnProperty("region"))
                            object.region = message.region;
                        if (message.postcode != null && message.hasOwnProperty("postcode"))
                            object.postcode = message.postcode;
                        if (message.country != null && message.hasOwnProperty("country"))
                            object.country = message.country;
                        return object;
                    };

                    /**
                     * Converts this PostalAddress to JSON.
                     * @function toJSON
                     * @memberof signalservice.DataMessage.Contact.PostalAddress
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    PostalAddress.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Type enum.
                     * @name signalservice.DataMessage.Contact.PostalAddress.Type
                     * @enum {string}
                     * @property {number} HOME=1 HOME value
                     * @property {number} WORK=2 WORK value
                     * @property {number} CUSTOM=3 CUSTOM value
                     */
                    PostalAddress.Type = (function () {
                        var valuesById = {}, values = Object.create(valuesById);
                        values[valuesById[1] = "HOME"] = 1;
                        values[valuesById[2] = "WORK"] = 2;
                        values[valuesById[3] = "CUSTOM"] = 3;
                        return values;
                    })();

                    return PostalAddress;
                })();

                Contact.Avatar = (function () {

                    /**
                     * Properties of an Avatar.
                     * @memberof signalservice.DataMessage.Contact
                     * @interface IAvatar
                     * @property {signalservice.IAttachmentPointer|null} [avatar] Avatar avatar
                     * @property {boolean|null} [isProfile] Avatar isProfile
                     */

                    /**
                     * Constructs a new Avatar.
                     * @memberof signalservice.DataMessage.Contact
                     * @classdesc Represents an Avatar.
                     * @implements IAvatar
                     * @constructor
                     * @param {signalservice.DataMessage.Contact.IAvatar=} [properties] Properties to set
                     */
                    function Avatar(properties) {
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Avatar avatar.
                     * @member {signalservice.IAttachmentPointer|null|undefined} avatar
                     * @memberof signalservice.DataMessage.Contact.Avatar
                     * @instance
                     */
                    Avatar.prototype.avatar = null;

                    /**
                     * Avatar isProfile.
                     * @member {boolean} isProfile
                     * @memberof signalservice.DataMessage.Contact.Avatar
                     * @instance
                     */
                    Avatar.prototype.isProfile = false;

                    /**
                     * Creates a new Avatar instance using the specified properties.
                     * @function create
                     * @memberof signalservice.DataMessage.Contact.Avatar
                     * @static
                     * @param {signalservice.DataMessage.Contact.IAvatar=} [properties] Properties to set
                     * @returns {signalservice.DataMessage.Contact.Avatar} Avatar instance
                     */
                    Avatar.create = function create(properties) {
                        return new Avatar(properties);
                    };

                    /**
                     * Encodes the specified Avatar message. Does not implicitly {@link signalservice.DataMessage.Contact.Avatar.verify|verify} messages.
                     * @function encode
                     * @memberof signalservice.DataMessage.Contact.Avatar
                     * @static
                     * @param {signalservice.DataMessage.Contact.IAvatar} message Avatar message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Avatar.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.avatar != null && message.hasOwnProperty("avatar"))
                            $root.signalservice.AttachmentPointer.encode(message.avatar, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        if (message.isProfile != null && message.hasOwnProperty("isProfile"))
                            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.isProfile);
                        return writer;
                    };

                    /**
                     * Encodes the specified Avatar message, length delimited. Does not implicitly {@link signalservice.DataMessage.Contact.Avatar.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof signalservice.DataMessage.Contact.Avatar
                     * @static
                     * @param {signalservice.DataMessage.Contact.IAvatar} message Avatar message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Avatar.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes an Avatar message from the specified reader or buffer.
                     * @function decode
                     * @memberof signalservice.DataMessage.Contact.Avatar
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {signalservice.DataMessage.Contact.Avatar} Avatar
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Avatar.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.DataMessage.Contact.Avatar();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                                case 1:
                                    message.avatar = $root.signalservice.AttachmentPointer.decode(reader, reader.uint32());
                                    break;
                                case 2:
                                    message.isProfile = reader.bool();
                                    break;
                                default:
                                    reader.skipType(tag & 7);
                                    break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes an Avatar message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof signalservice.DataMessage.Contact.Avatar
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {signalservice.DataMessage.Contact.Avatar} Avatar
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Avatar.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies an Avatar message.
                     * @function verify
                     * @memberof signalservice.DataMessage.Contact.Avatar
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Avatar.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.avatar != null && message.hasOwnProperty("avatar")) {
                            var error = $root.signalservice.AttachmentPointer.verify(message.avatar);
                            if (error)
                                return "avatar." + error;
                        }
                        if (message.isProfile != null && message.hasOwnProperty("isProfile"))
                            if (typeof message.isProfile !== "boolean")
                                return "isProfile: boolean expected";
                        return null;
                    };

                    /**
                     * Creates an Avatar message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof signalservice.DataMessage.Contact.Avatar
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {signalservice.DataMessage.Contact.Avatar} Avatar
                     */
                    Avatar.fromObject = function fromObject(object) {
                        if (object instanceof $root.signalservice.DataMessage.Contact.Avatar)
                            return object;
                        var message = new $root.signalservice.DataMessage.Contact.Avatar();
                        if (object.avatar != null) {
                            if (typeof object.avatar !== "object")
                                throw TypeError(".signalservice.DataMessage.Contact.Avatar.avatar: object expected");
                            message.avatar = $root.signalservice.AttachmentPointer.fromObject(object.avatar);
                        }
                        if (object.isProfile != null)
                            message.isProfile = Boolean(object.isProfile);
                        return message;
                    };

                    /**
                     * Creates a plain object from an Avatar message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof signalservice.DataMessage.Contact.Avatar
                     * @static
                     * @param {signalservice.DataMessage.Contact.Avatar} message Avatar
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Avatar.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.defaults) {
                            object.avatar = null;
                            object.isProfile = false;
                        }
                        if (message.avatar != null && message.hasOwnProperty("avatar"))
                            object.avatar = $root.signalservice.AttachmentPointer.toObject(message.avatar, options);
                        if (message.isProfile != null && message.hasOwnProperty("isProfile"))
                            object.isProfile = message.isProfile;
                        return object;
                    };

                    /**
                     * Converts this Avatar to JSON.
                     * @function toJSON
                     * @memberof signalservice.DataMessage.Contact.Avatar
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Avatar.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    return Avatar;
                })();

                return Contact;
            })();

            return DataMessage;
        })();

        signalservice.NullMessage = (function () {

            /**
             * Properties of a NullMessage.
             * @memberof signalservice
             * @interface INullMessage
             * @property {Uint8Array|null} [padding] NullMessage padding
             */

            /**
             * Constructs a new NullMessage.
             * @memberof signalservice
             * @classdesc Represents a NullMessage.
             * @implements INullMessage
             * @constructor
             * @param {signalservice.INullMessage=} [properties] Properties to set
             */
            function NullMessage(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * NullMessage padding.
             * @member {Uint8Array} padding
             * @memberof signalservice.NullMessage
             * @instance
             */
            NullMessage.prototype.padding = $util.newBuffer([]);

            /**
             * Creates a new NullMessage instance using the specified properties.
             * @function create
             * @memberof signalservice.NullMessage
             * @static
             * @param {signalservice.INullMessage=} [properties] Properties to set
             * @returns {signalservice.NullMessage} NullMessage instance
             */
            NullMessage.create = function create(properties) {
                return new NullMessage(properties);
            };

            /**
             * Encodes the specified NullMessage message. Does not implicitly {@link signalservice.NullMessage.verify|verify} messages.
             * @function encode
             * @memberof signalservice.NullMessage
             * @static
             * @param {signalservice.INullMessage} message NullMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            NullMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.padding != null && message.hasOwnProperty("padding"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.padding);
                return writer;
            };

            /**
             * Encodes the specified NullMessage message, length delimited. Does not implicitly {@link signalservice.NullMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof signalservice.NullMessage
             * @static
             * @param {signalservice.INullMessage} message NullMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            NullMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a NullMessage message from the specified reader or buffer.
             * @function decode
             * @memberof signalservice.NullMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {signalservice.NullMessage} NullMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            NullMessage.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.NullMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            message.padding = reader.bytes();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return message;
            };

            /**
             * Decodes a NullMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof signalservice.NullMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {signalservice.NullMessage} NullMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            NullMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a NullMessage message.
             * @function verify
             * @memberof signalservice.NullMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            NullMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.padding != null && message.hasOwnProperty("padding"))
                    if (!(message.padding && typeof message.padding.length === "number" || $util.isString(message.padding)))
                        return "padding: buffer expected";
                return null;
            };

            /**
             * Creates a NullMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof signalservice.NullMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {signalservice.NullMessage} NullMessage
             */
            NullMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.signalservice.NullMessage)
                    return object;
                var message = new $root.signalservice.NullMessage();
                if (object.padding != null)
                    if (typeof object.padding === "string")
                        $util.base64.decode(object.padding, message.padding = $util.newBuffer($util.base64.length(object.padding)), 0);
                    else if (object.padding.length)
                        message.padding = object.padding;
                return message;
            };

            /**
             * Creates a plain object from a NullMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof signalservice.NullMessage
             * @static
             * @param {signalservice.NullMessage} message NullMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            NullMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.padding = options.bytes === String ? "" : [];
                if (message.padding != null && message.hasOwnProperty("padding"))
                    object.padding = options.bytes === String ? $util.base64.encode(message.padding, 0, message.padding.length) : options.bytes === Array ? Array.prototype.slice.call(message.padding) : message.padding;
                return object;
            };

            /**
             * Converts this NullMessage to JSON.
             * @function toJSON
             * @memberof signalservice.NullMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            NullMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return NullMessage;
        })();

        signalservice.ReceiptMessage = (function () {

            /**
             * Properties of a ReceiptMessage.
             * @memberof signalservice
             * @interface IReceiptMessage
             * @property {signalservice.ReceiptMessage.Type|null} [type] ReceiptMessage type
             * @property {Array.<number|Long>|null} [timestamp] ReceiptMessage timestamp
             */

            /**
             * Constructs a new ReceiptMessage.
             * @memberof signalservice
             * @classdesc Represents a ReceiptMessage.
             * @implements IReceiptMessage
             * @constructor
             * @param {signalservice.IReceiptMessage=} [properties] Properties to set
             */
            function ReceiptMessage(properties) {
                this.timestamp = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ReceiptMessage type.
             * @member {signalservice.ReceiptMessage.Type} type
             * @memberof signalservice.ReceiptMessage
             * @instance
             */
            ReceiptMessage.prototype.type = 0;

            /**
             * ReceiptMessage timestamp.
             * @member {Array.<number|Long>} timestamp
             * @memberof signalservice.ReceiptMessage
             * @instance
             */
            ReceiptMessage.prototype.timestamp = $util.emptyArray;

            /**
             * Creates a new ReceiptMessage instance using the specified properties.
             * @function create
             * @memberof signalservice.ReceiptMessage
             * @static
             * @param {signalservice.IReceiptMessage=} [properties] Properties to set
             * @returns {signalservice.ReceiptMessage} ReceiptMessage instance
             */
            ReceiptMessage.create = function create(properties) {
                return new ReceiptMessage(properties);
            };

            /**
             * Encodes the specified ReceiptMessage message. Does not implicitly {@link signalservice.ReceiptMessage.verify|verify} messages.
             * @function encode
             * @memberof signalservice.ReceiptMessage
             * @static
             * @param {signalservice.IReceiptMessage} message ReceiptMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ReceiptMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.type != null && message.hasOwnProperty("type"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
                if (message.timestamp != null && message.timestamp.length)
                    for (var i = 0; i < message.timestamp.length; ++i)
                        writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.timestamp[i]);
                return writer;
            };

            /**
             * Encodes the specified ReceiptMessage message, length delimited. Does not implicitly {@link signalservice.ReceiptMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof signalservice.ReceiptMessage
             * @static
             * @param {signalservice.IReceiptMessage} message ReceiptMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ReceiptMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ReceiptMessage message from the specified reader or buffer.
             * @function decode
             * @memberof signalservice.ReceiptMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {signalservice.ReceiptMessage} ReceiptMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ReceiptMessage.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.ReceiptMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            message.type = reader.int32();
                            break;
                        case 2:
                            if (!(message.timestamp && message.timestamp.length))
                                message.timestamp = [];
                            if ((tag & 7) === 2) {
                                var end2 = reader.uint32() + reader.pos;
                                while (reader.pos < end2)
                                    message.timestamp.push(reader.uint64());
                            } else
                                message.timestamp.push(reader.uint64());
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ReceiptMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof signalservice.ReceiptMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {signalservice.ReceiptMessage} ReceiptMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ReceiptMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ReceiptMessage message.
             * @function verify
             * @memberof signalservice.ReceiptMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ReceiptMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    switch (message.type) {
                        default:
                            return "type: enum value expected";
                        case 0:
                        case 1:
                            break;
                    }
                if (message.timestamp != null && message.hasOwnProperty("timestamp")) {
                    if (!Array.isArray(message.timestamp))
                        return "timestamp: array expected";
                    for (var i = 0; i < message.timestamp.length; ++i)
                        if (!$util.isInteger(message.timestamp[i]) && !(message.timestamp[i] && $util.isInteger(message.timestamp[i].low) && $util.isInteger(message.timestamp[i].high)))
                            return "timestamp: integer|Long[] expected";
                }
                return null;
            };

            /**
             * Creates a ReceiptMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof signalservice.ReceiptMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {signalservice.ReceiptMessage} ReceiptMessage
             */
            ReceiptMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.signalservice.ReceiptMessage)
                    return object;
                var message = new $root.signalservice.ReceiptMessage();
                switch (object.type) {
                    case "DELIVERY":
                    case 0:
                        message.type = 0;
                        break;
                    case "READ":
                    case 1:
                        message.type = 1;
                        break;
                }
                if (object.timestamp) {
                    if (!Array.isArray(object.timestamp))
                        throw TypeError(".signalservice.ReceiptMessage.timestamp: array expected");
                    message.timestamp = [];
                    for (var i = 0; i < object.timestamp.length; ++i)
                        if ($util.Long)
                            (message.timestamp[i] = $util.Long.fromValue(object.timestamp[i])).unsigned = true;
                        else if (typeof object.timestamp[i] === "string")
                            message.timestamp[i] = parseInt(object.timestamp[i], 10);
                        else if (typeof object.timestamp[i] === "number")
                            message.timestamp[i] = object.timestamp[i];
                        else if (typeof object.timestamp[i] === "object")
                            message.timestamp[i] = new $util.LongBits(object.timestamp[i].low >>> 0, object.timestamp[i].high >>> 0).toNumber(true);
                }
                return message;
            };

            /**
             * Creates a plain object from a ReceiptMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof signalservice.ReceiptMessage
             * @static
             * @param {signalservice.ReceiptMessage} message ReceiptMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ReceiptMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.timestamp = [];
                if (options.defaults)
                    object.type = options.enums === String ? "DELIVERY" : 0;
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.signalservice.ReceiptMessage.Type[message.type] : message.type;
                if (message.timestamp && message.timestamp.length) {
                    object.timestamp = [];
                    for (var j = 0; j < message.timestamp.length; ++j)
                        if (typeof message.timestamp[j] === "number")
                            object.timestamp[j] = options.longs === String ? String(message.timestamp[j]) : message.timestamp[j];
                        else
                            object.timestamp[j] = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp[j]) : options.longs === Number ? new $util.LongBits(message.timestamp[j].low >>> 0, message.timestamp[j].high >>> 0).toNumber(true) : message.timestamp[j];
                }
                return object;
            };

            /**
             * Converts this ReceiptMessage to JSON.
             * @function toJSON
             * @memberof signalservice.ReceiptMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ReceiptMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Type enum.
             * @name signalservice.ReceiptMessage.Type
             * @enum {string}
             * @property {number} DELIVERY=0 DELIVERY value
             * @property {number} READ=1 READ value
             */
            ReceiptMessage.Type = (function () {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "DELIVERY"] = 0;
                values[valuesById[1] = "READ"] = 1;
                return values;
            })();

            return ReceiptMessage;
        })();

        signalservice.Verified = (function () {

            /**
             * Properties of a Verified.
             * @memberof signalservice
             * @interface IVerified
             * @property {string|null} [destination] Verified destination
             * @property {Uint8Array|null} [identityKey] Verified identityKey
             * @property {signalservice.Verified.State|null} [state] Verified state
             * @property {Uint8Array|null} [nullMessage] Verified nullMessage
             */

            /**
             * Constructs a new Verified.
             * @memberof signalservice
             * @classdesc Represents a Verified.
             * @implements IVerified
             * @constructor
             * @param {signalservice.IVerified=} [properties] Properties to set
             */
            function Verified(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Verified destination.
             * @member {string} destination
             * @memberof signalservice.Verified
             * @instance
             */
            Verified.prototype.destination = "";

            /**
             * Verified identityKey.
             * @member {Uint8Array} identityKey
             * @memberof signalservice.Verified
             * @instance
             */
            Verified.prototype.identityKey = $util.newBuffer([]);

            /**
             * Verified state.
             * @member {signalservice.Verified.State} state
             * @memberof signalservice.Verified
             * @instance
             */
            Verified.prototype.state = 0;

            /**
             * Verified nullMessage.
             * @member {Uint8Array} nullMessage
             * @memberof signalservice.Verified
             * @instance
             */
            Verified.prototype.nullMessage = $util.newBuffer([]);

            /**
             * Creates a new Verified instance using the specified properties.
             * @function create
             * @memberof signalservice.Verified
             * @static
             * @param {signalservice.IVerified=} [properties] Properties to set
             * @returns {signalservice.Verified} Verified instance
             */
            Verified.create = function create(properties) {
                return new Verified(properties);
            };

            /**
             * Encodes the specified Verified message. Does not implicitly {@link signalservice.Verified.verify|verify} messages.
             * @function encode
             * @memberof signalservice.Verified
             * @static
             * @param {signalservice.IVerified} message Verified message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Verified.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.destination != null && message.hasOwnProperty("destination"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.destination);
                if (message.identityKey != null && message.hasOwnProperty("identityKey"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.identityKey);
                if (message.state != null && message.hasOwnProperty("state"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.state);
                if (message.nullMessage != null && message.hasOwnProperty("nullMessage"))
                    writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.nullMessage);
                return writer;
            };

            /**
             * Encodes the specified Verified message, length delimited. Does not implicitly {@link signalservice.Verified.verify|verify} messages.
             * @function encodeDelimited
             * @memberof signalservice.Verified
             * @static
             * @param {signalservice.IVerified} message Verified message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Verified.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Verified message from the specified reader or buffer.
             * @function decode
             * @memberof signalservice.Verified
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {signalservice.Verified} Verified
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Verified.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.Verified();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            message.destination = reader.string();
                            break;
                        case 2:
                            message.identityKey = reader.bytes();
                            break;
                        case 3:
                            message.state = reader.int32();
                            break;
                        case 4:
                            message.nullMessage = reader.bytes();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Verified message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof signalservice.Verified
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {signalservice.Verified} Verified
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Verified.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Verified message.
             * @function verify
             * @memberof signalservice.Verified
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Verified.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.destination != null && message.hasOwnProperty("destination"))
                    if (!$util.isString(message.destination))
                        return "destination: string expected";
                if (message.identityKey != null && message.hasOwnProperty("identityKey"))
                    if (!(message.identityKey && typeof message.identityKey.length === "number" || $util.isString(message.identityKey)))
                        return "identityKey: buffer expected";
                if (message.state != null && message.hasOwnProperty("state"))
                    switch (message.state) {
                        default:
                            return "state: enum value expected";
                        case 0:
                        case 1:
                        case 2:
                            break;
                    }
                if (message.nullMessage != null && message.hasOwnProperty("nullMessage"))
                    if (!(message.nullMessage && typeof message.nullMessage.length === "number" || $util.isString(message.nullMessage)))
                        return "nullMessage: buffer expected";
                return null;
            };

            /**
             * Creates a Verified message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof signalservice.Verified
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {signalservice.Verified} Verified
             */
            Verified.fromObject = function fromObject(object) {
                if (object instanceof $root.signalservice.Verified)
                    return object;
                var message = new $root.signalservice.Verified();
                if (object.destination != null)
                    message.destination = String(object.destination);
                if (object.identityKey != null)
                    if (typeof object.identityKey === "string")
                        $util.base64.decode(object.identityKey, message.identityKey = $util.newBuffer($util.base64.length(object.identityKey)), 0);
                    else if (object.identityKey.length)
                        message.identityKey = object.identityKey;
                switch (object.state) {
                    case "DEFAULT":
                    case 0:
                        message.state = 0;
                        break;
                    case "VERIFIED":
                    case 1:
                        message.state = 1;
                        break;
                    case "UNVERIFIED":
                    case 2:
                        message.state = 2;
                        break;
                }
                if (object.nullMessage != null)
                    if (typeof object.nullMessage === "string")
                        $util.base64.decode(object.nullMessage, message.nullMessage = $util.newBuffer($util.base64.length(object.nullMessage)), 0);
                    else if (object.nullMessage.length)
                        message.nullMessage = object.nullMessage;
                return message;
            };

            /**
             * Creates a plain object from a Verified message. Also converts values to other types if specified.
             * @function toObject
             * @memberof signalservice.Verified
             * @static
             * @param {signalservice.Verified} message Verified
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Verified.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.destination = "";
                    object.identityKey = options.bytes === String ? "" : [];
                    object.state = options.enums === String ? "DEFAULT" : 0;
                    object.nullMessage = options.bytes === String ? "" : [];
                }
                if (message.destination != null && message.hasOwnProperty("destination"))
                    object.destination = message.destination;
                if (message.identityKey != null && message.hasOwnProperty("identityKey"))
                    object.identityKey = options.bytes === String ? $util.base64.encode(message.identityKey, 0, message.identityKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.identityKey) : message.identityKey;
                if (message.state != null && message.hasOwnProperty("state"))
                    object.state = options.enums === String ? $root.signalservice.Verified.State[message.state] : message.state;
                if (message.nullMessage != null && message.hasOwnProperty("nullMessage"))
                    object.nullMessage = options.bytes === String ? $util.base64.encode(message.nullMessage, 0, message.nullMessage.length) : options.bytes === Array ? Array.prototype.slice.call(message.nullMessage) : message.nullMessage;
                return object;
            };

            /**
             * Converts this Verified to JSON.
             * @function toJSON
             * @memberof signalservice.Verified
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Verified.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * State enum.
             * @name signalservice.Verified.State
             * @enum {string}
             * @property {number} DEFAULT=0 DEFAULT value
             * @property {number} VERIFIED=1 VERIFIED value
             * @property {number} UNVERIFIED=2 UNVERIFIED value
             */
            Verified.State = (function () {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "DEFAULT"] = 0;
                values[valuesById[1] = "VERIFIED"] = 1;
                values[valuesById[2] = "UNVERIFIED"] = 2;
                return values;
            })();

            return Verified;
        })();

        signalservice.SyncMessage = (function () {

            /**
             * Properties of a SyncMessage.
             * @memberof signalservice
             * @interface ISyncMessage
             * @property {signalservice.SyncMessage.ISent|null} [sent] SyncMessage sent
             * @property {signalservice.SyncMessage.IContacts|null} [contacts] SyncMessage contacts
             * @property {signalservice.SyncMessage.IGroups|null} [groups] SyncMessage groups
             * @property {signalservice.SyncMessage.IRequest|null} [request] SyncMessage request
             * @property {Array.<signalservice.SyncMessage.IRead>|null} [read] SyncMessage read
             * @property {signalservice.SyncMessage.IBlocked|null} [blocked] SyncMessage blocked
             * @property {signalservice.IVerified|null} [verified] SyncMessage verified
             * @property {signalservice.SyncMessage.IConfiguration|null} [configuration] SyncMessage configuration
             * @property {Uint8Array|null} [padding] SyncMessage padding
             */

            /**
             * Constructs a new SyncMessage.
             * @memberof signalservice
             * @classdesc Represents a SyncMessage.
             * @implements ISyncMessage
             * @constructor
             * @param {signalservice.ISyncMessage=} [properties] Properties to set
             */
            function SyncMessage(properties) {
                this.read = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * SyncMessage sent.
             * @member {signalservice.SyncMessage.ISent|null|undefined} sent
             * @memberof signalservice.SyncMessage
             * @instance
             */
            SyncMessage.prototype.sent = null;

            /**
             * SyncMessage contacts.
             * @member {signalservice.SyncMessage.IContacts|null|undefined} contacts
             * @memberof signalservice.SyncMessage
             * @instance
             */
            SyncMessage.prototype.contacts = null;

            /**
             * SyncMessage groups.
             * @member {signalservice.SyncMessage.IGroups|null|undefined} groups
             * @memberof signalservice.SyncMessage
             * @instance
             */
            SyncMessage.prototype.groups = null;

            /**
             * SyncMessage request.
             * @member {signalservice.SyncMessage.IRequest|null|undefined} request
             * @memberof signalservice.SyncMessage
             * @instance
             */
            SyncMessage.prototype.request = null;

            /**
             * SyncMessage read.
             * @member {Array.<signalservice.SyncMessage.IRead>} read
             * @memberof signalservice.SyncMessage
             * @instance
             */
            SyncMessage.prototype.read = $util.emptyArray;

            /**
             * SyncMessage blocked.
             * @member {signalservice.SyncMessage.IBlocked|null|undefined} blocked
             * @memberof signalservice.SyncMessage
             * @instance
             */
            SyncMessage.prototype.blocked = null;

            /**
             * SyncMessage verified.
             * @member {signalservice.IVerified|null|undefined} verified
             * @memberof signalservice.SyncMessage
             * @instance
             */
            SyncMessage.prototype.verified = null;

            /**
             * SyncMessage configuration.
             * @member {signalservice.SyncMessage.IConfiguration|null|undefined} configuration
             * @memberof signalservice.SyncMessage
             * @instance
             */
            SyncMessage.prototype.configuration = null;

            /**
             * SyncMessage padding.
             * @member {Uint8Array} padding
             * @memberof signalservice.SyncMessage
             * @instance
             */
            SyncMessage.prototype.padding = $util.newBuffer([]);

            /**
             * Creates a new SyncMessage instance using the specified properties.
             * @function create
             * @memberof signalservice.SyncMessage
             * @static
             * @param {signalservice.ISyncMessage=} [properties] Properties to set
             * @returns {signalservice.SyncMessage} SyncMessage instance
             */
            SyncMessage.create = function create(properties) {
                return new SyncMessage(properties);
            };

            /**
             * Encodes the specified SyncMessage message. Does not implicitly {@link signalservice.SyncMessage.verify|verify} messages.
             * @function encode
             * @memberof signalservice.SyncMessage
             * @static
             * @param {signalservice.ISyncMessage} message SyncMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SyncMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.sent != null && message.hasOwnProperty("sent"))
                    $root.signalservice.SyncMessage.Sent.encode(message.sent, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.contacts != null && message.hasOwnProperty("contacts"))
                    $root.signalservice.SyncMessage.Contacts.encode(message.contacts, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.groups != null && message.hasOwnProperty("groups"))
                    $root.signalservice.SyncMessage.Groups.encode(message.groups, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.request != null && message.hasOwnProperty("request"))
                    $root.signalservice.SyncMessage.Request.encode(message.request, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.read != null && message.read.length)
                    for (var i = 0; i < message.read.length; ++i)
                        $root.signalservice.SyncMessage.Read.encode(message.read[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.blocked != null && message.hasOwnProperty("blocked"))
                    $root.signalservice.SyncMessage.Blocked.encode(message.blocked, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                if (message.verified != null && message.hasOwnProperty("verified"))
                    $root.signalservice.Verified.encode(message.verified, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                if (message.padding != null && message.hasOwnProperty("padding"))
                    writer.uint32(/* id 8, wireType 2 =*/66).bytes(message.padding);
                if (message.configuration != null && message.hasOwnProperty("configuration"))
                    $root.signalservice.SyncMessage.Configuration.encode(message.configuration, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified SyncMessage message, length delimited. Does not implicitly {@link signalservice.SyncMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof signalservice.SyncMessage
             * @static
             * @param {signalservice.ISyncMessage} message SyncMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SyncMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a SyncMessage message from the specified reader or buffer.
             * @function decode
             * @memberof signalservice.SyncMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {signalservice.SyncMessage} SyncMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SyncMessage.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.SyncMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            message.sent = $root.signalservice.SyncMessage.Sent.decode(reader, reader.uint32());
                            break;
                        case 2:
                            message.contacts = $root.signalservice.SyncMessage.Contacts.decode(reader, reader.uint32());
                            break;
                        case 3:
                            message.groups = $root.signalservice.SyncMessage.Groups.decode(reader, reader.uint32());
                            break;
                        case 4:
                            message.request = $root.signalservice.SyncMessage.Request.decode(reader, reader.uint32());
                            break;
                        case 5:
                            if (!(message.read && message.read.length))
                                message.read = [];
                            message.read.push($root.signalservice.SyncMessage.Read.decode(reader, reader.uint32()));
                            break;
                        case 6:
                            message.blocked = $root.signalservice.SyncMessage.Blocked.decode(reader, reader.uint32());
                            break;
                        case 7:
                            message.verified = $root.signalservice.Verified.decode(reader, reader.uint32());
                            break;
                        case 9:
                            message.configuration = $root.signalservice.SyncMessage.Configuration.decode(reader, reader.uint32());
                            break;
                        case 8:
                            message.padding = reader.bytes();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return message;
            };

            /**
             * Decodes a SyncMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof signalservice.SyncMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {signalservice.SyncMessage} SyncMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SyncMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a SyncMessage message.
             * @function verify
             * @memberof signalservice.SyncMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            SyncMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.sent != null && message.hasOwnProperty("sent")) {
                    var error = $root.signalservice.SyncMessage.Sent.verify(message.sent);
                    if (error)
                        return "sent." + error;
                }
                if (message.contacts != null && message.hasOwnProperty("contacts")) {
                    var error = $root.signalservice.SyncMessage.Contacts.verify(message.contacts);
                    if (error)
                        return "contacts." + error;
                }
                if (message.groups != null && message.hasOwnProperty("groups")) {
                    var error = $root.signalservice.SyncMessage.Groups.verify(message.groups);
                    if (error)
                        return "groups." + error;
                }
                if (message.request != null && message.hasOwnProperty("request")) {
                    var error = $root.signalservice.SyncMessage.Request.verify(message.request);
                    if (error)
                        return "request." + error;
                }
                if (message.read != null && message.hasOwnProperty("read")) {
                    if (!Array.isArray(message.read))
                        return "read: array expected";
                    for (var i = 0; i < message.read.length; ++i) {
                        var error = $root.signalservice.SyncMessage.Read.verify(message.read[i]);
                        if (error)
                            return "read." + error;
                    }
                }
                if (message.blocked != null && message.hasOwnProperty("blocked")) {
                    var error = $root.signalservice.SyncMessage.Blocked.verify(message.blocked);
                    if (error)
                        return "blocked." + error;
                }
                if (message.verified != null && message.hasOwnProperty("verified")) {
                    var error = $root.signalservice.Verified.verify(message.verified);
                    if (error)
                        return "verified." + error;
                }
                if (message.configuration != null && message.hasOwnProperty("configuration")) {
                    var error = $root.signalservice.SyncMessage.Configuration.verify(message.configuration);
                    if (error)
                        return "configuration." + error;
                }
                if (message.padding != null && message.hasOwnProperty("padding"))
                    if (!(message.padding && typeof message.padding.length === "number" || $util.isString(message.padding)))
                        return "padding: buffer expected";
                return null;
            };

            /**
             * Creates a SyncMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof signalservice.SyncMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {signalservice.SyncMessage} SyncMessage
             */
            SyncMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.signalservice.SyncMessage)
                    return object;
                var message = new $root.signalservice.SyncMessage();
                if (object.sent != null) {
                    if (typeof object.sent !== "object")
                        throw TypeError(".signalservice.SyncMessage.sent: object expected");
                    message.sent = $root.signalservice.SyncMessage.Sent.fromObject(object.sent);
                }
                if (object.contacts != null) {
                    if (typeof object.contacts !== "object")
                        throw TypeError(".signalservice.SyncMessage.contacts: object expected");
                    message.contacts = $root.signalservice.SyncMessage.Contacts.fromObject(object.contacts);
                }
                if (object.groups != null) {
                    if (typeof object.groups !== "object")
                        throw TypeError(".signalservice.SyncMessage.groups: object expected");
                    message.groups = $root.signalservice.SyncMessage.Groups.fromObject(object.groups);
                }
                if (object.request != null) {
                    if (typeof object.request !== "object")
                        throw TypeError(".signalservice.SyncMessage.request: object expected");
                    message.request = $root.signalservice.SyncMessage.Request.fromObject(object.request);
                }
                if (object.read) {
                    if (!Array.isArray(object.read))
                        throw TypeError(".signalservice.SyncMessage.read: array expected");
                    message.read = [];
                    for (var i = 0; i < object.read.length; ++i) {
                        if (typeof object.read[i] !== "object")
                            throw TypeError(".signalservice.SyncMessage.read: object expected");
                        message.read[i] = $root.signalservice.SyncMessage.Read.fromObject(object.read[i]);
                    }
                }
                if (object.blocked != null) {
                    if (typeof object.blocked !== "object")
                        throw TypeError(".signalservice.SyncMessage.blocked: object expected");
                    message.blocked = $root.signalservice.SyncMessage.Blocked.fromObject(object.blocked);
                }
                if (object.verified != null) {
                    if (typeof object.verified !== "object")
                        throw TypeError(".signalservice.SyncMessage.verified: object expected");
                    message.verified = $root.signalservice.Verified.fromObject(object.verified);
                }
                if (object.configuration != null) {
                    if (typeof object.configuration !== "object")
                        throw TypeError(".signalservice.SyncMessage.configuration: object expected");
                    message.configuration = $root.signalservice.SyncMessage.Configuration.fromObject(object.configuration);
                }
                if (object.padding != null)
                    if (typeof object.padding === "string")
                        $util.base64.decode(object.padding, message.padding = $util.newBuffer($util.base64.length(object.padding)), 0);
                    else if (object.padding.length)
                        message.padding = object.padding;
                return message;
            };

            /**
             * Creates a plain object from a SyncMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof signalservice.SyncMessage
             * @static
             * @param {signalservice.SyncMessage} message SyncMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            SyncMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.read = [];
                if (options.defaults) {
                    object.sent = null;
                    object.contacts = null;
                    object.groups = null;
                    object.request = null;
                    object.blocked = null;
                    object.verified = null;
                    object.padding = options.bytes === String ? "" : [];
                    object.configuration = null;
                }
                if (message.sent != null && message.hasOwnProperty("sent"))
                    object.sent = $root.signalservice.SyncMessage.Sent.toObject(message.sent, options);
                if (message.contacts != null && message.hasOwnProperty("contacts"))
                    object.contacts = $root.signalservice.SyncMessage.Contacts.toObject(message.contacts, options);
                if (message.groups != null && message.hasOwnProperty("groups"))
                    object.groups = $root.signalservice.SyncMessage.Groups.toObject(message.groups, options);
                if (message.request != null && message.hasOwnProperty("request"))
                    object.request = $root.signalservice.SyncMessage.Request.toObject(message.request, options);
                if (message.read && message.read.length) {
                    object.read = [];
                    for (var j = 0; j < message.read.length; ++j)
                        object.read[j] = $root.signalservice.SyncMessage.Read.toObject(message.read[j], options);
                }
                if (message.blocked != null && message.hasOwnProperty("blocked"))
                    object.blocked = $root.signalservice.SyncMessage.Blocked.toObject(message.blocked, options);
                if (message.verified != null && message.hasOwnProperty("verified"))
                    object.verified = $root.signalservice.Verified.toObject(message.verified, options);
                if (message.padding != null && message.hasOwnProperty("padding"))
                    object.padding = options.bytes === String ? $util.base64.encode(message.padding, 0, message.padding.length) : options.bytes === Array ? Array.prototype.slice.call(message.padding) : message.padding;
                if (message.configuration != null && message.hasOwnProperty("configuration"))
                    object.configuration = $root.signalservice.SyncMessage.Configuration.toObject(message.configuration, options);
                return object;
            };

            /**
             * Converts this SyncMessage to JSON.
             * @function toJSON
             * @memberof signalservice.SyncMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            SyncMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            SyncMessage.Sent = (function () {

                /**
                 * Properties of a Sent.
                 * @memberof signalservice.SyncMessage
                 * @interface ISent
                 * @property {string|null} [destination] Sent destination
                 * @property {number|Long|null} [timestamp] Sent timestamp
                 * @property {signalservice.IDataMessage|null} [message] Sent message
                 * @property {number|Long|null} [expirationStartTimestamp] Sent expirationStartTimestamp
                 */

                /**
                 * Constructs a new Sent.
                 * @memberof signalservice.SyncMessage
                 * @classdesc Represents a Sent.
                 * @implements ISent
                 * @constructor
                 * @param {signalservice.SyncMessage.ISent=} [properties] Properties to set
                 */
                function Sent(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Sent destination.
                 * @member {string} destination
                 * @memberof signalservice.SyncMessage.Sent
                 * @instance
                 */
                Sent.prototype.destination = "";

                /**
                 * Sent timestamp.
                 * @member {number|Long} timestamp
                 * @memberof signalservice.SyncMessage.Sent
                 * @instance
                 */
                Sent.prototype.timestamp = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;

                /**
                 * Sent message.
                 * @member {signalservice.IDataMessage|null|undefined} message
                 * @memberof signalservice.SyncMessage.Sent
                 * @instance
                 */
                Sent.prototype.message = null;

                /**
                 * Sent expirationStartTimestamp.
                 * @member {number|Long} expirationStartTimestamp
                 * @memberof signalservice.SyncMessage.Sent
                 * @instance
                 */
                Sent.prototype.expirationStartTimestamp = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;

                /**
                 * Creates a new Sent instance using the specified properties.
                 * @function create
                 * @memberof signalservice.SyncMessage.Sent
                 * @static
                 * @param {signalservice.SyncMessage.ISent=} [properties] Properties to set
                 * @returns {signalservice.SyncMessage.Sent} Sent instance
                 */
                Sent.create = function create(properties) {
                    return new Sent(properties);
                };

                /**
                 * Encodes the specified Sent message. Does not implicitly {@link signalservice.SyncMessage.Sent.verify|verify} messages.
                 * @function encode
                 * @memberof signalservice.SyncMessage.Sent
                 * @static
                 * @param {signalservice.SyncMessage.ISent} message Sent message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Sent.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.destination != null && message.hasOwnProperty("destination"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.destination);
                    if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.timestamp);
                    if (message.message != null && message.hasOwnProperty("message"))
                        $root.signalservice.DataMessage.encode(message.message, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    if (message.expirationStartTimestamp != null && message.hasOwnProperty("expirationStartTimestamp"))
                        writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.expirationStartTimestamp);
                    return writer;
                };

                /**
                 * Encodes the specified Sent message, length delimited. Does not implicitly {@link signalservice.SyncMessage.Sent.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof signalservice.SyncMessage.Sent
                 * @static
                 * @param {signalservice.SyncMessage.ISent} message Sent message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Sent.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Sent message from the specified reader or buffer.
                 * @function decode
                 * @memberof signalservice.SyncMessage.Sent
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {signalservice.SyncMessage.Sent} Sent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Sent.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.SyncMessage.Sent();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                message.destination = reader.string();
                                break;
                            case 2:
                                message.timestamp = reader.uint64();
                                break;
                            case 3:
                                message.message = $root.signalservice.DataMessage.decode(reader, reader.uint32());
                                break;
                            case 4:
                                message.expirationStartTimestamp = reader.uint64();
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Sent message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof signalservice.SyncMessage.Sent
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {signalservice.SyncMessage.Sent} Sent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Sent.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Sent message.
                 * @function verify
                 * @memberof signalservice.SyncMessage.Sent
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Sent.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.destination != null && message.hasOwnProperty("destination"))
                        if (!$util.isString(message.destination))
                            return "destination: string expected";
                    if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                        if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                            return "timestamp: integer|Long expected";
                    if (message.message != null && message.hasOwnProperty("message")) {
                        var error = $root.signalservice.DataMessage.verify(message.message);
                        if (error)
                            return "message." + error;
                    }
                    if (message.expirationStartTimestamp != null && message.hasOwnProperty("expirationStartTimestamp"))
                        if (!$util.isInteger(message.expirationStartTimestamp) && !(message.expirationStartTimestamp && $util.isInteger(message.expirationStartTimestamp.low) && $util.isInteger(message.expirationStartTimestamp.high)))
                            return "expirationStartTimestamp: integer|Long expected";
                    return null;
                };

                /**
                 * Creates a Sent message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof signalservice.SyncMessage.Sent
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {signalservice.SyncMessage.Sent} Sent
                 */
                Sent.fromObject = function fromObject(object) {
                    if (object instanceof $root.signalservice.SyncMessage.Sent)
                        return object;
                    var message = new $root.signalservice.SyncMessage.Sent();
                    if (object.destination != null)
                        message.destination = String(object.destination);
                    if (object.timestamp != null)
                        if ($util.Long)
                            (message.timestamp = $util.Long.fromValue(object.timestamp)).unsigned = true;
                        else if (typeof object.timestamp === "string")
                            message.timestamp = parseInt(object.timestamp, 10);
                        else if (typeof object.timestamp === "number")
                            message.timestamp = object.timestamp;
                        else if (typeof object.timestamp === "object")
                            message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber(true);
                    if (object.message != null) {
                        if (typeof object.message !== "object")
                            throw TypeError(".signalservice.SyncMessage.Sent.message: object expected");
                        message.message = $root.signalservice.DataMessage.fromObject(object.message);
                    }
                    if (object.expirationStartTimestamp != null)
                        if ($util.Long)
                            (message.expirationStartTimestamp = $util.Long.fromValue(object.expirationStartTimestamp)).unsigned = true;
                        else if (typeof object.expirationStartTimestamp === "string")
                            message.expirationStartTimestamp = parseInt(object.expirationStartTimestamp, 10);
                        else if (typeof object.expirationStartTimestamp === "number")
                            message.expirationStartTimestamp = object.expirationStartTimestamp;
                        else if (typeof object.expirationStartTimestamp === "object")
                            message.expirationStartTimestamp = new $util.LongBits(object.expirationStartTimestamp.low >>> 0, object.expirationStartTimestamp.high >>> 0).toNumber(true);
                    return message;
                };

                /**
                 * Creates a plain object from a Sent message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof signalservice.SyncMessage.Sent
                 * @static
                 * @param {signalservice.SyncMessage.Sent} message Sent
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Sent.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.destination = "";
                        if ($util.Long) {
                            var long = new $util.Long(0, 0, true);
                            object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.timestamp = options.longs === String ? "0" : 0;
                        object.message = null;
                        if ($util.Long) {
                            var long = new $util.Long(0, 0, true);
                            object.expirationStartTimestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.expirationStartTimestamp = options.longs === String ? "0" : 0;
                    }
                    if (message.destination != null && message.hasOwnProperty("destination"))
                        object.destination = message.destination;
                    if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                        if (typeof message.timestamp === "number")
                            object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                        else
                            object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber(true) : message.timestamp;
                    if (message.message != null && message.hasOwnProperty("message"))
                        object.message = $root.signalservice.DataMessage.toObject(message.message, options);
                    if (message.expirationStartTimestamp != null && message.hasOwnProperty("expirationStartTimestamp"))
                        if (typeof message.expirationStartTimestamp === "number")
                            object.expirationStartTimestamp = options.longs === String ? String(message.expirationStartTimestamp) : message.expirationStartTimestamp;
                        else
                            object.expirationStartTimestamp = options.longs === String ? $util.Long.prototype.toString.call(message.expirationStartTimestamp) : options.longs === Number ? new $util.LongBits(message.expirationStartTimestamp.low >>> 0, message.expirationStartTimestamp.high >>> 0).toNumber(true) : message.expirationStartTimestamp;
                    return object;
                };

                /**
                 * Converts this Sent to JSON.
                 * @function toJSON
                 * @memberof signalservice.SyncMessage.Sent
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Sent.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Sent;
            })();

            SyncMessage.Contacts = (function () {

                /**
                 * Properties of a Contacts.
                 * @memberof signalservice.SyncMessage
                 * @interface IContacts
                 * @property {signalservice.IAttachmentPointer|null} [blob] Contacts blob
                 * @property {boolean|null} [complete] Contacts complete
                 */

                /**
                 * Constructs a new Contacts.
                 * @memberof signalservice.SyncMessage
                 * @classdesc Represents a Contacts.
                 * @implements IContacts
                 * @constructor
                 * @param {signalservice.SyncMessage.IContacts=} [properties] Properties to set
                 */
                function Contacts(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Contacts blob.
                 * @member {signalservice.IAttachmentPointer|null|undefined} blob
                 * @memberof signalservice.SyncMessage.Contacts
                 * @instance
                 */
                Contacts.prototype.blob = null;

                /**
                 * Contacts complete.
                 * @member {boolean} complete
                 * @memberof signalservice.SyncMessage.Contacts
                 * @instance
                 */
                Contacts.prototype.complete = false;

                /**
                 * Creates a new Contacts instance using the specified properties.
                 * @function create
                 * @memberof signalservice.SyncMessage.Contacts
                 * @static
                 * @param {signalservice.SyncMessage.IContacts=} [properties] Properties to set
                 * @returns {signalservice.SyncMessage.Contacts} Contacts instance
                 */
                Contacts.create = function create(properties) {
                    return new Contacts(properties);
                };

                /**
                 * Encodes the specified Contacts message. Does not implicitly {@link signalservice.SyncMessage.Contacts.verify|verify} messages.
                 * @function encode
                 * @memberof signalservice.SyncMessage.Contacts
                 * @static
                 * @param {signalservice.SyncMessage.IContacts} message Contacts message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Contacts.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.blob != null && message.hasOwnProperty("blob"))
                        $root.signalservice.AttachmentPointer.encode(message.blob, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.complete != null && message.hasOwnProperty("complete"))
                        writer.uint32(/* id 2, wireType 0 =*/16).bool(message.complete);
                    return writer;
                };

                /**
                 * Encodes the specified Contacts message, length delimited. Does not implicitly {@link signalservice.SyncMessage.Contacts.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof signalservice.SyncMessage.Contacts
                 * @static
                 * @param {signalservice.SyncMessage.IContacts} message Contacts message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Contacts.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Contacts message from the specified reader or buffer.
                 * @function decode
                 * @memberof signalservice.SyncMessage.Contacts
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {signalservice.SyncMessage.Contacts} Contacts
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Contacts.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.SyncMessage.Contacts();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                message.blob = $root.signalservice.AttachmentPointer.decode(reader, reader.uint32());
                                break;
                            case 2:
                                message.complete = reader.bool();
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Contacts message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof signalservice.SyncMessage.Contacts
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {signalservice.SyncMessage.Contacts} Contacts
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Contacts.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Contacts message.
                 * @function verify
                 * @memberof signalservice.SyncMessage.Contacts
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Contacts.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.blob != null && message.hasOwnProperty("blob")) {
                        var error = $root.signalservice.AttachmentPointer.verify(message.blob);
                        if (error)
                            return "blob." + error;
                    }
                    if (message.complete != null && message.hasOwnProperty("complete"))
                        if (typeof message.complete !== "boolean")
                            return "complete: boolean expected";
                    return null;
                };

                /**
                 * Creates a Contacts message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof signalservice.SyncMessage.Contacts
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {signalservice.SyncMessage.Contacts} Contacts
                 */
                Contacts.fromObject = function fromObject(object) {
                    if (object instanceof $root.signalservice.SyncMessage.Contacts)
                        return object;
                    var message = new $root.signalservice.SyncMessage.Contacts();
                    if (object.blob != null) {
                        if (typeof object.blob !== "object")
                            throw TypeError(".signalservice.SyncMessage.Contacts.blob: object expected");
                        message.blob = $root.signalservice.AttachmentPointer.fromObject(object.blob);
                    }
                    if (object.complete != null)
                        message.complete = Boolean(object.complete);
                    return message;
                };

                /**
                 * Creates a plain object from a Contacts message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof signalservice.SyncMessage.Contacts
                 * @static
                 * @param {signalservice.SyncMessage.Contacts} message Contacts
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Contacts.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.blob = null;
                        object.complete = false;
                    }
                    if (message.blob != null && message.hasOwnProperty("blob"))
                        object.blob = $root.signalservice.AttachmentPointer.toObject(message.blob, options);
                    if (message.complete != null && message.hasOwnProperty("complete"))
                        object.complete = message.complete;
                    return object;
                };

                /**
                 * Converts this Contacts to JSON.
                 * @function toJSON
                 * @memberof signalservice.SyncMessage.Contacts
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Contacts.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Contacts;
            })();

            SyncMessage.Groups = (function () {

                /**
                 * Properties of a Groups.
                 * @memberof signalservice.SyncMessage
                 * @interface IGroups
                 * @property {signalservice.IAttachmentPointer|null} [blob] Groups blob
                 */

                /**
                 * Constructs a new Groups.
                 * @memberof signalservice.SyncMessage
                 * @classdesc Represents a Groups.
                 * @implements IGroups
                 * @constructor
                 * @param {signalservice.SyncMessage.IGroups=} [properties] Properties to set
                 */
                function Groups(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Groups blob.
                 * @member {signalservice.IAttachmentPointer|null|undefined} blob
                 * @memberof signalservice.SyncMessage.Groups
                 * @instance
                 */
                Groups.prototype.blob = null;

                /**
                 * Creates a new Groups instance using the specified properties.
                 * @function create
                 * @memberof signalservice.SyncMessage.Groups
                 * @static
                 * @param {signalservice.SyncMessage.IGroups=} [properties] Properties to set
                 * @returns {signalservice.SyncMessage.Groups} Groups instance
                 */
                Groups.create = function create(properties) {
                    return new Groups(properties);
                };

                /**
                 * Encodes the specified Groups message. Does not implicitly {@link signalservice.SyncMessage.Groups.verify|verify} messages.
                 * @function encode
                 * @memberof signalservice.SyncMessage.Groups
                 * @static
                 * @param {signalservice.SyncMessage.IGroups} message Groups message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Groups.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.blob != null && message.hasOwnProperty("blob"))
                        $root.signalservice.AttachmentPointer.encode(message.blob, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified Groups message, length delimited. Does not implicitly {@link signalservice.SyncMessage.Groups.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof signalservice.SyncMessage.Groups
                 * @static
                 * @param {signalservice.SyncMessage.IGroups} message Groups message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Groups.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Groups message from the specified reader or buffer.
                 * @function decode
                 * @memberof signalservice.SyncMessage.Groups
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {signalservice.SyncMessage.Groups} Groups
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Groups.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.SyncMessage.Groups();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                message.blob = $root.signalservice.AttachmentPointer.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Groups message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof signalservice.SyncMessage.Groups
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {signalservice.SyncMessage.Groups} Groups
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Groups.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Groups message.
                 * @function verify
                 * @memberof signalservice.SyncMessage.Groups
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Groups.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.blob != null && message.hasOwnProperty("blob")) {
                        var error = $root.signalservice.AttachmentPointer.verify(message.blob);
                        if (error)
                            return "blob." + error;
                    }
                    return null;
                };

                /**
                 * Creates a Groups message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof signalservice.SyncMessage.Groups
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {signalservice.SyncMessage.Groups} Groups
                 */
                Groups.fromObject = function fromObject(object) {
                    if (object instanceof $root.signalservice.SyncMessage.Groups)
                        return object;
                    var message = new $root.signalservice.SyncMessage.Groups();
                    if (object.blob != null) {
                        if (typeof object.blob !== "object")
                            throw TypeError(".signalservice.SyncMessage.Groups.blob: object expected");
                        message.blob = $root.signalservice.AttachmentPointer.fromObject(object.blob);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a Groups message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof signalservice.SyncMessage.Groups
                 * @static
                 * @param {signalservice.SyncMessage.Groups} message Groups
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Groups.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults)
                        object.blob = null;
                    if (message.blob != null && message.hasOwnProperty("blob"))
                        object.blob = $root.signalservice.AttachmentPointer.toObject(message.blob, options);
                    return object;
                };

                /**
                 * Converts this Groups to JSON.
                 * @function toJSON
                 * @memberof signalservice.SyncMessage.Groups
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Groups.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Groups;
            })();

            SyncMessage.Blocked = (function () {

                /**
                 * Properties of a Blocked.
                 * @memberof signalservice.SyncMessage
                 * @interface IBlocked
                 * @property {Array.<string>|null} [numbers] Blocked numbers
                 */

                /**
                 * Constructs a new Blocked.
                 * @memberof signalservice.SyncMessage
                 * @classdesc Represents a Blocked.
                 * @implements IBlocked
                 * @constructor
                 * @param {signalservice.SyncMessage.IBlocked=} [properties] Properties to set
                 */
                function Blocked(properties) {
                    this.numbers = [];
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Blocked numbers.
                 * @member {Array.<string>} numbers
                 * @memberof signalservice.SyncMessage.Blocked
                 * @instance
                 */
                Blocked.prototype.numbers = $util.emptyArray;

                /**
                 * Creates a new Blocked instance using the specified properties.
                 * @function create
                 * @memberof signalservice.SyncMessage.Blocked
                 * @static
                 * @param {signalservice.SyncMessage.IBlocked=} [properties] Properties to set
                 * @returns {signalservice.SyncMessage.Blocked} Blocked instance
                 */
                Blocked.create = function create(properties) {
                    return new Blocked(properties);
                };

                /**
                 * Encodes the specified Blocked message. Does not implicitly {@link signalservice.SyncMessage.Blocked.verify|verify} messages.
                 * @function encode
                 * @memberof signalservice.SyncMessage.Blocked
                 * @static
                 * @param {signalservice.SyncMessage.IBlocked} message Blocked message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Blocked.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.numbers != null && message.numbers.length)
                        for (var i = 0; i < message.numbers.length; ++i)
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.numbers[i]);
                    return writer;
                };

                /**
                 * Encodes the specified Blocked message, length delimited. Does not implicitly {@link signalservice.SyncMessage.Blocked.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof signalservice.SyncMessage.Blocked
                 * @static
                 * @param {signalservice.SyncMessage.IBlocked} message Blocked message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Blocked.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Blocked message from the specified reader or buffer.
                 * @function decode
                 * @memberof signalservice.SyncMessage.Blocked
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {signalservice.SyncMessage.Blocked} Blocked
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Blocked.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.SyncMessage.Blocked();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                if (!(message.numbers && message.numbers.length))
                                    message.numbers = [];
                                message.numbers.push(reader.string());
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Blocked message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof signalservice.SyncMessage.Blocked
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {signalservice.SyncMessage.Blocked} Blocked
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Blocked.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Blocked message.
                 * @function verify
                 * @memberof signalservice.SyncMessage.Blocked
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Blocked.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.numbers != null && message.hasOwnProperty("numbers")) {
                        if (!Array.isArray(message.numbers))
                            return "numbers: array expected";
                        for (var i = 0; i < message.numbers.length; ++i)
                            if (!$util.isString(message.numbers[i]))
                                return "numbers: string[] expected";
                    }
                    return null;
                };

                /**
                 * Creates a Blocked message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof signalservice.SyncMessage.Blocked
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {signalservice.SyncMessage.Blocked} Blocked
                 */
                Blocked.fromObject = function fromObject(object) {
                    if (object instanceof $root.signalservice.SyncMessage.Blocked)
                        return object;
                    var message = new $root.signalservice.SyncMessage.Blocked();
                    if (object.numbers) {
                        if (!Array.isArray(object.numbers))
                            throw TypeError(".signalservice.SyncMessage.Blocked.numbers: array expected");
                        message.numbers = [];
                        for (var i = 0; i < object.numbers.length; ++i)
                            message.numbers[i] = String(object.numbers[i]);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a Blocked message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof signalservice.SyncMessage.Blocked
                 * @static
                 * @param {signalservice.SyncMessage.Blocked} message Blocked
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Blocked.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.arrays || options.defaults)
                        object.numbers = [];
                    if (message.numbers && message.numbers.length) {
                        object.numbers = [];
                        for (var j = 0; j < message.numbers.length; ++j)
                            object.numbers[j] = message.numbers[j];
                    }
                    return object;
                };

                /**
                 * Converts this Blocked to JSON.
                 * @function toJSON
                 * @memberof signalservice.SyncMessage.Blocked
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Blocked.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Blocked;
            })();

            SyncMessage.Request = (function () {

                /**
                 * Properties of a Request.
                 * @memberof signalservice.SyncMessage
                 * @interface IRequest
                 * @property {signalservice.SyncMessage.Request.Type|null} [type] Request type
                 */

                /**
                 * Constructs a new Request.
                 * @memberof signalservice.SyncMessage
                 * @classdesc Represents a Request.
                 * @implements IRequest
                 * @constructor
                 * @param {signalservice.SyncMessage.IRequest=} [properties] Properties to set
                 */
                function Request(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Request type.
                 * @member {signalservice.SyncMessage.Request.Type} type
                 * @memberof signalservice.SyncMessage.Request
                 * @instance
                 */
                Request.prototype.type = 0;

                /**
                 * Creates a new Request instance using the specified properties.
                 * @function create
                 * @memberof signalservice.SyncMessage.Request
                 * @static
                 * @param {signalservice.SyncMessage.IRequest=} [properties] Properties to set
                 * @returns {signalservice.SyncMessage.Request} Request instance
                 */
                Request.create = function create(properties) {
                    return new Request(properties);
                };

                /**
                 * Encodes the specified Request message. Does not implicitly {@link signalservice.SyncMessage.Request.verify|verify} messages.
                 * @function encode
                 * @memberof signalservice.SyncMessage.Request
                 * @static
                 * @param {signalservice.SyncMessage.IRequest} message Request message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Request.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.type != null && message.hasOwnProperty("type"))
                        writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
                    return writer;
                };

                /**
                 * Encodes the specified Request message, length delimited. Does not implicitly {@link signalservice.SyncMessage.Request.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof signalservice.SyncMessage.Request
                 * @static
                 * @param {signalservice.SyncMessage.IRequest} message Request message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Request.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Request message from the specified reader or buffer.
                 * @function decode
                 * @memberof signalservice.SyncMessage.Request
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {signalservice.SyncMessage.Request} Request
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Request.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.SyncMessage.Request();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                message.type = reader.int32();
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Request message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof signalservice.SyncMessage.Request
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {signalservice.SyncMessage.Request} Request
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Request.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Request message.
                 * @function verify
                 * @memberof signalservice.SyncMessage.Request
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Request.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.type != null && message.hasOwnProperty("type"))
                        switch (message.type) {
                            default:
                                return "type: enum value expected";
                            case 0:
                            case 1:
                            case 2:
                            case 3:
                            case 4:
                                break;
                        }
                    return null;
                };

                /**
                 * Creates a Request message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof signalservice.SyncMessage.Request
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {signalservice.SyncMessage.Request} Request
                 */
                Request.fromObject = function fromObject(object) {
                    if (object instanceof $root.signalservice.SyncMessage.Request)
                        return object;
                    var message = new $root.signalservice.SyncMessage.Request();
                    switch (object.type) {
                        case "UNKNOWN":
                        case 0:
                            message.type = 0;
                            break;
                        case "CONTACTS":
                        case 1:
                            message.type = 1;
                            break;
                        case "GROUPS":
                        case 2:
                            message.type = 2;
                            break;
                        case "BLOCKED":
                        case 3:
                            message.type = 3;
                            break;
                        case "CONFIGURATION":
                        case 4:
                            message.type = 4;
                            break;
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a Request message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof signalservice.SyncMessage.Request
                 * @static
                 * @param {signalservice.SyncMessage.Request} message Request
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Request.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults)
                        object.type = options.enums === String ? "UNKNOWN" : 0;
                    if (message.type != null && message.hasOwnProperty("type"))
                        object.type = options.enums === String ? $root.signalservice.SyncMessage.Request.Type[message.type] : message.type;
                    return object;
                };

                /**
                 * Converts this Request to JSON.
                 * @function toJSON
                 * @memberof signalservice.SyncMessage.Request
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Request.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Type enum.
                 * @name signalservice.SyncMessage.Request.Type
                 * @enum {string}
                 * @property {number} UNKNOWN=0 UNKNOWN value
                 * @property {number} CONTACTS=1 CONTACTS value
                 * @property {number} GROUPS=2 GROUPS value
                 * @property {number} BLOCKED=3 BLOCKED value
                 * @property {number} CONFIGURATION=4 CONFIGURATION value
                 */
                Request.Type = (function () {
                    var valuesById = {}, values = Object.create(valuesById);
                    values[valuesById[0] = "UNKNOWN"] = 0;
                    values[valuesById[1] = "CONTACTS"] = 1;
                    values[valuesById[2] = "GROUPS"] = 2;
                    values[valuesById[3] = "BLOCKED"] = 3;
                    values[valuesById[4] = "CONFIGURATION"] = 4;
                    return values;
                })();

                return Request;
            })();

            SyncMessage.Read = (function () {

                /**
                 * Properties of a Read.
                 * @memberof signalservice.SyncMessage
                 * @interface IRead
                 * @property {string|null} [sender] Read sender
                 * @property {number|Long|null} [timestamp] Read timestamp
                 */

                /**
                 * Constructs a new Read.
                 * @memberof signalservice.SyncMessage
                 * @classdesc Represents a Read.
                 * @implements IRead
                 * @constructor
                 * @param {signalservice.SyncMessage.IRead=} [properties] Properties to set
                 */
                function Read(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Read sender.
                 * @member {string} sender
                 * @memberof signalservice.SyncMessage.Read
                 * @instance
                 */
                Read.prototype.sender = "";

                /**
                 * Read timestamp.
                 * @member {number|Long} timestamp
                 * @memberof signalservice.SyncMessage.Read
                 * @instance
                 */
                Read.prototype.timestamp = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;

                /**
                 * Creates a new Read instance using the specified properties.
                 * @function create
                 * @memberof signalservice.SyncMessage.Read
                 * @static
                 * @param {signalservice.SyncMessage.IRead=} [properties] Properties to set
                 * @returns {signalservice.SyncMessage.Read} Read instance
                 */
                Read.create = function create(properties) {
                    return new Read(properties);
                };

                /**
                 * Encodes the specified Read message. Does not implicitly {@link signalservice.SyncMessage.Read.verify|verify} messages.
                 * @function encode
                 * @memberof signalservice.SyncMessage.Read
                 * @static
                 * @param {signalservice.SyncMessage.IRead} message Read message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Read.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.sender != null && message.hasOwnProperty("sender"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.sender);
                    if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.timestamp);
                    return writer;
                };

                /**
                 * Encodes the specified Read message, length delimited. Does not implicitly {@link signalservice.SyncMessage.Read.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof signalservice.SyncMessage.Read
                 * @static
                 * @param {signalservice.SyncMessage.IRead} message Read message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Read.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Read message from the specified reader or buffer.
                 * @function decode
                 * @memberof signalservice.SyncMessage.Read
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {signalservice.SyncMessage.Read} Read
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Read.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.SyncMessage.Read();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                message.sender = reader.string();
                                break;
                            case 2:
                                message.timestamp = reader.uint64();
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Read message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof signalservice.SyncMessage.Read
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {signalservice.SyncMessage.Read} Read
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Read.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Read message.
                 * @function verify
                 * @memberof signalservice.SyncMessage.Read
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Read.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.sender != null && message.hasOwnProperty("sender"))
                        if (!$util.isString(message.sender))
                            return "sender: string expected";
                    if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                        if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                            return "timestamp: integer|Long expected";
                    return null;
                };

                /**
                 * Creates a Read message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof signalservice.SyncMessage.Read
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {signalservice.SyncMessage.Read} Read
                 */
                Read.fromObject = function fromObject(object) {
                    if (object instanceof $root.signalservice.SyncMessage.Read)
                        return object;
                    var message = new $root.signalservice.SyncMessage.Read();
                    if (object.sender != null)
                        message.sender = String(object.sender);
                    if (object.timestamp != null)
                        if ($util.Long)
                            (message.timestamp = $util.Long.fromValue(object.timestamp)).unsigned = true;
                        else if (typeof object.timestamp === "string")
                            message.timestamp = parseInt(object.timestamp, 10);
                        else if (typeof object.timestamp === "number")
                            message.timestamp = object.timestamp;
                        else if (typeof object.timestamp === "object")
                            message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber(true);
                    return message;
                };

                /**
                 * Creates a plain object from a Read message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof signalservice.SyncMessage.Read
                 * @static
                 * @param {signalservice.SyncMessage.Read} message Read
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Read.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.sender = "";
                        if ($util.Long) {
                            var long = new $util.Long(0, 0, true);
                            object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.timestamp = options.longs === String ? "0" : 0;
                    }
                    if (message.sender != null && message.hasOwnProperty("sender"))
                        object.sender = message.sender;
                    if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                        if (typeof message.timestamp === "number")
                            object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                        else
                            object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber(true) : message.timestamp;
                    return object;
                };

                /**
                 * Converts this Read to JSON.
                 * @function toJSON
                 * @memberof signalservice.SyncMessage.Read
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Read.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Read;
            })();

            SyncMessage.Configuration = (function () {

                /**
                 * Properties of a Configuration.
                 * @memberof signalservice.SyncMessage
                 * @interface IConfiguration
                 * @property {boolean|null} [readReceipts] Configuration readReceipts
                 */

                /**
                 * Constructs a new Configuration.
                 * @memberof signalservice.SyncMessage
                 * @classdesc Represents a Configuration.
                 * @implements IConfiguration
                 * @constructor
                 * @param {signalservice.SyncMessage.IConfiguration=} [properties] Properties to set
                 */
                function Configuration(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Configuration readReceipts.
                 * @member {boolean} readReceipts
                 * @memberof signalservice.SyncMessage.Configuration
                 * @instance
                 */
                Configuration.prototype.readReceipts = false;

                /**
                 * Creates a new Configuration instance using the specified properties.
                 * @function create
                 * @memberof signalservice.SyncMessage.Configuration
                 * @static
                 * @param {signalservice.SyncMessage.IConfiguration=} [properties] Properties to set
                 * @returns {signalservice.SyncMessage.Configuration} Configuration instance
                 */
                Configuration.create = function create(properties) {
                    return new Configuration(properties);
                };

                /**
                 * Encodes the specified Configuration message. Does not implicitly {@link signalservice.SyncMessage.Configuration.verify|verify} messages.
                 * @function encode
                 * @memberof signalservice.SyncMessage.Configuration
                 * @static
                 * @param {signalservice.SyncMessage.IConfiguration} message Configuration message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Configuration.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.readReceipts != null && message.hasOwnProperty("readReceipts"))
                        writer.uint32(/* id 1, wireType 0 =*/8).bool(message.readReceipts);
                    return writer;
                };

                /**
                 * Encodes the specified Configuration message, length delimited. Does not implicitly {@link signalservice.SyncMessage.Configuration.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof signalservice.SyncMessage.Configuration
                 * @static
                 * @param {signalservice.SyncMessage.IConfiguration} message Configuration message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Configuration.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Configuration message from the specified reader or buffer.
                 * @function decode
                 * @memberof signalservice.SyncMessage.Configuration
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {signalservice.SyncMessage.Configuration} Configuration
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Configuration.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.SyncMessage.Configuration();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                message.readReceipts = reader.bool();
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Configuration message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof signalservice.SyncMessage.Configuration
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {signalservice.SyncMessage.Configuration} Configuration
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Configuration.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Configuration message.
                 * @function verify
                 * @memberof signalservice.SyncMessage.Configuration
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Configuration.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.readReceipts != null && message.hasOwnProperty("readReceipts"))
                        if (typeof message.readReceipts !== "boolean")
                            return "readReceipts: boolean expected";
                    return null;
                };

                /**
                 * Creates a Configuration message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof signalservice.SyncMessage.Configuration
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {signalservice.SyncMessage.Configuration} Configuration
                 */
                Configuration.fromObject = function fromObject(object) {
                    if (object instanceof $root.signalservice.SyncMessage.Configuration)
                        return object;
                    var message = new $root.signalservice.SyncMessage.Configuration();
                    if (object.readReceipts != null)
                        message.readReceipts = Boolean(object.readReceipts);
                    return message;
                };

                /**
                 * Creates a plain object from a Configuration message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof signalservice.SyncMessage.Configuration
                 * @static
                 * @param {signalservice.SyncMessage.Configuration} message Configuration
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Configuration.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults)
                        object.readReceipts = false;
                    if (message.readReceipts != null && message.hasOwnProperty("readReceipts"))
                        object.readReceipts = message.readReceipts;
                    return object;
                };

                /**
                 * Converts this Configuration to JSON.
                 * @function toJSON
                 * @memberof signalservice.SyncMessage.Configuration
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Configuration.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Configuration;
            })();

            return SyncMessage;
        })();

        signalservice.AttachmentPointer = (function () {

            /**
             * Properties of an AttachmentPointer.
             * @memberof signalservice
             * @interface IAttachmentPointer
             * @property {number|Long|null} [id] AttachmentPointer id
             * @property {string|null} [contentType] AttachmentPointer contentType
             * @property {Uint8Array|null} [key] AttachmentPointer key
             * @property {number|null} [size] AttachmentPointer size
             * @property {Uint8Array|null} [thumbnail] AttachmentPointer thumbnail
             * @property {Uint8Array|null} [digest] AttachmentPointer digest
             * @property {string|null} [fileName] AttachmentPointer fileName
             * @property {number|null} [flags] AttachmentPointer flags
             * @property {number|null} [width] AttachmentPointer width
             * @property {number|null} [height] AttachmentPointer height
             */

            /**
             * Constructs a new AttachmentPointer.
             * @memberof signalservice
             * @classdesc Represents an AttachmentPointer.
             * @implements IAttachmentPointer
             * @constructor
             * @param {signalservice.IAttachmentPointer=} [properties] Properties to set
             */
            function AttachmentPointer(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * AttachmentPointer id.
             * @member {number|Long} id
             * @memberof signalservice.AttachmentPointer
             * @instance
             */
            AttachmentPointer.prototype.id = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;

            /**
             * AttachmentPointer contentType.
             * @member {string} contentType
             * @memberof signalservice.AttachmentPointer
             * @instance
             */
            AttachmentPointer.prototype.contentType = "";

            /**
             * AttachmentPointer key.
             * @member {Uint8Array} key
             * @memberof signalservice.AttachmentPointer
             * @instance
             */
            AttachmentPointer.prototype.key = $util.newBuffer([]);

            /**
             * AttachmentPointer size.
             * @member {number} size
             * @memberof signalservice.AttachmentPointer
             * @instance
             */
            AttachmentPointer.prototype.size = 0;

            /**
             * AttachmentPointer thumbnail.
             * @member {Uint8Array} thumbnail
             * @memberof signalservice.AttachmentPointer
             * @instance
             */
            AttachmentPointer.prototype.thumbnail = $util.newBuffer([]);

            /**
             * AttachmentPointer digest.
             * @member {Uint8Array} digest
             * @memberof signalservice.AttachmentPointer
             * @instance
             */
            AttachmentPointer.prototype.digest = $util.newBuffer([]);

            /**
             * AttachmentPointer fileName.
             * @member {string} fileName
             * @memberof signalservice.AttachmentPointer
             * @instance
             */
            AttachmentPointer.prototype.fileName = "";

            /**
             * AttachmentPointer flags.
             * @member {number} flags
             * @memberof signalservice.AttachmentPointer
             * @instance
             */
            AttachmentPointer.prototype.flags = 0;

            /**
             * AttachmentPointer width.
             * @member {number} width
             * @memberof signalservice.AttachmentPointer
             * @instance
             */
            AttachmentPointer.prototype.width = 0;

            /**
             * AttachmentPointer height.
             * @member {number} height
             * @memberof signalservice.AttachmentPointer
             * @instance
             */
            AttachmentPointer.prototype.height = 0;

            /**
             * Creates a new AttachmentPointer instance using the specified properties.
             * @function create
             * @memberof signalservice.AttachmentPointer
             * @static
             * @param {signalservice.IAttachmentPointer=} [properties] Properties to set
             * @returns {signalservice.AttachmentPointer} AttachmentPointer instance
             */
            AttachmentPointer.create = function create(properties) {
                return new AttachmentPointer(properties);
            };

            /**
             * Encodes the specified AttachmentPointer message. Does not implicitly {@link signalservice.AttachmentPointer.verify|verify} messages.
             * @function encode
             * @memberof signalservice.AttachmentPointer
             * @static
             * @param {signalservice.IAttachmentPointer} message AttachmentPointer message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AttachmentPointer.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && message.hasOwnProperty("id"))
                    writer.uint32(/* id 1, wireType 1 =*/9).fixed64(message.id);
                if (message.contentType != null && message.hasOwnProperty("contentType"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.contentType);
                if (message.key != null && message.hasOwnProperty("key"))
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.key);
                if (message.size != null && message.hasOwnProperty("size"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.size);
                if (message.thumbnail != null && message.hasOwnProperty("thumbnail"))
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.thumbnail);
                if (message.digest != null && message.hasOwnProperty("digest"))
                    writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.digest);
                if (message.fileName != null && message.hasOwnProperty("fileName"))
                    writer.uint32(/* id 7, wireType 2 =*/58).string(message.fileName);
                if (message.flags != null && message.hasOwnProperty("flags"))
                    writer.uint32(/* id 8, wireType 0 =*/64).uint32(message.flags);
                if (message.width != null && message.hasOwnProperty("width"))
                    writer.uint32(/* id 9, wireType 0 =*/72).uint32(message.width);
                if (message.height != null && message.hasOwnProperty("height"))
                    writer.uint32(/* id 10, wireType 0 =*/80).uint32(message.height);
                return writer;
            };

            /**
             * Encodes the specified AttachmentPointer message, length delimited. Does not implicitly {@link signalservice.AttachmentPointer.verify|verify} messages.
             * @function encodeDelimited
             * @memberof signalservice.AttachmentPointer
             * @static
             * @param {signalservice.IAttachmentPointer} message AttachmentPointer message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AttachmentPointer.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an AttachmentPointer message from the specified reader or buffer.
             * @function decode
             * @memberof signalservice.AttachmentPointer
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {signalservice.AttachmentPointer} AttachmentPointer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AttachmentPointer.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.AttachmentPointer();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            message.id = reader.fixed64();
                            break;
                        case 2:
                            message.contentType = reader.string();
                            break;
                        case 3:
                            message.key = reader.bytes();
                            break;
                        case 4:
                            message.size = reader.uint32();
                            break;
                        case 5:
                            message.thumbnail = reader.bytes();
                            break;
                        case 6:
                            message.digest = reader.bytes();
                            break;
                        case 7:
                            message.fileName = reader.string();
                            break;
                        case 8:
                            message.flags = reader.uint32();
                            break;
                        case 9:
                            message.width = reader.uint32();
                            break;
                        case 10:
                            message.height = reader.uint32();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return message;
            };

            /**
             * Decodes an AttachmentPointer message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof signalservice.AttachmentPointer
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {signalservice.AttachmentPointer} AttachmentPointer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AttachmentPointer.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an AttachmentPointer message.
             * @function verify
             * @memberof signalservice.AttachmentPointer
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            AttachmentPointer.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                        return "id: integer|Long expected";
                if (message.contentType != null && message.hasOwnProperty("contentType"))
                    if (!$util.isString(message.contentType))
                        return "contentType: string expected";
                if (message.key != null && message.hasOwnProperty("key"))
                    if (!(message.key && typeof message.key.length === "number" || $util.isString(message.key)))
                        return "key: buffer expected";
                if (message.size != null && message.hasOwnProperty("size"))
                    if (!$util.isInteger(message.size))
                        return "size: integer expected";
                if (message.thumbnail != null && message.hasOwnProperty("thumbnail"))
                    if (!(message.thumbnail && typeof message.thumbnail.length === "number" || $util.isString(message.thumbnail)))
                        return "thumbnail: buffer expected";
                if (message.digest != null && message.hasOwnProperty("digest"))
                    if (!(message.digest && typeof message.digest.length === "number" || $util.isString(message.digest)))
                        return "digest: buffer expected";
                if (message.fileName != null && message.hasOwnProperty("fileName"))
                    if (!$util.isString(message.fileName))
                        return "fileName: string expected";
                if (message.flags != null && message.hasOwnProperty("flags"))
                    if (!$util.isInteger(message.flags))
                        return "flags: integer expected";
                if (message.width != null && message.hasOwnProperty("width"))
                    if (!$util.isInteger(message.width))
                        return "width: integer expected";
                if (message.height != null && message.hasOwnProperty("height"))
                    if (!$util.isInteger(message.height))
                        return "height: integer expected";
                return null;
            };

            /**
             * Creates an AttachmentPointer message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof signalservice.AttachmentPointer
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {signalservice.AttachmentPointer} AttachmentPointer
             */
            AttachmentPointer.fromObject = function fromObject(object) {
                if (object instanceof $root.signalservice.AttachmentPointer)
                    return object;
                var message = new $root.signalservice.AttachmentPointer();
                if (object.id != null)
                    if ($util.Long)
                        (message.id = $util.Long.fromValue(object.id)).unsigned = false;
                    else if (typeof object.id === "string")
                        message.id = parseInt(object.id, 10);
                    else if (typeof object.id === "number")
                        message.id = object.id;
                    else if (typeof object.id === "object")
                        message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber();
                if (object.contentType != null)
                    message.contentType = String(object.contentType);
                if (object.key != null)
                    if (typeof object.key === "string")
                        $util.base64.decode(object.key, message.key = $util.newBuffer($util.base64.length(object.key)), 0);
                    else if (object.key.length)
                        message.key = object.key;
                if (object.size != null)
                    message.size = object.size >>> 0;
                if (object.thumbnail != null)
                    if (typeof object.thumbnail === "string")
                        $util.base64.decode(object.thumbnail, message.thumbnail = $util.newBuffer($util.base64.length(object.thumbnail)), 0);
                    else if (object.thumbnail.length)
                        message.thumbnail = object.thumbnail;
                if (object.digest != null)
                    if (typeof object.digest === "string")
                        $util.base64.decode(object.digest, message.digest = $util.newBuffer($util.base64.length(object.digest)), 0);
                    else if (object.digest.length)
                        message.digest = object.digest;
                if (object.fileName != null)
                    message.fileName = String(object.fileName);
                if (object.flags != null)
                    message.flags = object.flags >>> 0;
                if (object.width != null)
                    message.width = object.width >>> 0;
                if (object.height != null)
                    message.height = object.height >>> 0;
                return message;
            };

            /**
             * Creates a plain object from an AttachmentPointer message. Also converts values to other types if specified.
             * @function toObject
             * @memberof signalservice.AttachmentPointer
             * @static
             * @param {signalservice.AttachmentPointer} message AttachmentPointer
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            AttachmentPointer.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.id = options.longs === String ? "0" : 0;
                    object.contentType = "";
                    object.key = options.bytes === String ? "" : [];
                    object.size = 0;
                    object.thumbnail = options.bytes === String ? "" : [];
                    object.digest = options.bytes === String ? "" : [];
                    object.fileName = "";
                    object.flags = 0;
                    object.width = 0;
                    object.height = 0;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    if (typeof message.id === "number")
                        object.id = options.longs === String ? String(message.id) : message.id;
                    else
                        object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber() : message.id;
                if (message.contentType != null && message.hasOwnProperty("contentType"))
                    object.contentType = message.contentType;
                if (message.key != null && message.hasOwnProperty("key"))
                    object.key = options.bytes === String ? $util.base64.encode(message.key, 0, message.key.length) : options.bytes === Array ? Array.prototype.slice.call(message.key) : message.key;
                if (message.size != null && message.hasOwnProperty("size"))
                    object.size = message.size;
                if (message.thumbnail != null && message.hasOwnProperty("thumbnail"))
                    object.thumbnail = options.bytes === String ? $util.base64.encode(message.thumbnail, 0, message.thumbnail.length) : options.bytes === Array ? Array.prototype.slice.call(message.thumbnail) : message.thumbnail;
                if (message.digest != null && message.hasOwnProperty("digest"))
                    object.digest = options.bytes === String ? $util.base64.encode(message.digest, 0, message.digest.length) : options.bytes === Array ? Array.prototype.slice.call(message.digest) : message.digest;
                if (message.fileName != null && message.hasOwnProperty("fileName"))
                    object.fileName = message.fileName;
                if (message.flags != null && message.hasOwnProperty("flags"))
                    object.flags = message.flags;
                if (message.width != null && message.hasOwnProperty("width"))
                    object.width = message.width;
                if (message.height != null && message.hasOwnProperty("height"))
                    object.height = message.height;
                return object;
            };

            /**
             * Converts this AttachmentPointer to JSON.
             * @function toJSON
             * @memberof signalservice.AttachmentPointer
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            AttachmentPointer.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Flags enum.
             * @name signalservice.AttachmentPointer.Flags
             * @enum {string}
             * @property {number} VOICE_MESSAGE=1 VOICE_MESSAGE value
             */
            AttachmentPointer.Flags = (function () {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[1] = "VOICE_MESSAGE"] = 1;
                return values;
            })();

            return AttachmentPointer;
        })();

        signalservice.GroupContext = (function () {

            /**
             * Properties of a GroupContext.
             * @memberof signalservice
             * @interface IGroupContext
             * @property {Uint8Array|null} [id] GroupContext id
             * @property {signalservice.GroupContext.Type|null} [type] GroupContext type
             * @property {string|null} [name] GroupContext name
             * @property {Array.<string>|null} [members] GroupContext members
             * @property {signalservice.IAttachmentPointer|null} [avatar] GroupContext avatar
             */

            /**
             * Constructs a new GroupContext.
             * @memberof signalservice
             * @classdesc Represents a GroupContext.
             * @implements IGroupContext
             * @constructor
             * @param {signalservice.IGroupContext=} [properties] Properties to set
             */
            function GroupContext(properties) {
                this.members = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GroupContext id.
             * @member {Uint8Array} id
             * @memberof signalservice.GroupContext
             * @instance
             */
            GroupContext.prototype.id = $util.newBuffer([]);

            /**
             * GroupContext type.
             * @member {signalservice.GroupContext.Type} type
             * @memberof signalservice.GroupContext
             * @instance
             */
            GroupContext.prototype.type = 0;

            /**
             * GroupContext name.
             * @member {string} name
             * @memberof signalservice.GroupContext
             * @instance
             */
            GroupContext.prototype.name = "";

            /**
             * GroupContext members.
             * @member {Array.<string>} members
             * @memberof signalservice.GroupContext
             * @instance
             */
            GroupContext.prototype.members = $util.emptyArray;

            /**
             * GroupContext avatar.
             * @member {signalservice.IAttachmentPointer|null|undefined} avatar
             * @memberof signalservice.GroupContext
             * @instance
             */
            GroupContext.prototype.avatar = null;

            /**
             * Creates a new GroupContext instance using the specified properties.
             * @function create
             * @memberof signalservice.GroupContext
             * @static
             * @param {signalservice.IGroupContext=} [properties] Properties to set
             * @returns {signalservice.GroupContext} GroupContext instance
             */
            GroupContext.create = function create(properties) {
                return new GroupContext(properties);
            };

            /**
             * Encodes the specified GroupContext message. Does not implicitly {@link signalservice.GroupContext.verify|verify} messages.
             * @function encode
             * @memberof signalservice.GroupContext
             * @static
             * @param {signalservice.IGroupContext} message GroupContext message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GroupContext.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && message.hasOwnProperty("id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.id);
                if (message.type != null && message.hasOwnProperty("type"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.type);
                if (message.name != null && message.hasOwnProperty("name"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.name);
                if (message.members != null && message.members.length)
                    for (var i = 0; i < message.members.length; ++i)
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.members[i]);
                if (message.avatar != null && message.hasOwnProperty("avatar"))
                    $root.signalservice.AttachmentPointer.encode(message.avatar, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified GroupContext message, length delimited. Does not implicitly {@link signalservice.GroupContext.verify|verify} messages.
             * @function encodeDelimited
             * @memberof signalservice.GroupContext
             * @static
             * @param {signalservice.IGroupContext} message GroupContext message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GroupContext.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GroupContext message from the specified reader or buffer.
             * @function decode
             * @memberof signalservice.GroupContext
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {signalservice.GroupContext} GroupContext
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GroupContext.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.GroupContext();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            message.id = reader.bytes();
                            break;
                        case 2:
                            message.type = reader.int32();
                            break;
                        case 3:
                            message.name = reader.string();
                            break;
                        case 4:
                            if (!(message.members && message.members.length))
                                message.members = [];
                            message.members.push(reader.string());
                            break;
                        case 5:
                            message.avatar = $root.signalservice.AttachmentPointer.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return message;
            };

            /**
             * Decodes a GroupContext message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof signalservice.GroupContext
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {signalservice.GroupContext} GroupContext
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GroupContext.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a GroupContext message.
             * @function verify
             * @memberof signalservice.GroupContext
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GroupContext.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!(message.id && typeof message.id.length === "number" || $util.isString(message.id)))
                        return "id: buffer expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    switch (message.type) {
                        default:
                            return "type: enum value expected";
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                            break;
                    }
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.members != null && message.hasOwnProperty("members")) {
                    if (!Array.isArray(message.members))
                        return "members: array expected";
                    for (var i = 0; i < message.members.length; ++i)
                        if (!$util.isString(message.members[i]))
                            return "members: string[] expected";
                }
                if (message.avatar != null && message.hasOwnProperty("avatar")) {
                    var error = $root.signalservice.AttachmentPointer.verify(message.avatar);
                    if (error)
                        return "avatar." + error;
                }
                return null;
            };

            /**
             * Creates a GroupContext message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof signalservice.GroupContext
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {signalservice.GroupContext} GroupContext
             */
            GroupContext.fromObject = function fromObject(object) {
                if (object instanceof $root.signalservice.GroupContext)
                    return object;
                var message = new $root.signalservice.GroupContext();
                if (object.id != null)
                    if (typeof object.id === "string")
                        $util.base64.decode(object.id, message.id = $util.newBuffer($util.base64.length(object.id)), 0);
                    else if (object.id.length)
                        message.id = object.id;
                switch (object.type) {
                    case "UNKNOWN":
                    case 0:
                        message.type = 0;
                        break;
                    case "UPDATE":
                    case 1:
                        message.type = 1;
                        break;
                    case "DELIVER":
                    case 2:
                        message.type = 2;
                        break;
                    case "QUIT":
                    case 3:
                        message.type = 3;
                        break;
                    case "REQUEST_INFO":
                    case 4:
                        message.type = 4;
                        break;
                }
                if (object.name != null)
                    message.name = String(object.name);
                if (object.members) {
                    if (!Array.isArray(object.members))
                        throw TypeError(".signalservice.GroupContext.members: array expected");
                    message.members = [];
                    for (var i = 0; i < object.members.length; ++i)
                        message.members[i] = String(object.members[i]);
                }
                if (object.avatar != null) {
                    if (typeof object.avatar !== "object")
                        throw TypeError(".signalservice.GroupContext.avatar: object expected");
                    message.avatar = $root.signalservice.AttachmentPointer.fromObject(object.avatar);
                }
                return message;
            };

            /**
             * Creates a plain object from a GroupContext message. Also converts values to other types if specified.
             * @function toObject
             * @memberof signalservice.GroupContext
             * @static
             * @param {signalservice.GroupContext} message GroupContext
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            GroupContext.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.members = [];
                if (options.defaults) {
                    object.id = options.bytes === String ? "" : [];
                    object.type = options.enums === String ? "UNKNOWN" : 0;
                    object.name = "";
                    object.avatar = null;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = options.bytes === String ? $util.base64.encode(message.id, 0, message.id.length) : options.bytes === Array ? Array.prototype.slice.call(message.id) : message.id;
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.signalservice.GroupContext.Type[message.type] : message.type;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.members && message.members.length) {
                    object.members = [];
                    for (var j = 0; j < message.members.length; ++j)
                        object.members[j] = message.members[j];
                }
                if (message.avatar != null && message.hasOwnProperty("avatar"))
                    object.avatar = $root.signalservice.AttachmentPointer.toObject(message.avatar, options);
                return object;
            };

            /**
             * Converts this GroupContext to JSON.
             * @function toJSON
             * @memberof signalservice.GroupContext
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GroupContext.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Type enum.
             * @name signalservice.GroupContext.Type
             * @enum {string}
             * @property {number} UNKNOWN=0 UNKNOWN value
             * @property {number} UPDATE=1 UPDATE value
             * @property {number} DELIVER=2 DELIVER value
             * @property {number} QUIT=3 QUIT value
             * @property {number} REQUEST_INFO=4 REQUEST_INFO value
             */
            GroupContext.Type = (function () {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "UNKNOWN"] = 0;
                values[valuesById[1] = "UPDATE"] = 1;
                values[valuesById[2] = "DELIVER"] = 2;
                values[valuesById[3] = "QUIT"] = 3;
                values[valuesById[4] = "REQUEST_INFO"] = 4;
                return values;
            })();

            return GroupContext;
        })();

        signalservice.ContactDetails = (function () {

            /**
             * Properties of a ContactDetails.
             * @memberof signalservice
             * @interface IContactDetails
             * @property {string|null} [number] ContactDetails number
             * @property {string|null} [name] ContactDetails name
             * @property {signalservice.ContactDetails.IAvatar|null} [avatar] ContactDetails avatar
             * @property {string|null} [color] ContactDetails color
             * @property {signalservice.IVerified|null} [verified] ContactDetails verified
             * @property {Uint8Array|null} [profileKey] ContactDetails profileKey
             * @property {boolean|null} [blocked] ContactDetails blocked
             * @property {number|null} [expireTimer] ContactDetails expireTimer
             */

            /**
             * Constructs a new ContactDetails.
             * @memberof signalservice
             * @classdesc Represents a ContactDetails.
             * @implements IContactDetails
             * @constructor
             * @param {signalservice.IContactDetails=} [properties] Properties to set
             */
            function ContactDetails(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ContactDetails number.
             * @member {string} number
             * @memberof signalservice.ContactDetails
             * @instance
             */
            ContactDetails.prototype.number = "";

            /**
             * ContactDetails name.
             * @member {string} name
             * @memberof signalservice.ContactDetails
             * @instance
             */
            ContactDetails.prototype.name = "";

            /**
             * ContactDetails avatar.
             * @member {signalservice.ContactDetails.IAvatar|null|undefined} avatar
             * @memberof signalservice.ContactDetails
             * @instance
             */
            ContactDetails.prototype.avatar = null;

            /**
             * ContactDetails color.
             * @member {string} color
             * @memberof signalservice.ContactDetails
             * @instance
             */
            ContactDetails.prototype.color = "";

            /**
             * ContactDetails verified.
             * @member {signalservice.IVerified|null|undefined} verified
             * @memberof signalservice.ContactDetails
             * @instance
             */
            ContactDetails.prototype.verified = null;

            /**
             * ContactDetails profileKey.
             * @member {Uint8Array} profileKey
             * @memberof signalservice.ContactDetails
             * @instance
             */
            ContactDetails.prototype.profileKey = $util.newBuffer([]);

            /**
             * ContactDetails blocked.
             * @member {boolean} blocked
             * @memberof signalservice.ContactDetails
             * @instance
             */
            ContactDetails.prototype.blocked = false;

            /**
             * ContactDetails expireTimer.
             * @member {number} expireTimer
             * @memberof signalservice.ContactDetails
             * @instance
             */
            ContactDetails.prototype.expireTimer = 0;

            /**
             * Creates a new ContactDetails instance using the specified properties.
             * @function create
             * @memberof signalservice.ContactDetails
             * @static
             * @param {signalservice.IContactDetails=} [properties] Properties to set
             * @returns {signalservice.ContactDetails} ContactDetails instance
             */
            ContactDetails.create = function create(properties) {
                return new ContactDetails(properties);
            };

            /**
             * Encodes the specified ContactDetails message. Does not implicitly {@link signalservice.ContactDetails.verify|verify} messages.
             * @function encode
             * @memberof signalservice.ContactDetails
             * @static
             * @param {signalservice.IContactDetails} message ContactDetails message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ContactDetails.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.number != null && message.hasOwnProperty("number"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.number);
                if (message.name != null && message.hasOwnProperty("name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                if (message.avatar != null && message.hasOwnProperty("avatar"))
                    $root.signalservice.ContactDetails.Avatar.encode(message.avatar, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.color != null && message.hasOwnProperty("color"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.color);
                if (message.verified != null && message.hasOwnProperty("verified"))
                    $root.signalservice.Verified.encode(message.verified, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.profileKey != null && message.hasOwnProperty("profileKey"))
                    writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.profileKey);
                if (message.blocked != null && message.hasOwnProperty("blocked"))
                    writer.uint32(/* id 7, wireType 0 =*/56).bool(message.blocked);
                if (message.expireTimer != null && message.hasOwnProperty("expireTimer"))
                    writer.uint32(/* id 8, wireType 0 =*/64).uint32(message.expireTimer);
                return writer;
            };

            /**
             * Encodes the specified ContactDetails message, length delimited. Does not implicitly {@link signalservice.ContactDetails.verify|verify} messages.
             * @function encodeDelimited
             * @memberof signalservice.ContactDetails
             * @static
             * @param {signalservice.IContactDetails} message ContactDetails message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ContactDetails.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ContactDetails message from the specified reader or buffer.
             * @function decode
             * @memberof signalservice.ContactDetails
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {signalservice.ContactDetails} ContactDetails
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ContactDetails.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.ContactDetails();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            message.number = reader.string();
                            break;
                        case 2:
                            message.name = reader.string();
                            break;
                        case 3:
                            message.avatar = $root.signalservice.ContactDetails.Avatar.decode(reader, reader.uint32());
                            break;
                        case 4:
                            message.color = reader.string();
                            break;
                        case 5:
                            message.verified = $root.signalservice.Verified.decode(reader, reader.uint32());
                            break;
                        case 6:
                            message.profileKey = reader.bytes();
                            break;
                        case 7:
                            message.blocked = reader.bool();
                            break;
                        case 8:
                            message.expireTimer = reader.uint32();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ContactDetails message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof signalservice.ContactDetails
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {signalservice.ContactDetails} ContactDetails
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ContactDetails.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ContactDetails message.
             * @function verify
             * @memberof signalservice.ContactDetails
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ContactDetails.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.number != null && message.hasOwnProperty("number"))
                    if (!$util.isString(message.number))
                        return "number: string expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.avatar != null && message.hasOwnProperty("avatar")) {
                    var error = $root.signalservice.ContactDetails.Avatar.verify(message.avatar);
                    if (error)
                        return "avatar." + error;
                }
                if (message.color != null && message.hasOwnProperty("color"))
                    if (!$util.isString(message.color))
                        return "color: string expected";
                if (message.verified != null && message.hasOwnProperty("verified")) {
                    var error = $root.signalservice.Verified.verify(message.verified);
                    if (error)
                        return "verified." + error;
                }
                if (message.profileKey != null && message.hasOwnProperty("profileKey"))
                    if (!(message.profileKey && typeof message.profileKey.length === "number" || $util.isString(message.profileKey)))
                        return "profileKey: buffer expected";
                if (message.blocked != null && message.hasOwnProperty("blocked"))
                    if (typeof message.blocked !== "boolean")
                        return "blocked: boolean expected";
                if (message.expireTimer != null && message.hasOwnProperty("expireTimer"))
                    if (!$util.isInteger(message.expireTimer))
                        return "expireTimer: integer expected";
                return null;
            };

            /**
             * Creates a ContactDetails message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof signalservice.ContactDetails
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {signalservice.ContactDetails} ContactDetails
             */
            ContactDetails.fromObject = function fromObject(object) {
                if (object instanceof $root.signalservice.ContactDetails)
                    return object;
                var message = new $root.signalservice.ContactDetails();
                if (object.number != null)
                    message.number = String(object.number);
                if (object.name != null)
                    message.name = String(object.name);
                if (object.avatar != null) {
                    if (typeof object.avatar !== "object")
                        throw TypeError(".signalservice.ContactDetails.avatar: object expected");
                    message.avatar = $root.signalservice.ContactDetails.Avatar.fromObject(object.avatar);
                }
                if (object.color != null)
                    message.color = String(object.color);
                if (object.verified != null) {
                    if (typeof object.verified !== "object")
                        throw TypeError(".signalservice.ContactDetails.verified: object expected");
                    message.verified = $root.signalservice.Verified.fromObject(object.verified);
                }
                if (object.profileKey != null)
                    if (typeof object.profileKey === "string")
                        $util.base64.decode(object.profileKey, message.profileKey = $util.newBuffer($util.base64.length(object.profileKey)), 0);
                    else if (object.profileKey.length)
                        message.profileKey = object.profileKey;
                if (object.blocked != null)
                    message.blocked = Boolean(object.blocked);
                if (object.expireTimer != null)
                    message.expireTimer = object.expireTimer >>> 0;
                return message;
            };

            /**
             * Creates a plain object from a ContactDetails message. Also converts values to other types if specified.
             * @function toObject
             * @memberof signalservice.ContactDetails
             * @static
             * @param {signalservice.ContactDetails} message ContactDetails
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ContactDetails.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.number = "";
                    object.name = "";
                    object.avatar = null;
                    object.color = "";
                    object.verified = null;
                    object.profileKey = options.bytes === String ? "" : [];
                    object.blocked = false;
                    object.expireTimer = 0;
                }
                if (message.number != null && message.hasOwnProperty("number"))
                    object.number = message.number;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.avatar != null && message.hasOwnProperty("avatar"))
                    object.avatar = $root.signalservice.ContactDetails.Avatar.toObject(message.avatar, options);
                if (message.color != null && message.hasOwnProperty("color"))
                    object.color = message.color;
                if (message.verified != null && message.hasOwnProperty("verified"))
                    object.verified = $root.signalservice.Verified.toObject(message.verified, options);
                if (message.profileKey != null && message.hasOwnProperty("profileKey"))
                    object.profileKey = options.bytes === String ? $util.base64.encode(message.profileKey, 0, message.profileKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.profileKey) : message.profileKey;
                if (message.blocked != null && message.hasOwnProperty("blocked"))
                    object.blocked = message.blocked;
                if (message.expireTimer != null && message.hasOwnProperty("expireTimer"))
                    object.expireTimer = message.expireTimer;
                return object;
            };

            /**
             * Converts this ContactDetails to JSON.
             * @function toJSON
             * @memberof signalservice.ContactDetails
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ContactDetails.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            ContactDetails.Avatar = (function () {

                /**
                 * Properties of an Avatar.
                 * @memberof signalservice.ContactDetails
                 * @interface IAvatar
                 * @property {string|null} [contentType] Avatar contentType
                 * @property {number|null} [length] Avatar length
                 */

                /**
                 * Constructs a new Avatar.
                 * @memberof signalservice.ContactDetails
                 * @classdesc Represents an Avatar.
                 * @implements IAvatar
                 * @constructor
                 * @param {signalservice.ContactDetails.IAvatar=} [properties] Properties to set
                 */
                function Avatar(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Avatar contentType.
                 * @member {string} contentType
                 * @memberof signalservice.ContactDetails.Avatar
                 * @instance
                 */
                Avatar.prototype.contentType = "";

                /**
                 * Avatar length.
                 * @member {number} length
                 * @memberof signalservice.ContactDetails.Avatar
                 * @instance
                 */
                Avatar.prototype.length = 0;

                /**
                 * Creates a new Avatar instance using the specified properties.
                 * @function create
                 * @memberof signalservice.ContactDetails.Avatar
                 * @static
                 * @param {signalservice.ContactDetails.IAvatar=} [properties] Properties to set
                 * @returns {signalservice.ContactDetails.Avatar} Avatar instance
                 */
                Avatar.create = function create(properties) {
                    return new Avatar(properties);
                };

                /**
                 * Encodes the specified Avatar message. Does not implicitly {@link signalservice.ContactDetails.Avatar.verify|verify} messages.
                 * @function encode
                 * @memberof signalservice.ContactDetails.Avatar
                 * @static
                 * @param {signalservice.ContactDetails.IAvatar} message Avatar message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Avatar.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.contentType != null && message.hasOwnProperty("contentType"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.contentType);
                    if (message.length != null && message.hasOwnProperty("length"))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.length);
                    return writer;
                };

                /**
                 * Encodes the specified Avatar message, length delimited. Does not implicitly {@link signalservice.ContactDetails.Avatar.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof signalservice.ContactDetails.Avatar
                 * @static
                 * @param {signalservice.ContactDetails.IAvatar} message Avatar message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Avatar.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an Avatar message from the specified reader or buffer.
                 * @function decode
                 * @memberof signalservice.ContactDetails.Avatar
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {signalservice.ContactDetails.Avatar} Avatar
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Avatar.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.ContactDetails.Avatar();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                message.contentType = reader.string();
                                break;
                            case 2:
                                message.length = reader.uint32();
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an Avatar message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof signalservice.ContactDetails.Avatar
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {signalservice.ContactDetails.Avatar} Avatar
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Avatar.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an Avatar message.
                 * @function verify
                 * @memberof signalservice.ContactDetails.Avatar
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Avatar.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.contentType != null && message.hasOwnProperty("contentType"))
                        if (!$util.isString(message.contentType))
                            return "contentType: string expected";
                    if (message.length != null && message.hasOwnProperty("length"))
                        if (!$util.isInteger(message.length))
                            return "length: integer expected";
                    return null;
                };

                /**
                 * Creates an Avatar message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof signalservice.ContactDetails.Avatar
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {signalservice.ContactDetails.Avatar} Avatar
                 */
                Avatar.fromObject = function fromObject(object) {
                    if (object instanceof $root.signalservice.ContactDetails.Avatar)
                        return object;
                    var message = new $root.signalservice.ContactDetails.Avatar();
                    if (object.contentType != null)
                        message.contentType = String(object.contentType);
                    if (object.length != null)
                        message.length = object.length >>> 0;
                    return message;
                };

                /**
                 * Creates a plain object from an Avatar message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof signalservice.ContactDetails.Avatar
                 * @static
                 * @param {signalservice.ContactDetails.Avatar} message Avatar
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Avatar.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.contentType = "";
                        object.length = 0;
                    }
                    if (message.contentType != null && message.hasOwnProperty("contentType"))
                        object.contentType = message.contentType;
                    if (message.length != null && message.hasOwnProperty("length"))
                        object.length = message.length;
                    return object;
                };

                /**
                 * Converts this Avatar to JSON.
                 * @function toJSON
                 * @memberof signalservice.ContactDetails.Avatar
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Avatar.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Avatar;
            })();

            return ContactDetails;
        })();

        signalservice.GroupDetails = (function () {

            /**
             * Properties of a GroupDetails.
             * @memberof signalservice
             * @interface IGroupDetails
             * @property {Uint8Array|null} [id] GroupDetails id
             * @property {string|null} [name] GroupDetails name
             * @property {Array.<string>|null} [members] GroupDetails members
             * @property {signalservice.GroupDetails.IAvatar|null} [avatar] GroupDetails avatar
             * @property {boolean|null} [active] GroupDetails active
             * @property {number|null} [expireTimer] GroupDetails expireTimer
             */

            /**
             * Constructs a new GroupDetails.
             * @memberof signalservice
             * @classdesc Represents a GroupDetails.
             * @implements IGroupDetails
             * @constructor
             * @param {signalservice.IGroupDetails=} [properties] Properties to set
             */
            function GroupDetails(properties) {
                this.members = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GroupDetails id.
             * @member {Uint8Array} id
             * @memberof signalservice.GroupDetails
             * @instance
             */
            GroupDetails.prototype.id = $util.newBuffer([]);

            /**
             * GroupDetails name.
             * @member {string} name
             * @memberof signalservice.GroupDetails
             * @instance
             */
            GroupDetails.prototype.name = "";

            /**
             * GroupDetails members.
             * @member {Array.<string>} members
             * @memberof signalservice.GroupDetails
             * @instance
             */
            GroupDetails.prototype.members = $util.emptyArray;

            /**
             * GroupDetails avatar.
             * @member {signalservice.GroupDetails.IAvatar|null|undefined} avatar
             * @memberof signalservice.GroupDetails
             * @instance
             */
            GroupDetails.prototype.avatar = null;

            /**
             * GroupDetails active.
             * @member {boolean} active
             * @memberof signalservice.GroupDetails
             * @instance
             */
            GroupDetails.prototype.active = true;

            /**
             * GroupDetails expireTimer.
             * @member {number} expireTimer
             * @memberof signalservice.GroupDetails
             * @instance
             */
            GroupDetails.prototype.expireTimer = 0;

            /**
             * Creates a new GroupDetails instance using the specified properties.
             * @function create
             * @memberof signalservice.GroupDetails
             * @static
             * @param {signalservice.IGroupDetails=} [properties] Properties to set
             * @returns {signalservice.GroupDetails} GroupDetails instance
             */
            GroupDetails.create = function create(properties) {
                return new GroupDetails(properties);
            };

            /**
             * Encodes the specified GroupDetails message. Does not implicitly {@link signalservice.GroupDetails.verify|verify} messages.
             * @function encode
             * @memberof signalservice.GroupDetails
             * @static
             * @param {signalservice.IGroupDetails} message GroupDetails message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GroupDetails.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && message.hasOwnProperty("id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.id);
                if (message.name != null && message.hasOwnProperty("name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                if (message.members != null && message.members.length)
                    for (var i = 0; i < message.members.length; ++i)
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.members[i]);
                if (message.avatar != null && message.hasOwnProperty("avatar"))
                    $root.signalservice.GroupDetails.Avatar.encode(message.avatar, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.active != null && message.hasOwnProperty("active"))
                    writer.uint32(/* id 5, wireType 0 =*/40).bool(message.active);
                if (message.expireTimer != null && message.hasOwnProperty("expireTimer"))
                    writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.expireTimer);
                return writer;
            };

            /**
             * Encodes the specified GroupDetails message, length delimited. Does not implicitly {@link signalservice.GroupDetails.verify|verify} messages.
             * @function encodeDelimited
             * @memberof signalservice.GroupDetails
             * @static
             * @param {signalservice.IGroupDetails} message GroupDetails message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GroupDetails.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GroupDetails message from the specified reader or buffer.
             * @function decode
             * @memberof signalservice.GroupDetails
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {signalservice.GroupDetails} GroupDetails
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GroupDetails.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.GroupDetails();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            message.id = reader.bytes();
                            break;
                        case 2:
                            message.name = reader.string();
                            break;
                        case 3:
                            if (!(message.members && message.members.length))
                                message.members = [];
                            message.members.push(reader.string());
                            break;
                        case 4:
                            message.avatar = $root.signalservice.GroupDetails.Avatar.decode(reader, reader.uint32());
                            break;
                        case 5:
                            message.active = reader.bool();
                            break;
                        case 6:
                            message.expireTimer = reader.uint32();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return message;
            };

            /**
             * Decodes a GroupDetails message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof signalservice.GroupDetails
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {signalservice.GroupDetails} GroupDetails
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GroupDetails.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a GroupDetails message.
             * @function verify
             * @memberof signalservice.GroupDetails
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GroupDetails.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!(message.id && typeof message.id.length === "number" || $util.isString(message.id)))
                        return "id: buffer expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.members != null && message.hasOwnProperty("members")) {
                    if (!Array.isArray(message.members))
                        return "members: array expected";
                    for (var i = 0; i < message.members.length; ++i)
                        if (!$util.isString(message.members[i]))
                            return "members: string[] expected";
                }
                if (message.avatar != null && message.hasOwnProperty("avatar")) {
                    var error = $root.signalservice.GroupDetails.Avatar.verify(message.avatar);
                    if (error)
                        return "avatar." + error;
                }
                if (message.active != null && message.hasOwnProperty("active"))
                    if (typeof message.active !== "boolean")
                        return "active: boolean expected";
                if (message.expireTimer != null && message.hasOwnProperty("expireTimer"))
                    if (!$util.isInteger(message.expireTimer))
                        return "expireTimer: integer expected";
                return null;
            };

            /**
             * Creates a GroupDetails message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof signalservice.GroupDetails
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {signalservice.GroupDetails} GroupDetails
             */
            GroupDetails.fromObject = function fromObject(object) {
                if (object instanceof $root.signalservice.GroupDetails)
                    return object;
                var message = new $root.signalservice.GroupDetails();
                if (object.id != null)
                    if (typeof object.id === "string")
                        $util.base64.decode(object.id, message.id = $util.newBuffer($util.base64.length(object.id)), 0);
                    else if (object.id.length)
                        message.id = object.id;
                if (object.name != null)
                    message.name = String(object.name);
                if (object.members) {
                    if (!Array.isArray(object.members))
                        throw TypeError(".signalservice.GroupDetails.members: array expected");
                    message.members = [];
                    for (var i = 0; i < object.members.length; ++i)
                        message.members[i] = String(object.members[i]);
                }
                if (object.avatar != null) {
                    if (typeof object.avatar !== "object")
                        throw TypeError(".signalservice.GroupDetails.avatar: object expected");
                    message.avatar = $root.signalservice.GroupDetails.Avatar.fromObject(object.avatar);
                }
                if (object.active != null)
                    message.active = Boolean(object.active);
                if (object.expireTimer != null)
                    message.expireTimer = object.expireTimer >>> 0;
                return message;
            };

            /**
             * Creates a plain object from a GroupDetails message. Also converts values to other types if specified.
             * @function toObject
             * @memberof signalservice.GroupDetails
             * @static
             * @param {signalservice.GroupDetails} message GroupDetails
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            GroupDetails.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.members = [];
                if (options.defaults) {
                    object.id = options.bytes === String ? "" : [];
                    object.name = "";
                    object.avatar = null;
                    object.active = true;
                    object.expireTimer = 0;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = options.bytes === String ? $util.base64.encode(message.id, 0, message.id.length) : options.bytes === Array ? Array.prototype.slice.call(message.id) : message.id;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.members && message.members.length) {
                    object.members = [];
                    for (var j = 0; j < message.members.length; ++j)
                        object.members[j] = message.members[j];
                }
                if (message.avatar != null && message.hasOwnProperty("avatar"))
                    object.avatar = $root.signalservice.GroupDetails.Avatar.toObject(message.avatar, options);
                if (message.active != null && message.hasOwnProperty("active"))
                    object.active = message.active;
                if (message.expireTimer != null && message.hasOwnProperty("expireTimer"))
                    object.expireTimer = message.expireTimer;
                return object;
            };

            /**
             * Converts this GroupDetails to JSON.
             * @function toJSON
             * @memberof signalservice.GroupDetails
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GroupDetails.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            GroupDetails.Avatar = (function () {

                /**
                 * Properties of an Avatar.
                 * @memberof signalservice.GroupDetails
                 * @interface IAvatar
                 * @property {string|null} [contentType] Avatar contentType
                 * @property {number|null} [length] Avatar length
                 */

                /**
                 * Constructs a new Avatar.
                 * @memberof signalservice.GroupDetails
                 * @classdesc Represents an Avatar.
                 * @implements IAvatar
                 * @constructor
                 * @param {signalservice.GroupDetails.IAvatar=} [properties] Properties to set
                 */
                function Avatar(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Avatar contentType.
                 * @member {string} contentType
                 * @memberof signalservice.GroupDetails.Avatar
                 * @instance
                 */
                Avatar.prototype.contentType = "";

                /**
                 * Avatar length.
                 * @member {number} length
                 * @memberof signalservice.GroupDetails.Avatar
                 * @instance
                 */
                Avatar.prototype.length = 0;

                /**
                 * Creates a new Avatar instance using the specified properties.
                 * @function create
                 * @memberof signalservice.GroupDetails.Avatar
                 * @static
                 * @param {signalservice.GroupDetails.IAvatar=} [properties] Properties to set
                 * @returns {signalservice.GroupDetails.Avatar} Avatar instance
                 */
                Avatar.create = function create(properties) {
                    return new Avatar(properties);
                };

                /**
                 * Encodes the specified Avatar message. Does not implicitly {@link signalservice.GroupDetails.Avatar.verify|verify} messages.
                 * @function encode
                 * @memberof signalservice.GroupDetails.Avatar
                 * @static
                 * @param {signalservice.GroupDetails.IAvatar} message Avatar message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Avatar.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.contentType != null && message.hasOwnProperty("contentType"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.contentType);
                    if (message.length != null && message.hasOwnProperty("length"))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.length);
                    return writer;
                };

                /**
                 * Encodes the specified Avatar message, length delimited. Does not implicitly {@link signalservice.GroupDetails.Avatar.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof signalservice.GroupDetails.Avatar
                 * @static
                 * @param {signalservice.GroupDetails.IAvatar} message Avatar message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Avatar.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an Avatar message from the specified reader or buffer.
                 * @function decode
                 * @memberof signalservice.GroupDetails.Avatar
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {signalservice.GroupDetails.Avatar} Avatar
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Avatar.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.GroupDetails.Avatar();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                message.contentType = reader.string();
                                break;
                            case 2:
                                message.length = reader.uint32();
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an Avatar message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof signalservice.GroupDetails.Avatar
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {signalservice.GroupDetails.Avatar} Avatar
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Avatar.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an Avatar message.
                 * @function verify
                 * @memberof signalservice.GroupDetails.Avatar
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Avatar.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.contentType != null && message.hasOwnProperty("contentType"))
                        if (!$util.isString(message.contentType))
                            return "contentType: string expected";
                    if (message.length != null && message.hasOwnProperty("length"))
                        if (!$util.isInteger(message.length))
                            return "length: integer expected";
                    return null;
                };

                /**
                 * Creates an Avatar message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof signalservice.GroupDetails.Avatar
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {signalservice.GroupDetails.Avatar} Avatar
                 */
                Avatar.fromObject = function fromObject(object) {
                    if (object instanceof $root.signalservice.GroupDetails.Avatar)
                        return object;
                    var message = new $root.signalservice.GroupDetails.Avatar();
                    if (object.contentType != null)
                        message.contentType = String(object.contentType);
                    if (object.length != null)
                        message.length = object.length >>> 0;
                    return message;
                };

                /**
                 * Creates a plain object from an Avatar message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof signalservice.GroupDetails.Avatar
                 * @static
                 * @param {signalservice.GroupDetails.Avatar} message Avatar
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Avatar.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.contentType = "";
                        object.length = 0;
                    }
                    if (message.contentType != null && message.hasOwnProperty("contentType"))
                        object.contentType = message.contentType;
                    if (message.length != null && message.hasOwnProperty("length"))
                        object.length = message.length;
                    return object;
                };

                /**
                 * Converts this Avatar to JSON.
                 * @function toJSON
                 * @memberof signalservice.GroupDetails.Avatar
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Avatar.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Avatar;
            })();

            return GroupDetails;
        })();

        signalservice.WebSocketRequestMessage = (function () {

            /**
             * Properties of a WebSocketRequestMessage.
             * @memberof signalservice
             * @interface IWebSocketRequestMessage
             * @property {string|null} [verb] WebSocketRequestMessage verb
             * @property {string|null} [path] WebSocketRequestMessage path
             * @property {Uint8Array|null} [body] WebSocketRequestMessage body
             * @property {number|Long|null} [id] WebSocketRequestMessage id
             */

            /**
             * Constructs a new WebSocketRequestMessage.
             * @memberof signalservice
             * @classdesc Represents a WebSocketRequestMessage.
             * @implements IWebSocketRequestMessage
             * @constructor
             * @param {signalservice.IWebSocketRequestMessage=} [properties] Properties to set
             */
            function WebSocketRequestMessage(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * WebSocketRequestMessage verb.
             * @member {string} verb
             * @memberof signalservice.WebSocketRequestMessage
             * @instance
             */
            WebSocketRequestMessage.prototype.verb = "";

            /**
             * WebSocketRequestMessage path.
             * @member {string} path
             * @memberof signalservice.WebSocketRequestMessage
             * @instance
             */
            WebSocketRequestMessage.prototype.path = "";

            /**
             * WebSocketRequestMessage body.
             * @member {Uint8Array} body
             * @memberof signalservice.WebSocketRequestMessage
             * @instance
             */
            WebSocketRequestMessage.prototype.body = $util.newBuffer([]);

            /**
             * WebSocketRequestMessage id.
             * @member {number|Long} id
             * @memberof signalservice.WebSocketRequestMessage
             * @instance
             */
            WebSocketRequestMessage.prototype.id = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;

            /**
             * Creates a new WebSocketRequestMessage instance using the specified properties.
             * @function create
             * @memberof signalservice.WebSocketRequestMessage
             * @static
             * @param {signalservice.IWebSocketRequestMessage=} [properties] Properties to set
             * @returns {signalservice.WebSocketRequestMessage} WebSocketRequestMessage instance
             */
            WebSocketRequestMessage.create = function create(properties) {
                return new WebSocketRequestMessage(properties);
            };

            /**
             * Encodes the specified WebSocketRequestMessage message. Does not implicitly {@link signalservice.WebSocketRequestMessage.verify|verify} messages.
             * @function encode
             * @memberof signalservice.WebSocketRequestMessage
             * @static
             * @param {signalservice.IWebSocketRequestMessage} message WebSocketRequestMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WebSocketRequestMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.verb != null && message.hasOwnProperty("verb"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.verb);
                if (message.path != null && message.hasOwnProperty("path"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.path);
                if (message.body != null && message.hasOwnProperty("body"))
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.body);
                if (message.id != null && message.hasOwnProperty("id"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.id);
                return writer;
            };

            /**
             * Encodes the specified WebSocketRequestMessage message, length delimited. Does not implicitly {@link signalservice.WebSocketRequestMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof signalservice.WebSocketRequestMessage
             * @static
             * @param {signalservice.IWebSocketRequestMessage} message WebSocketRequestMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WebSocketRequestMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a WebSocketRequestMessage message from the specified reader or buffer.
             * @function decode
             * @memberof signalservice.WebSocketRequestMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {signalservice.WebSocketRequestMessage} WebSocketRequestMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WebSocketRequestMessage.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.WebSocketRequestMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            message.verb = reader.string();
                            break;
                        case 2:
                            message.path = reader.string();
                            break;
                        case 3:
                            message.body = reader.bytes();
                            break;
                        case 4:
                            message.id = reader.uint64();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return message;
            };

            /**
             * Decodes a WebSocketRequestMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof signalservice.WebSocketRequestMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {signalservice.WebSocketRequestMessage} WebSocketRequestMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WebSocketRequestMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a WebSocketRequestMessage message.
             * @function verify
             * @memberof signalservice.WebSocketRequestMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            WebSocketRequestMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.verb != null && message.hasOwnProperty("verb"))
                    if (!$util.isString(message.verb))
                        return "verb: string expected";
                if (message.path != null && message.hasOwnProperty("path"))
                    if (!$util.isString(message.path))
                        return "path: string expected";
                if (message.body != null && message.hasOwnProperty("body"))
                    if (!(message.body && typeof message.body.length === "number" || $util.isString(message.body)))
                        return "body: buffer expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                        return "id: integer|Long expected";
                return null;
            };

            /**
             * Creates a WebSocketRequestMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof signalservice.WebSocketRequestMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {signalservice.WebSocketRequestMessage} WebSocketRequestMessage
             */
            WebSocketRequestMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.signalservice.WebSocketRequestMessage)
                    return object;
                var message = new $root.signalservice.WebSocketRequestMessage();
                if (object.verb != null)
                    message.verb = String(object.verb);
                if (object.path != null)
                    message.path = String(object.path);
                if (object.body != null)
                    if (typeof object.body === "string")
                        $util.base64.decode(object.body, message.body = $util.newBuffer($util.base64.length(object.body)), 0);
                    else if (object.body.length)
                        message.body = object.body;
                if (object.id != null)
                    if ($util.Long)
                        (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                    else if (typeof object.id === "string")
                        message.id = parseInt(object.id, 10);
                    else if (typeof object.id === "number")
                        message.id = object.id;
                    else if (typeof object.id === "object")
                        message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
                return message;
            };

            /**
             * Creates a plain object from a WebSocketRequestMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof signalservice.WebSocketRequestMessage
             * @static
             * @param {signalservice.WebSocketRequestMessage} message WebSocketRequestMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            WebSocketRequestMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.verb = "";
                    object.path = "";
                    object.body = options.bytes === String ? "" : [];
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.id = options.longs === String ? "0" : 0;
                }
                if (message.verb != null && message.hasOwnProperty("verb"))
                    object.verb = message.verb;
                if (message.path != null && message.hasOwnProperty("path"))
                    object.path = message.path;
                if (message.body != null && message.hasOwnProperty("body"))
                    object.body = options.bytes === String ? $util.base64.encode(message.body, 0, message.body.length) : options.bytes === Array ? Array.prototype.slice.call(message.body) : message.body;
                if (message.id != null && message.hasOwnProperty("id"))
                    if (typeof message.id === "number")
                        object.id = options.longs === String ? String(message.id) : message.id;
                    else
                        object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
                return object;
            };

            /**
             * Converts this WebSocketRequestMessage to JSON.
             * @function toJSON
             * @memberof signalservice.WebSocketRequestMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            WebSocketRequestMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return WebSocketRequestMessage;
        })();

        signalservice.WebSocketResponseMessage = (function () {

            /**
             * Properties of a WebSocketResponseMessage.
             * @memberof signalservice
             * @interface IWebSocketResponseMessage
             * @property {number|Long|null} [id] WebSocketResponseMessage id
             * @property {number|null} [status] WebSocketResponseMessage status
             * @property {string|null} [message] WebSocketResponseMessage message
             * @property {Uint8Array|null} [body] WebSocketResponseMessage body
             */

            /**
             * Constructs a new WebSocketResponseMessage.
             * @memberof signalservice
             * @classdesc Represents a WebSocketResponseMessage.
             * @implements IWebSocketResponseMessage
             * @constructor
             * @param {signalservice.IWebSocketResponseMessage=} [properties] Properties to set
             */
            function WebSocketResponseMessage(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * WebSocketResponseMessage id.
             * @member {number|Long} id
             * @memberof signalservice.WebSocketResponseMessage
             * @instance
             */
            WebSocketResponseMessage.prototype.id = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;

            /**
             * WebSocketResponseMessage status.
             * @member {number} status
             * @memberof signalservice.WebSocketResponseMessage
             * @instance
             */
            WebSocketResponseMessage.prototype.status = 0;

            /**
             * WebSocketResponseMessage message.
             * @member {string} message
             * @memberof signalservice.WebSocketResponseMessage
             * @instance
             */
            WebSocketResponseMessage.prototype.message = "";

            /**
             * WebSocketResponseMessage body.
             * @member {Uint8Array} body
             * @memberof signalservice.WebSocketResponseMessage
             * @instance
             */
            WebSocketResponseMessage.prototype.body = $util.newBuffer([]);

            /**
             * Creates a new WebSocketResponseMessage instance using the specified properties.
             * @function create
             * @memberof signalservice.WebSocketResponseMessage
             * @static
             * @param {signalservice.IWebSocketResponseMessage=} [properties] Properties to set
             * @returns {signalservice.WebSocketResponseMessage} WebSocketResponseMessage instance
             */
            WebSocketResponseMessage.create = function create(properties) {
                return new WebSocketResponseMessage(properties);
            };

            /**
             * Encodes the specified WebSocketResponseMessage message. Does not implicitly {@link signalservice.WebSocketResponseMessage.verify|verify} messages.
             * @function encode
             * @memberof signalservice.WebSocketResponseMessage
             * @static
             * @param {signalservice.IWebSocketResponseMessage} message WebSocketResponseMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WebSocketResponseMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && message.hasOwnProperty("id"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
                if (message.status != null && message.hasOwnProperty("status"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.status);
                if (message.message != null && message.hasOwnProperty("message"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.message);
                if (message.body != null && message.hasOwnProperty("body"))
                    writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.body);
                return writer;
            };

            /**
             * Encodes the specified WebSocketResponseMessage message, length delimited. Does not implicitly {@link signalservice.WebSocketResponseMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof signalservice.WebSocketResponseMessage
             * @static
             * @param {signalservice.IWebSocketResponseMessage} message WebSocketResponseMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WebSocketResponseMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a WebSocketResponseMessage message from the specified reader or buffer.
             * @function decode
             * @memberof signalservice.WebSocketResponseMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {signalservice.WebSocketResponseMessage} WebSocketResponseMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WebSocketResponseMessage.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.WebSocketResponseMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            message.id = reader.uint64();
                            break;
                        case 2:
                            message.status = reader.uint32();
                            break;
                        case 3:
                            message.message = reader.string();
                            break;
                        case 4:
                            message.body = reader.bytes();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return message;
            };

            /**
             * Decodes a WebSocketResponseMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof signalservice.WebSocketResponseMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {signalservice.WebSocketResponseMessage} WebSocketResponseMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WebSocketResponseMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a WebSocketResponseMessage message.
             * @function verify
             * @memberof signalservice.WebSocketResponseMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            WebSocketResponseMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                        return "id: integer|Long expected";
                if (message.status != null && message.hasOwnProperty("status"))
                    if (!$util.isInteger(message.status))
                        return "status: integer expected";
                if (message.message != null && message.hasOwnProperty("message"))
                    if (!$util.isString(message.message))
                        return "message: string expected";
                if (message.body != null && message.hasOwnProperty("body"))
                    if (!(message.body && typeof message.body.length === "number" || $util.isString(message.body)))
                        return "body: buffer expected";
                return null;
            };

            /**
             * Creates a WebSocketResponseMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof signalservice.WebSocketResponseMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {signalservice.WebSocketResponseMessage} WebSocketResponseMessage
             */
            WebSocketResponseMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.signalservice.WebSocketResponseMessage)
                    return object;
                var message = new $root.signalservice.WebSocketResponseMessage();
                if (object.id != null)
                    if ($util.Long)
                        (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                    else if (typeof object.id === "string")
                        message.id = parseInt(object.id, 10);
                    else if (typeof object.id === "number")
                        message.id = object.id;
                    else if (typeof object.id === "object")
                        message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
                if (object.status != null)
                    message.status = object.status >>> 0;
                if (object.message != null)
                    message.message = String(object.message);
                if (object.body != null)
                    if (typeof object.body === "string")
                        $util.base64.decode(object.body, message.body = $util.newBuffer($util.base64.length(object.body)), 0);
                    else if (object.body.length)
                        message.body = object.body;
                return message;
            };

            /**
             * Creates a plain object from a WebSocketResponseMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof signalservice.WebSocketResponseMessage
             * @static
             * @param {signalservice.WebSocketResponseMessage} message WebSocketResponseMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            WebSocketResponseMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.id = options.longs === String ? "0" : 0;
                    object.status = 0;
                    object.message = "";
                    object.body = options.bytes === String ? "" : [];
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    if (typeof message.id === "number")
                        object.id = options.longs === String ? String(message.id) : message.id;
                    else
                        object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = message.status;
                if (message.message != null && message.hasOwnProperty("message"))
                    object.message = message.message;
                if (message.body != null && message.hasOwnProperty("body"))
                    object.body = options.bytes === String ? $util.base64.encode(message.body, 0, message.body.length) : options.bytes === Array ? Array.prototype.slice.call(message.body) : message.body;
                return object;
            };

            /**
             * Converts this WebSocketResponseMessage to JSON.
             * @function toJSON
             * @memberof signalservice.WebSocketResponseMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            WebSocketResponseMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return WebSocketResponseMessage;
        })();

        signalservice.WebSocketMessage = (function () {

            /**
             * Properties of a WebSocketMessage.
             * @memberof signalservice
             * @interface IWebSocketMessage
             * @property {signalservice.WebSocketMessage.Type|null} [type] WebSocketMessage type
             * @property {signalservice.IWebSocketRequestMessage|null} [request] WebSocketMessage request
             * @property {signalservice.IWebSocketResponseMessage|null} [response] WebSocketMessage response
             */

            /**
             * Constructs a new WebSocketMessage.
             * @memberof signalservice
             * @classdesc Represents a WebSocketMessage.
             * @implements IWebSocketMessage
             * @constructor
             * @param {signalservice.IWebSocketMessage=} [properties] Properties to set
             */
            function WebSocketMessage(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * WebSocketMessage type.
             * @member {signalservice.WebSocketMessage.Type} type
             * @memberof signalservice.WebSocketMessage
             * @instance
             */
            WebSocketMessage.prototype.type = 0;

            /**
             * WebSocketMessage request.
             * @member {signalservice.IWebSocketRequestMessage|null|undefined} request
             * @memberof signalservice.WebSocketMessage
             * @instance
             */
            WebSocketMessage.prototype.request = null;

            /**
             * WebSocketMessage response.
             * @member {signalservice.IWebSocketResponseMessage|null|undefined} response
             * @memberof signalservice.WebSocketMessage
             * @instance
             */
            WebSocketMessage.prototype.response = null;

            /**
             * Creates a new WebSocketMessage instance using the specified properties.
             * @function create
             * @memberof signalservice.WebSocketMessage
             * @static
             * @param {signalservice.IWebSocketMessage=} [properties] Properties to set
             * @returns {signalservice.WebSocketMessage} WebSocketMessage instance
             */
            WebSocketMessage.create = function create(properties) {
                return new WebSocketMessage(properties);
            };

            /**
             * Encodes the specified WebSocketMessage message. Does not implicitly {@link signalservice.WebSocketMessage.verify|verify} messages.
             * @function encode
             * @memberof signalservice.WebSocketMessage
             * @static
             * @param {signalservice.IWebSocketMessage} message WebSocketMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WebSocketMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.type != null && message.hasOwnProperty("type"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
                if (message.request != null && message.hasOwnProperty("request"))
                    $root.signalservice.WebSocketRequestMessage.encode(message.request, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.response != null && message.hasOwnProperty("response"))
                    $root.signalservice.WebSocketResponseMessage.encode(message.response, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified WebSocketMessage message, length delimited. Does not implicitly {@link signalservice.WebSocketMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof signalservice.WebSocketMessage
             * @static
             * @param {signalservice.IWebSocketMessage} message WebSocketMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WebSocketMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a WebSocketMessage message from the specified reader or buffer.
             * @function decode
             * @memberof signalservice.WebSocketMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {signalservice.WebSocketMessage} WebSocketMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WebSocketMessage.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.signalservice.WebSocketMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            message.type = reader.int32();
                            break;
                        case 2:
                            message.request = $root.signalservice.WebSocketRequestMessage.decode(reader, reader.uint32());
                            break;
                        case 3:
                            message.response = $root.signalservice.WebSocketResponseMessage.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return message;
            };

            /**
             * Decodes a WebSocketMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof signalservice.WebSocketMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {signalservice.WebSocketMessage} WebSocketMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WebSocketMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a WebSocketMessage message.
             * @function verify
             * @memberof signalservice.WebSocketMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            WebSocketMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    switch (message.type) {
                        default:
                            return "type: enum value expected";
                        case 0:
                        case 1:
                        case 2:
                            break;
                    }
                if (message.request != null && message.hasOwnProperty("request")) {
                    var error = $root.signalservice.WebSocketRequestMessage.verify(message.request);
                    if (error)
                        return "request." + error;
                }
                if (message.response != null && message.hasOwnProperty("response")) {
                    var error = $root.signalservice.WebSocketResponseMessage.verify(message.response);
                    if (error)
                        return "response." + error;
                }
                return null;
            };

            /**
             * Creates a WebSocketMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof signalservice.WebSocketMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {signalservice.WebSocketMessage} WebSocketMessage
             */
            WebSocketMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.signalservice.WebSocketMessage)
                    return object;
                var message = new $root.signalservice.WebSocketMessage();
                switch (object.type) {
                    case "UNKNOWN":
                    case 0:
                        message.type = 0;
                        break;
                    case "REQUEST":
                    case 1:
                        message.type = 1;
                        break;
                    case "RESPONSE":
                    case 2:
                        message.type = 2;
                        break;
                }
                if (object.request != null) {
                    if (typeof object.request !== "object")
                        throw TypeError(".signalservice.WebSocketMessage.request: object expected");
                    message.request = $root.signalservice.WebSocketRequestMessage.fromObject(object.request);
                }
                if (object.response != null) {
                    if (typeof object.response !== "object")
                        throw TypeError(".signalservice.WebSocketMessage.response: object expected");
                    message.response = $root.signalservice.WebSocketResponseMessage.fromObject(object.response);
                }
                return message;
            };

            /**
             * Creates a plain object from a WebSocketMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof signalservice.WebSocketMessage
             * @static
             * @param {signalservice.WebSocketMessage} message WebSocketMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            WebSocketMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.type = options.enums === String ? "UNKNOWN" : 0;
                    object.request = null;
                    object.response = null;
                }
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.signalservice.WebSocketMessage.Type[message.type] : message.type;
                if (message.request != null && message.hasOwnProperty("request"))
                    object.request = $root.signalservice.WebSocketRequestMessage.toObject(message.request, options);
                if (message.response != null && message.hasOwnProperty("response"))
                    object.response = $root.signalservice.WebSocketResponseMessage.toObject(message.response, options);
                return object;
            };

            /**
             * Converts this WebSocketMessage to JSON.
             * @function toJSON
             * @memberof signalservice.WebSocketMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            WebSocketMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Type enum.
             * @name signalservice.WebSocketMessage.Type
             * @enum {string}
             * @property {number} UNKNOWN=0 UNKNOWN value
             * @property {number} REQUEST=1 REQUEST value
             * @property {number} RESPONSE=2 RESPONSE value
             */
            WebSocketMessage.Type = (function () {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "UNKNOWN"] = 0;
                values[valuesById[1] = "REQUEST"] = 1;
                values[valuesById[2] = "RESPONSE"] = 2;
                return values;
            })();

            return WebSocketMessage;
        })();

        return signalservice;
    })();

    window.ts.protobuf = $root;
})();