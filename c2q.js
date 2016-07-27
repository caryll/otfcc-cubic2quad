var path = require('path');
var fs = require('fs');
var cubicToQuad = require('cubic2quad')

function removeMids(contour) {
	var last = contour.length - 1;
	for (var j = 0; j < contour.length - 1; j++) {
		if (Math.abs(contour[j].x - contour[j + 1].x) < 0.5 && Math.abs(contour[j].y - contour[j + 1].y) < 0.5) {
			contour[j + 1].rem = true;
			contour[j].on = true;
		}
	}
	if (Math.abs(contour[0].x - contour[last].x) < 0.5 && Math.abs(contour[0].y - contour[last].y) < 0.5) {
		contour[last].rem = true;
		contour[0].on = true;
	}
	contour = contour.filter(function (x) { return !x.rem });

	last = contour.length - 1;
	for (var j = 1; j < contour.length - 1; j++) {
		if (!contour[j - 1].on && contour[j].on && !contour[j + 1].on) {
			var mx = contour[j - 1].x + contour[j + 1].x;
			var my = contour[j - 1].y + contour[j + 1].y;
			if (Math.abs(contour[j].x * 2 - mx) < 1 && Math.abs(contour[j].y * 2 - my) < 1) {
				contour[j].rem = true;
			}
		}
	}
	if (!contour[last].rem && !contour[last].on && contour[0].on && !contour[1].on) {
		mx = contour[last].x + contour[1].x;
		my = contour[last].y + contour[1].y;
		if (Math.abs(contour[0].x * 2 - mx) < 1 && Math.abs(contour[0].y * 2 - my) < 1) {
			contour[0].rem = true;
		}
	}
	return contour.filter(function (x) { return !x.rem });
}

function toquad(contour) {
	var newcontour = [];
	for (var j = 0; j < contour.length; j++) {
		if (contour[j].on) {
			newcontour.push(contour[j]);
		} else {
			var z1 = newcontour[newcontour.length - 1];
			var z2 = contour[j];
			var z3 = contour[j + 1];
			var z4 = contour[j + 2];
			var quadzs = cubicToQuad(z1.x, z1.y, z2.x, z2.y, z3.x, z3.y, z4.x, z4.y, 0.5);
			//process.stderr.write(quadzs + '\n');
			var on = false;
			for (var k = 2; k < quadzs.length; k += 2) {
				newcontour.push({ x: quadzs[k], y: quadzs[k + 1], on: on });
				on = !on;
			}
			j += 2;
		}
	}
	return removeMids(newcontour);
}

var glyfsource = '';
process.stdin.resume();
process.stdin.on('data', function (buf) { glyfsource += buf.toString(); });
process.stdin.on('end', function () {
	var font = JSON.parse(glyfsource.trim());
	font.CFF_ = null;
	for (var k in font.glyf) {
		var g = font.glyf[k];
		if (g.contours) {
			g.contours = g.contours.map(toquad);
		}
		g.stemH = null;
		g.stemV = null;
		g.hintMasks = null;
		g.contourMasks = null;
	}
	font.maxp.version = 1.0;
	process.stdout.write(JSON.stringify(font));
});