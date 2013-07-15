var service = require('../');

exports.buildApp = function buildApp(options) {
  options = options || { logLevel: 'fatal' };
  return service.app.build(options);
};
