const baker = require('./baker');
      
exports.requireParams = function requireParams(params) {
  return function(req, res, next) {
    for (var i = 0; i < params.length; i++) {
      var param = params[i];
      if (!req.query[param]) 
        return next({
          error: "missing-parameter",
          reason: "Missing parameter: " + param
        });
    }
    return next();
  };
};

exports.bake = function bake(req, res, next) {
  var assertion = req.query['assertion'];
  baker.bake(assertion, function(err, result) {
    if (err)
      return next(err);
    res.type('image/png');
    res.attachment();
    return res.send(result.baked.imgData);
  });
};
