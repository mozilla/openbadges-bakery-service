var request = require('supertest');
var sinon = require('sinon');
var should = require('should');
var url = require('url');

var utils = require('./utils');

describe('Website', function() {
  var app = utils.buildApp();

  it('should return 200 OK with HTML at /', function(done) {
    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200, done);
  });
});