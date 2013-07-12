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
    it('should something', function(){
      var foo = 1;
      foo.should.equal(1);
    });
  });
});
