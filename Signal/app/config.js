(function () {
  'use strict';

  const environment = 'production';

  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'config/default.json', false);
  xhr.send(null);

  window.config = JSON.parse(xhr.response);

  xhr.open('GET', 'config/' + environment + '.json', false);
  xhr.send(null);

  window.config = Object.assign(window.config, JSON.parse(xhr.response));
  window.config.environment = environment;

  window.config.get = name => config[name];
  window.config.has = name => config.hasOwnProperty(name);

})();