require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getStringForProfileChange(change, changedContact, i18n) {
        if (change.type === 'name') {
            return changedContact.name
                ? i18n('contactChangedProfileName', {
                    sender: changedContact.title,
                    oldProfile: change.oldName,
                    newProfile: change.newName,
                })
                : i18n('changedProfileName', {
                    oldProfile: change.oldName,
                    newProfile: change.newName,
                });
        }
        else {
            throw new Error('TimelineItem: Unknown type!');
        }
    }
    exports.getStringForProfileChange = getStringForProfileChange;
});