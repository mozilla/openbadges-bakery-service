var cheerio = require('cheerio');
var should = require('should');
var nunjucks = require('nunjucks');
var filters = require('../').filters;

var loader = new nunjucks.FileSystemLoader(__dirname + '/../views');
var env = new nunjucks.Environment(loader, { autoescape: true });

Object.keys(filters).forEach(function(name) {
  env.addFilter(name, filters[name]);
});

function render(view, ctx) {
  return cheerio.load(env.render(view, ctx));
}

describe('views/', function() {
  describe('index.html', function() {
    it('should display action name', function(){
      var $ = render('index.html', { 
        action: 'bake',
        badge: {}
      });
      $('h2').text().should.match(/Baked/);
    });

    it('should display badge by data URL', function() {
      var $ = render('index.html', {
        action: 'whatever',
        badge: {
          dataUrl: 'foo'
        }
      });
      $('img[alt="Baked badge"]').attr('src').should.equal('foo');
    });
  });
});
