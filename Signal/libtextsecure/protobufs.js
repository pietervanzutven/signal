(function() {
  'use strict';
  window.textsecure = window.textsecure || {};
  window.textsecure.protobuf = {};

  function loadProtoBufs(filename) {
    return dcodeIO.ProtoBuf.loadProtoFile(
      { root: window.PROTO_ROOT, file: filename },
      function(error, result) {
        if (error) {
          var text =
            'Error loading protos from ' +
            filename +
            ' (root: ' +
            window.PROTO_ROOT +
            ') ' +
            (error && error.stack ? error.stack : error);
          window.log.error(text);
          throw error;
        }
        var protos = result.build('signalservice');
        if (!protos) {
          var text =
            'Error loading protos from ' +
            filename +
            ' (root: ' +
            window.PROTO_ROOT +
            ')';
          window.log.error(text);
          throw new Error(text);
        }
        for (var protoName in protos) {
          textsecure.protobuf[protoName] = protos[protoName];
        }
      }
    );
  }

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
