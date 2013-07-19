const express = require('express');
const nunjucks = require('nunjucks');

const paths = require('./paths');
const website = require('./website');
const api = require('./api');
const logger = require('./logger');
const filters = require('./filters');
const errors = require('./errors');

exports.build = function(options) {
  options = options || {};

  const app = express();

  if (options.logLevel)
    logger.level(options.logLevel);

  app.use(logger.middleware());
  app.use(express.compress());
  app.use(express.bodyParser());
  app.use(express.static(paths.staticDir));

  var loader = new nunjucks.FileSystemLoader(paths.viewsDir);
  var env = new nunjucks.Environment(loader, {
    autoescape: true
  });
  env.express(app);
  Object.keys(filters).forEach(function(name) {
    env.addFilter(name, filters[name]);
  });
  app.nunjucksEnv = env;

  app.get('/', website.index);

  app.get('/bake', [api.requireParams(['assertion'])], api.bake);
  app.post('/bake', website.bake);

  app.post('/unbake', website.unbake);

  app.use(errors.errorHandler);

  return app;
};

