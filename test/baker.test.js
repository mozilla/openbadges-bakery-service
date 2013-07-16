const fs = require('fs');
const request = require('request');
const should = require('should');
const asserter = require('asserter');
const bakery = require('openbadges-bakery');

const baker = require('../lib/baker');

var app = new asserter.app.build({
  dataDir: __dirname + '/data/assertions',
  staticDir: __dirname + '/data'
});

var server = app.listen(0);
server.getUrl = function getUrl(path) {
  path = path || '';
  return 'http://127.0.0.1:' + this.address().port + path;
}

describe('Baker', function() {
  it('should bake', function(done) {
    var url = server.getUrl('/demo/1.0/assertion.json');
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
    var url = server.getUrl('/demo/1.0/assertion.json');
    fs.readFile(__dirname + '/data/unbaked.png', function (err, contents) {
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
});