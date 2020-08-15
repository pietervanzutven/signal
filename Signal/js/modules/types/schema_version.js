(function () {
  window.types = window.types || {};
  window.types.schema_version = {};

  const { isNumber } = window.lodash;


  window.types.schema_version.isValid = value =>
    isNumber(value) && value >= 0;

})();