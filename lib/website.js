const fs = require('fs');
const async = require('async');
const request = require('request');
const dataurl = require('dataurl');
const validator = require('openbadges-validator');
const bakery = require('openbadges-bakery');

exports.index = function index(req, res, next) {
  res.render('index.html');
};

exports.redirect =  function redirect(path) {
  return function(req, res) {
    res.redirect(301, path);
  }
};

exports.bake = function bake(req, res, next) {
  var assertionUrl = req.body['assertionUrl'];
  if (!assertionUrl)
    return next('Provide an assertion url');

  async.waterfall([
    function fetch(callback){
      request(assertionUrl, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          try {
            var json = JSON.parse(body);
            var workspace = { 
              assertionUrl: assertionUrl,
              assertion: json 
            };
            return callback(null, workspace);
          }
          catch (e) {
            error = 'Unable to parse response: ' + e.message;
          }
        }
        return callback(error || response.statusCode);
      });
    },
    function validate(workspace, callback) {
      validator(workspace.assertion, function(error, info) {
        if (error)
          return callback(error);
        workspace.validation = info;
        return callback(null, workspace);
      });
    },
    function bake(workspace, callback) {
      var img = workspace.validation.resources['badge.image'];
      bakery.bake({
        image: img,
        data: workspace.assertionUrl
      }, function(error, imgData) {
        if (error)
          callback(error);
        workspace.baked = {
          imgData: imgData
        }
        callback(null, workspace);
      });
    },
    function makeDataurl(workspace, callback) {
      var badgeDataUrl = dataurl.convert({
        data: workspace.baked.imgData,
        mimetype: 'image/png'
      });
      workspace.baked.dataUrl = badgeDataUrl;
      return callback(null, workspace);
    }
  ], function(err, workspace) {
    if (err) 
      return next(err);

    delete workspace.validation.resources;
    return res.render('index.html', { 
      badge: {
        assertionUrl: workspace.assertionUrl,
        dataUrl: workspace.baked.dataUrl,
        metadata: workspace.assertion,
        validation: workspace.validation
      }
    });
  });

};

exports.unbake = function unbake(req, res, next) {
  var file = req.files['badgeFileName'];
  if (!file || !file.size)
    return next('File upload unsuccessful');

  async.waterfall([
    function read(callback) {
      fs.readFile(file.path, callback);
    },
    function debake(badge, callback) {
      bakery.extract(badge, function(error, data) {
        if (error)
          return callback(error);
        var workspace = { 
          assertionUrl: data,
          baked: {
            imgData: badge
          }
        };
        return callback(null, workspace);
      });
    },
    function fetch(workspace, callback){
      request(workspace.assertionUrl, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          try {
            var json = JSON.parse(body);
            workspace.assertion = json;
            return callback(null, workspace);
          }
          catch (e) {
            error = 'Unable to parse response: ' + e.message;
          }
        }
        return callback(error || response.statusCode);
      });
    },
    function validate(workspace, callback) {
      validator(workspace.assertion, function(error, info) {
        if (error)
          return callback(error);
        workspace.validation = info;
        return callback(null, workspace);
      });
    },
    function makeDataurl(workspace, callback) {
      var badgeDataUrl = dataurl.convert({
        data: workspace.baked.imgData,
        mimetype: 'image/png'
      });
      workspace.baked.dataUrl = badgeDataUrl;
      return callback(null, workspace);
    }
  ], function(err, workspace) {
    if (err) 
      return next(err);

    delete workspace.validation.resources;
    return res.render('index.html', { 
      badge: {
        assertionUrl: workspace.assertionUrl,
        dataUrl: workspace.baked.dataUrl,
        metadata: workspace.assertion,
        validation: workspace.validation
      }
    });
  });

};
