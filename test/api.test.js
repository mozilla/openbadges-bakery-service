var request = require('supertest');
var should = require('should');
var sinon = require('sinon');
var service = require('../');

var utils = require('./utils');

describe('API v1', function() {
  var app = utils.buildApp();

  describe('GET /bake', function() {

    it('should require assertion parameter', function(done) {
      request(app)
        .get('/bake')
        .set('Accept', 'application/json')
        .expect(409)
        .expect({
          status: "failure",
          error: "missing-parameter",
          reason: 'Missing parameter: assertion'
        }, done);
    });

    it('should respond with baked PNG data', function(done) {
      var bake = sinon.stub(service.baker, "bake");
      bake.callsArgWith(1, null, { baked: { imgData: 'foo' } });
      
      request(app)
        .get('/bake?assertion=http://whatever.org/assertion')
        .set('Accept', 'application/json')
        .expect('Content-type', 'image/png')
        .expect(200)
        .expect('foo', function(err){
          bake.restore(); 
          done(err);
        });
    });

    describe('errors', function(){

      it('should 502 for fetch errors', function(done) {
        var stub = sinon.stub(service.baker, "request");
        stub.callsArgWith(1, 'some error');

        request(app)
          .get('/bake?assertion=http://whatever.org/assertion')
          .set('Accept', 'application/json')
          .expect(502)
          .expect({
            status: "failure",
            error: "unreachable",
            reason: 'Could not reach endpoint: http://whatever.org/assertion'
          }, function(err) {
            stub.restore();
            done(err);
          });
      });

      it('should 500 for parse errors', function(done) {
        var stub = sinon.stub(service.baker, "request");
        stub.callsArgWith(1, null, { statusCode: 200 }, "NOT JSON");

        request(app)
          .get('/bake?assertion=http://whatever.org/assertion')
          .set('Accept', 'application/json')
          .expect(500)
          .expect({
            status: "failure",
            error: "parse",
            reason: 'Could not parse json: Unexpected token N'
          }, function(err) {
            stub.restore();
            done(err);
          });
      });

      it('should 500 for validation errors', function(done) {
        var stub = sinon.stub(service.baker, "request");
        stub.callsArgWith(1, null, { statusCode: 200 }, '{ "not": "a badge" }');

        request(app)
          .get('/bake?assertion=http://whatever.org/assertion')
          .set('Accept', 'application/json')
          .expect(500)
          .expect({
            status: "failure",
            error: "validation",
            reason: 'Validation failed: missing `verify` structure'
          }, function(err) {
            stub.restore();
            done(err);
          });
      });

      it('should 500 for processing errors', function(done) {
        var requestStub = sinon.stub(service.baker, "request");
        requestStub.callsArgWith(1, null, { statusCode: 200 }, '{ "not": "a badge" }');
        var validatorStub = sinon.stub(service.baker, "validator");
        validatorStub.callsArgWith(1, null, { 
          resources: {
            'badge.image': 'foo'
          }
        });
        var stubs = [ requestStub, validatorStub ];

        request(app)
          .get('/bake?assertion=http://whatever.org/assertion')
          .set('Accept', 'application/json')
          .expect(500)
          .expect({
            status: "failure",
            error: "processing", 
            reason: 'Could not write data to png: PNG constructor takes either a buffer or a stream'
          }, function(err) {
            stubs.forEach(function(stub) {
              stub.restore();
            });
            done(err);
          });
      });

      it('should 500 for other baker errors', function(done) {
        var bake = sinon.stub(service.baker, "bake");
        bake.callsArgWith(1, { reason: 'Something blew up' });

        request(app)
          .get('/bake?assertion=http://whatever.org/assertion')
          .set('Accept', 'application/json')
          .expect(500)
          .expect({
            status: "failure",
            error: "unexpected",
            reason: 'Something blew up'
          }, function(err) {
            bake.restore();
            done(err);
          });
      });
    });
  });
});