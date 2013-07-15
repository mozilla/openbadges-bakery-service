const async = require('async');
const request = require('request');
const dataurl = require('dataurl');
const bakery = require('openbadges-bakery');
const validator = require('openbadges-validator');

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
}

function validate(workspace, callback) {
  validator(workspace.assertion, function(error, info) {
    if (error)
      return callback(error);
    workspace.validation = info;
    return callback(null, workspace);
  });
}

function makeDataUrl(workspace, callback) {
  var badgeDataUrl = dataurl.convert({
    data: workspace.baked.imgData,
    mimetype: 'image/png'
  });
  workspace.baked.dataUrl = badgeDataUrl;
  return callback(null, workspace);
}

function normalize(workspace, callback) {
  delete workspace.validation.resources;
  callback(null, workspace);
}

exports.bake = function bake(assertionUrl, callback) {
  async.waterfall([
    function start(callback) {
      callback(null, { assertionUrl: assertionUrl });
    },
    fetch,
    validate,
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
    makeDataUrl,
    normalize
  ], callback);
};

exports.unbake = function unbake(imgData, callback) {
  async.waterfall([
    function debake(callback) {
      bakery.extract(imgData, function(error, data) {
        if (error)
          return callback(error);
        var workspace = { 
          assertionUrl: data,
          baked: {
            imgData: imgData
          }
        };
        return callback(null, workspace);
      });
    },
    fetch,
    validate,
    makeDataUrl,
    normalize
  ], callback);
};
