const async = require('async');
const request = require('request');
const dataurl = require('dataurl');
const bakery = require('openbadges-bakery');
const validator = require('openbadges-validator');
const logger = require('./logger');

exports.request = request;
exports.validator = validator;
exports.bakery = bakery;

function ifOption(opt, func) {
  if (opt)
    return func;
  return function skip(){
    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop();
    args.unshift(null);
    callback.apply(this, args);
  }
}

function fetch(workspace, callback){
  exports.request(workspace.assertionUrl, function(error, response, body) {
    if (error || response.statusCode !== 200) {
      //log('Fetch error: %s', error || response.statusCode);
      return callback({
        error: "unreachable",
        reason: "Could not reach endpoint: " + workspace.assertionUrl
      });
    }
    try {
      var json = JSON.parse(body);
      workspace.assertion = json;
      return callback(null, workspace);
    }
    catch (e) {
      return callback({
        error: "parse",
        reason: "Could not parse json: " + e.message
      });
    }
  });
}

function validate(workspace, callback) {
  exports.validator(workspace.assertion, function(error, info) {
    if (error) {
      logger.debug({ error: error, info: info }, 'Validation failed');
      return callback({
        error: "validation",
        reason: "Validation failed: " + error.message
      });
    }
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

exports.bake = function bake(assertionUrl, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  async.waterfall([
    function start(callback) {
      callback(null, { assertionUrl: assertionUrl });
    },
    fetch,
    validate,
    function bake(workspace, callback) {
      var img = workspace.validation.resources['badge.image'];
      try {
        exports.bakery.bake({
          image: img,
          data: workspace.assertionUrl
        }, function(error, imgData) {
          if (error)
            return callback({
              error: "processing",
              reason: "Could not write data to png: " + e.message
            });
          workspace.baked = {
            imgData: imgData
          }
          return callback(null, workspace);
        });
      }
      catch (e) {
        return callback({
          error: "processing",
          reason: "Could not write data to png: " + e.message
        });
      }
    },
    ifOption(true, makeDataUrl),
    normalize
  ], callback);
};

exports.unbake = function unbake(imgData, callback) {
  async.waterfall([
    function debake(callback) {
      exports.bakery.extract(imgData, function(error, data) {
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

exports.ifOption = ifOption;
exports.fetch = fetch;
