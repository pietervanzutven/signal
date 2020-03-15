'use strict';

console.log('preload');

window.PROTO_ROOT = '/protos';

// Load locale - if we can't load messages for the current locale, we
// default to 'en'
//
// possible locales:
// https://github.com/electron/electron/blob/master/docs/api/locales.md
let localeName = locale.normalizeLocaleName(Windows.Globalization.ApplicationLanguages.languages[0]);
let messages;

try {
    messages = locale.getLocaleMessages(localeName);
} catch (e) {
    console.log('Problem loading messages for locale ', localeName, e.stack);
    console.log('Falling back to en locale');

    localeName = 'en';
    messages = locale.getLocaleMessages(localeName);
}
window.config.localeMessages = messages;

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