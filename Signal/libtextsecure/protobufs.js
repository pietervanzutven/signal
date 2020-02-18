;(function() {
    'use strict';
    window.textsecure = window.textsecure || {};
    window.textsecure.protobuf = {};

    function loadProtoBufs(filename) {
        return dcodeIO.ProtoBuf.loadProtoFile({root: '/protos', file: filename}, function(error, result) {
            if (error) {
              throw error;
            }
            var protos = result.build('signalservice');
            for (var protoName in protos) {
               textsecure.protobuf[protoName] = protos[protoName];
            }
        });
    };

    loadProtoBufs('SubProtocol.proto');
    loadProtoBufs('DeviceMessages.proto');
    loadProtoBufs('SignalService.proto');
    loadProtoBufs('SubProtocol.proto');
    loadProtoBufs('DeviceMessages.proto');
    loadProtoBufs('Stickers.proto');

    // Just for encrypting device names
    loadProtoBufs('DeviceName.proto');

    // Metadata-specific protos
    loadProtoBufs('UnidentifiedDelivery.proto');
})();