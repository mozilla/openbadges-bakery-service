#!/usr/bin/env node

const PORT = process.env['PORT'] || 8888;
const DEBUG = process.env['DEBUG'];

var options = {};
if (DEBUG)
  options.logLevel = 'debug';
var app = require('../').app.build(options);
app.listen(PORT, function() {
  console.log("Listening on port " + PORT + ".");
});