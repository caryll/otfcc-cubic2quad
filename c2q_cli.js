var path = require('path');
var fs = require('fs');
var convert = require('./ctq.js');

var glyfsource = '';
process.stdin.resume();
process.stdin.on('data', function (buf) { glyfsource += buf.toString(); });
process.stdin.on('end', function () {
	var font = JSON.parse(glyfsource.trim());
	convert(font);
	process.stdout.write(JSON.stringify(font));
});
