const request = require('supertest');
const should = require('should');
const validator = require('openbadges-validator');

const TestAssertions = require('./lib/test-assertions');

var app = new TestAssertions();

describe('TestAssertions', function() {
  it('should host JSON assertions', function(done) {
    request(app)
      .get('/demo/1.0/assertion.json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('should host a badge image', function(done) {
    request(app)
      .get('/baked.png')
      .expect('Content-Type', 'image/png')
      .expect(200, done);
  });

  describe('1.0 assertions', function() {

    it('should be valid', function(done) {
      request(app)
        .get('/demo/1.0/assertion.json')
        .expect(200, function(err, res) {
          validator(res.body, function(err, info){
            if (err)
              return done(err);
            info.version.should.equal('1.0.0');
            done();
          });
        });
    });

    ['assertion', 'badge', 'issuer'].forEach(function(part) {
      describe(part + '.json', function() {

        it('should set <APP WILL SET THIS> fields', function(done) {
          request(app)
            .get('/demo/1.0/' + part + '.json')
            .expect(200)
            .end(function(err, res) {
              if (err)
                return done(err);
              try {
                JSON.stringify(res.body).should.not.match(/APP WILL SET THIS/);
                done();
              } catch (e) {
                done(e);
              }
            });
        });

      });
    });

  });
});
