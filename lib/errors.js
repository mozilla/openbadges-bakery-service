const STATUS_CODES = {
  "missing-parameter": 409,
  "parse": 500,
  "validation": 500,
  "processing": 500,
  "unexpected": 500,
  "unreachable": 502
};

exports.errorHandler = function errorHandler(err, req, res, next) {
    if ("string" === typeof err)
      err = { reason: err };

    var body = {
      status: "failure",
      error: err.error || "unexpected",
      reason: err.reason || "Unexpected error"
    };
    var statusCode = STATUS_CODES[body.error] || 500;

    return res.format({
      text: function() {
        return res.send(statusCode, body.reason);
      },
      html: function() {
        return res.send(statusCode, body.reason);
      },
      json: function() {
        return res.send(statusCode, body);
      }
    });
  }
