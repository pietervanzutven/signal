(function () {
    const Attachment = window.attachment;


    const GROUP = 'group';
    const PRIVATE = 'private';

    // Public API
    window.message = {};
    window.message.GROUP = GROUP;
    window.message.PRIVATE = PRIVATE;

    // Schema
    // Message -> Promise Message
    window.message.upgradeSchema = async message =>
        Object.assign({}, message, {
            attachments:
              await Promise.all(message.attachments.map(Attachment.upgradeSchema)),
        })
})()