﻿'use strict';

console.log('preload');

window.PROTO_ROOT = '/protos';

let locale;
if (!locale) {
    locale = loadLocale();
}
window.config.localeMessages = locale.messages;
var version = Windows.System.Profile.AnalyticsInfo.versionInfo.deviceFamilyVersion;
window.config.uwp_version = ((version & 0x00000000FFFF0000) >> 16) +  '.' + (version & 0x000000000000FFFF);

var Notifications = Windows.UI.Notifications;
window.setBadgeCount = function (count) {
    var type = typeof(count) === 'string' ? Notifications.BadgeTemplateType.badgeGlyph : Notifications.BadgeTemplateType.badgeNumber;
    var badgeXml = Notifications.BadgeUpdateManager.getTemplateContent(type);
    badgeXml.firstChild.setAttribute('value', count);
    var badge = Notifications.BadgeNotification(badgeXml);
    Notifications.BadgeUpdateManager.createBadgeUpdaterForApplication().update(badge);
};
window.drawAttention = function () {
    console.log('draw attention');
}
window.showWindow = function () {
    console.log('show window');
};
window.restart = function() {
    console.log('restart');
};

var Signal = {};