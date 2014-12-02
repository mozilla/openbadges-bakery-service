const fs = require('fs');
const path = require('path');
const request = require('request');
const should = require('should');
const bakery = require('openbadges-bakery');
const badgehost = require('badgehost');

var app = badgehost.app.build({
  staticDir: path.join(__dirname, './data/static'),
  assertionDir: path.join(__dirname, './data/assertions')
});
var port = 8080;

app.listen(port);

app.getUrl = function getUrl(path) {
  return 'http://127.0.0.1:' + port + path;
};

const baker = require('../lib/baker');

describe('Baker', function() {
  it('should bake', function(done) {
    var url = app.getUrl('/demo.json');
    baker.bake(url, function(err, result) {
      if (err)
        return done(err);
      bakery.extract(result.baked.imgData, function(err, data) {
        if (err)
          return done(err);
        data.should.equal(url);
        done();
      })
    });
  });

  it('should unbake', function(done) {
    var url = app.getUrl('/demo.json');
    fs.readFile(__dirname + '/data/static/unbaked.png', function (err, contents) {
      if (err)
        return done(err);
      bakery.bake({ image: contents, data: url }, function(err, imageData) {
        if (err)
          return done(err);
        baker.unbake(imageData, function(err, result) {
          if (err)
            return done(err);
          request({url: url, json:true}, function(err, res, body) {
            result.assertion.should.include(body);
            done()
          });
        });
      });
    });
  });

  describe('#ifOption', function(){

    var f = function(arg, cb){
      cb('called with ' + arg);
    };

    it('should call func if true', function(done) {
      var g = baker.ifOption(true, f);
      g('arg1', function(result){
        result.should.equal('called with arg1'); 
        done();
      });
    });

    it('should skip if false', function(done) {
      var g = baker.ifOption(false, f);
      g('arg1', 'arg2', function(){
        var args = Array.prototype.slice.call(arguments);
        // null gets added as error for async-style callback
        args.should.eql([null, 'arg1', 'arg2']); 
        done();
      });
    });
  });
});
