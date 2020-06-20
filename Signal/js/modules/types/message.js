(function () {
    const Attachment = window.types.attachment;


    const GROUP = 'group';
    const PRIVATE = 'private';

    // Public API
    window.types = window.types || {};
    window.types.message = {};
    window.types.message.GROUP = GROUP;
    window.types.message.PRIVATE = PRIVATE;

    // Schema
    // Message -> Promise Message
    window.types.message.upgradeSchema = async message =>
        Object.assign({}, message, {
            attachments:
              await Promise.all(message.attachments.map(Attachment.upgradeSchema)),
        })
})()