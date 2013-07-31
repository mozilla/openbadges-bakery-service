var request = require('supertest');
var sinon = require('sinon');
var should = require('should');
var service = require('../');

var utils = require('./utils');

describe('Website', function() {
  var app = utils.buildApp();

  it('should return 200 OK with HTML at /', function(done) {
    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200, done);
  });

  describe('/bake', function(done) {
  
    it.skip('should redirect on GET', function(done) {
      request(app)
        .get('/bake')
        .expect(301, done);
    });

    it('should bake badge from assertion url on POST', function(done) {
      var results = { baked: {} };
      sinon.stub(service.baker, "bake").callsArgWith(1, null, results);
      request(app)
        .post('/')
        .send({ assertionUrl: 'foo', action: 'bake' })
        .expect(200, function(err, res) {
          service.baker.bake.calledWith('foo').should.be.true; 
          service.baker.bake.restore();
          done();
        });
    });

    it('should render index.html with baking results', function(done) {
      var results = {
        assertionUrl: 'foo',
        assertion: 'someObj',
        validation: 'anotherObj',
        baked: {
          dataUrl: 'bar'
        }
      };
      sinon.stub(service.baker, "bake").callsArgWith(1, null, results);
      sinon.spy(app, "render");
      request(app)
        .post('/')
        .send({ assertionUrl: 'foo', action: 'bake' })
        .expect(200, function(err, res) {

          app.render.calledOnce.should.be.true;
          app.render.firstCall.args[0].should.equal('index.html');
          app.render.firstCall.args[1].should.have.property('action', 'bake');
          app.render.firstCall.args[1].should.have.property('badge');
          app.render.firstCall.args[1].badge.should.have.property('assertionUrl', 'foo');
          app.render.firstCall.args[1].badge.should.have.property('dataUrl', 'bar');
          app.render.firstCall.args[1].badge.should.have.property('metadata', 'someObj');
          app.render.firstCall.args[1].badge.should.have.property('validation', 'anotherObj');

          app.render.restore();
          service.baker.bake.restore();
          done();
        });
    });
  });

  describe('/unbake', function(done) {
  
    it.skip('should redirect on GET', function(done) {
      request(app)
        .get('/unbake')
        .expect(301, done);
    });

    it('should unbake badge from assertion url on POST', function(done) {
      var results = { baked: {} };
      sinon.stub(service.baker, "unbake").callsArgWith(1, null, results);
      request(app)
        .post('/')
        .type('multipart/form-data')
        .attach('badgeFile', __dirname + '/data/static/baked.png')
        .field('action', 'unbake')
        .expect(200, function(err, res) {
          service.baker.unbake.calledOnce.should.be.true; 
          Buffer.isBuffer(service.baker.unbake.firstCall.args[0]).should.be.true;
          service.baker.unbake.restore();
          done();
        });
    });

    it('should render index.html with unbaking results', function(done) {
      var results = {
        assertionUrl: 'foo',
        assertion: 'someObj',
        validation: 'anotherObj',
        baked: {
          dataUrl: 'bar'
        }
      };
      sinon.stub(service.baker, "unbake").callsArgWith(1, null, results);
      sinon.spy(app, "render");
      request(app)
        .post('/')
        .attach('badgeFile', __dirname + '/data/static/baked.png')
        .field('action', 'unbake')
        .expect(200, function(err, res) {

          app.render.calledOnce.should.be.true;
          app.render.firstCall.args[0].should.equal('index.html');
          app.render.firstCall.args[1].should.have.property('action', 'unbake');
          app.render.firstCall.args[1].should.have.property('badge');
          app.render.firstCall.args[1].badge.should.have.property('assertionUrl', 'foo');
          app.render.firstCall.args[1].badge.should.have.property('dataUrl', 'bar');
          app.render.firstCall.args[1].badge.should.have.property('metadata', 'someObj');
          app.render.firstCall.args[1].badge.should.have.property('validation', 'anotherObj');

          app.render.restore();
          service.baker.unbake.restore();
          done();
        });
    });
  });
});