require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const reselect_1 = require("reselect");
    const getSafetyNumber = (state) => state.safetyNumber;
    const getContactID = (_, props) => props.contactID;
    exports.getContactSafetyNumber = reselect_1.createSelector([getSafetyNumber, getContactID], ({ contacts }, contactID) => contacts[contactID]);
});