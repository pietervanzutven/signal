(function () {
  'use strict';

  window.app = window.app || {};

  const environment = 'production';

  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'config/default.json', false);
  xhr.send(null);

  window.app.config = JSON.parse(xhr.response);

  xhr.open('GET', 'config/' + environment + '.json', false);
  xhr.send(null);

  window.app.config = Object.assign(window.app.config, JSON.parse(xhr.response));
  window.app.config.environment = environment;

  window.app.config.get = name => window.app.config[name];
  window.app.config.has = name => window.app.config.hasOwnProperty(name);

})();