const fs = require('fs');

const baker = require('./baker');

exports.index = function index(req, res, next) {
  res.render('index.html');
};

exports.redirect =  function redirect(path) {
  return function(req, res) {
    res.redirect(301, path);
  }
};

exports.post = function post(req, res, next) {
  switch(req.body.action) {
    case 'bake':
      return exports.bake(req, res, next);
      break;
    case 'unbake':
      return exports.unbake(req, res, next);
      break;
    default:
      next('No action specified');
  }
}

exports.bake = function bake(req, res, next) {
  var assertionUrl = req.body['assertionUrl'];
  if (!assertionUrl)
    return next('Provide an assertion url');

  baker.bake(assertionUrl, function(err, result) {
    if (err) 
      return next(err);

    return res.render('index.html', { 
      action: 'bake',
      badge: {
        assertionUrl: result.assertionUrl,
        dataUrl: result.baked.dataUrl,
        metadata: result.assertion,
        validation: result.validation
      }
    });
  });
};

exports.unbake = function unbake(req, res, next) {
  var file = req.files['badgeFile'];
  if (!file || !file.size)
    return next('File upload unsuccessful');

  fs.readFile(file.path, function(error, contents) {
    if (error)
      next(error);

    baker.unbake(contents, function(err, workspace) {
      if (err) 
        return next(err);

      return res.render('index.html', { 
        action: 'unbake',
        badge: {
          assertionUrl: workspace.assertionUrl,
          dataUrl: workspace.baked.dataUrl,
          metadata: workspace.assertion,
          validation: workspace.validation
        }
      });
    });
  });
};
