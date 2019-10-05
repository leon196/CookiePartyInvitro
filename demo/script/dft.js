function dft (array, iterations) {
	var result = [];
	var baked = ""
	var count = array.length;
	for (var i = 0; i < iterations; i++) {
		var x = 0;
		var y = 0;
		for (var n = 0; n < count; n++) {
			var angle = (2. * 3.1415 * i * n) / count;
			x += array[n] * Math.cos(angle);
			y -= array[n] * Math.sin(angle);
		}
		x /= count;
		y /= count;
		var frequency = i;
		var amplitude = Math.sqrt(x*x+y*y);
		var phase = Math.atan2(y,x);
		result.push([amplitude,phase]);
		if (Math.abs(amplitude) > 0.001) {
			if (i > 0) baked += "+";
			var angle = i + phase;
				baked += "cos(";
			if (angle === 0.0) {
				baked += "1."
			} else {
				baked += "a*" + i+"." + "+" + phase.toFixed(2);
			}
				baked += ")";
			baked += "*"+amplitude.toFixed(2);
		}
	}
	return baked;
}


// bake Derivated Fourier Transform
// var lines = meshes['cookie.obj'].split('\n');
// var x = [], y = [], z = [];
// for (var i = 4; i < lines.length; ++i) {
// 	if (lines[i][0] == 'v') {
// 		var columns = lines[i].split(' ');
// 		x.push(columns[1]);
// 		y.push(columns[2]);
// 		z.push(columns[3]);
// 	} else {
// 		break;
// 	}
// }
// var iterationsDFT = 32;
// var dftbake = 'vec3 dft (float a) {';
// dftbake += 'return vec3(';
// dftbake += dft(x, iterationsDFT)+','+dft(y, iterationsDFT)+','+dft(z,iterationsDFT)+');}';
// // console.log(dftbake);
