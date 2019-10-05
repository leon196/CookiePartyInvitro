// Leon Denise 
// Cookie Party Invitro 2019

window.onload = function () {

var button = document.getElementById('button');
button.innerHTML = 'loading';

var music = new Audio('animation/music.mp3');

// shaders file to load
loadFiles('shader/',['screen.vert','blur.frag','text.vert','screen.frag','geometry.vert','point.vert','tint.frag'], function(shaders) {

// animation data
loadFiles('animation/',['animation.json'], function(animationData) {

// texts
var textList = ['cookie.obj','festival.obj','date.obj','landy.obj','shader.obj','beamer.obj','play.obj','concert.obj','workshop.obj','dj.obj','lazer.obj','minitel.obj','credits.obj'];
loadFiles('animation/',textList, function(meshes) {

	const gl = document.getElementById('canvas').getContext('webgl');
	const v3 = twgl.v3;
	const m4 = twgl.m4;
	var uniforms = {};
	var frames = [];
	var currentFrame = 0;

	setupMotionBlur();

	var materials = {};
	var materialMap = {
		'geometry': 	['geometry.vert', 	'tint.frag'],
		'point': 			['point.vert', 			'tint.frag'],
		'text': 			['text.vert', 			'tint.frag'],
		'blur': 			['screen.vert', 		'blur.frag'],
		'motion': 		['screen.vert', 		'motion.frag'],
		'screen': 		['screen.vert', 		'screen.frag'] };

	loadMaterials();

	// geometry
	const geometryLine = twgl.createBufferInfoFromArrays(gl, attributesLine);
	const geometryPoint = twgl.createBufferInfoFromArrays(gl, attributesPoint);
	const geometryQuad = twgl.createBufferInfoFromArrays(gl, {
		position:[-1,-1,0,1,-1,0,-1,1,0,-1,1,0,1,-1,0,1,1,0] });
	var geometryTexts = {};
	var currentText = 0;
	Object.keys(meshes).forEach(function(item) {
		var lines = meshes[item].split('\n');
		var attributes = {position:[],indices:{numComponents:2,data:[]},seed:{numComponents:4,data:[]}};
		for (var i = 4; i < lines.length; ++i) {
			if (lines[i][0] == 'v') {
				var columns = lines[i].split(' ');
				attributes.position.push(columns[1], columns[2],columns[3]);
				attributes.seed.data.push(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1,i-4);
			} else if (lines[i][0] == 'l') {
				var columns = lines[i].split(' ');
				attributes.indices.data.push(columns[1]-1, columns[2]-1);
			} else {
				break;
			}
		}
		geometryTexts[item] = twgl.createBufferInfoFromArrays(gl, attributes);
	})

	// camera
	var camera = [0,0,6];
	var target = [0,0,0];
	var projection, cameraLeft, cameraRight;

	// framebuffers
	var frameMotion = twgl.createFramebufferInfo(gl);
	var frameScreen = twgl.createFramebufferInfo(gl);
	var frameBlurA = twgl.createFramebufferInfo(gl);
	var frameBlurB = twgl.createFramebufferInfo(gl);
	var frameToResize = [frameMotion,frameScreen,frameBlurA,frameBlurB].concat(frames);

	// blender animation
	var animations = new blenderHTML5Animations.ActionLibrary(JSON.parse(animationData[Object.keys(animationData)[0]]));
	var timeElapsed = 0;
	uniforms.time = 0;
	uniforms.timeRotation = 0;
	var blenderSocket = new BlenderWebSocket();
	blenderSocket.addListener('time', function(newTime) { timeElapsed = newTime; });

	function render(elapsed) {
		// elapsed /= 1000;
		elapsed = timeElapsed;
		// elapsed = music.currentTime;

		var deltaTime = elapsed - uniforms.time;
		uniforms.time = elapsed;
		uniforms.timeRotation += deltaTime * getAnimation('rotation-speed', elapsed);
		
		camera = animations['camera'].paths['location'].evaluate(elapsed);
		target = animations['target'].paths['location'].evaluate(elapsed);
		var z = v3.normalize(v3.subtract(camera,target));
		var x = v3.normalize(v3.cross([0,1,0],z));
		var y = v3.normalize(v3.cross(z,x));
		var d = divergence;
		cameraLeft  = m4.lookAt([camera[0]-d*x[0], camera[1]-d*x[1], camera[2]-d*x[2]], target, y);
		cameraRight = m4.lookAt([camera[0]+d*x[0], camera[1]+d*x[0], camera[2]+d*x[0]], target, y);
		var fieldOfView = 20+60*getAnimation('fov', elapsed);
		projection = m4.perspective(fieldOfView*Math.PI/180, gl.canvas.width/gl.canvas.height, 0.01, 100.0);
		uniforms.camera = camera;
		uniforms.target = target;
		uniforms.fade = getAnimation('fade', elapsed);
		uniforms.expansion = getAnimation('expansion', elapsed);
		uniforms.growth = getAnimation('growth', elapsed);
		currentText = getAnimation('text', elapsed);

		// render scene
		gl.bindFramebuffer(gl.FRAMEBUFFER, frames[currentFrame].framebuffer);
		gl.clearColor(0,0,0,1);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		uniforms.tint = [1,0,0,1];
		uniforms.viewProjection = m4.multiply(projection, m4.inverse(cameraLeft));
		draw(materials['geometry'], geometryLine, gl.LINES);
		draw(materials['point'], geometryPoint, gl.POINTS);
		draw(materials['text'], geometryTexts[textList[currentText]], gl.LINES);
		uniforms.tint = [0,1,1,1];
		uniforms.viewProjection = m4.multiply(projection, m4.inverse(cameraRight));
		draw(materials['geometry'], geometryLine, gl.LINES);
		draw(materials['point'], geometryPoint, gl.POINTS);
		draw(materials['text'], geometryTexts[textList[currentText]], gl.LINES);

		// motion blur
		currentFrame = (currentFrame+1)%motionFrames;
		drawFrame(materials['motion'], geometryQuad, frameMotion.framebuffer);

		// gaussian blur
		var iterations = 8;
		var writeBuffer = frameBlurA;
		var readBuffer = frameBlurB;
		for (var i = 0; i < iterations; i++) {
			var radius = (iterations - i - 1)
			if (i === 0) uniforms.frame = frameMotion.attachments[0];
			else uniforms.frame = readBuffer.attachments[0];
			uniforms.flip = true;
			uniforms.direction = i % 2 === 0 ? [radius, 0] : [0, radius];
			drawFrame(materials['blur'], geometryQuad, writeBuffer.framebuffer);
			var t = writeBuffer;
			writeBuffer = readBuffer;
			readBuffer = t;
		}

		// final composition
		uniforms.frame = frameMotion.attachments[0];
		uniforms.frameBlur = writeBuffer.attachments[0];
		drawFrame(materials['screen'], geometryQuad, null);

		requestAnimationFrame(render);
	}
	function drawFrame(shader, geometry, frame) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, frame);
		gl.clearColor(0,0,0,1);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		draw(shader, geometry, gl.TRIANGLES);
	}
	function draw(shader, geometry, mode) {
		gl.useProgram(shader.program);
		twgl.setBuffersAndAttributes(gl, shader, geometry);
		twgl.setUniforms(shader, uniforms);
		twgl.drawBufferInfo(gl, geometry, mode);
	}
	function onWindowResize() {
		twgl.resizeCanvasToDisplaySize(gl.canvas);
		for (var index = 0; index < frameToResize.length; ++index)
			twgl.resizeFramebufferInfo(gl, frameToResize[index]);
		uniforms.resolution = [gl.canvas.width, gl.canvas.height];
	}
	function loadMaterials() {
		Object.keys(materialMap).forEach(function(key) {
			materials[key] = twgl.createProgramInfo(gl,
				[shaders[materialMap[key][0]],shaders[materialMap[key][1]]]); });
	}
	function setupMotionBlur() {
		uniforms.motionFrames = motionFrames;
		for (var index = 0; index < motionFrames; ++index) {
			frames.push(twgl.createFramebufferInfo(gl));
			uniforms['frame'+index] = frames[index].attachments[0]; }
		shaders['motion.frag'] = 'precision mediump float;\nvarying vec2 texcoord;\nuniform float motionFrames;\nuniform sampler2D '
		for (var index = 0; index < motionFrames; ++index) 
			shaders['motion.frag'] += 'frame'+index+',';
		shaders['motion.frag'] = shaders['motion.frag'].replace(/.$/,";");
		shaders['motion.frag'] += '\nvoid main() {\ngl_FragColor = vec4(0);'
		for (var index = 0; index < motionFrames; ++index) 
			shaders['motion.frag'] += '\ngl_FragColor += texture2D(frame'+index+', texcoord)/motionFrames;'
		shaders['motion.frag'] += '\n}';
	}
	function getAnimation(name, elapsed) {
		return animations[name].paths['location'].evaluate(elapsed)[0];
	}
	function lerp(v0, v1, t) {
		return v0*(1-t)+v1*t;
	}

	// shader hot-reload
	socket = io('http://localhost:5776');
	socket.on('change', function(data) { 
		if (data.path.includes("demo/shader/")) {
			const url = data.path.substr("demo/shader/".length);
			loadFiles("shader/",[url], function(shade) {
				shaders[url] = shade[url];
				loadMaterials();
			});
		}
	});

	// animation hot-reload
	socket = io('http://localhost:5776');
	socket.on('change', function(data) { 
		if (data.path.includes("demo/animation/")) {
			const url = data.path.substr("demo/animation/".length);
			if (url.substr(url.lastIndexOf('.') + 1) == 'json') {
				setTimeout(function(){
					loadFiles("animation/",[url], function(anim) {
						animations = new blenderHTML5Animations.ActionLibrary(JSON.parse(anim[Object.keys(anim)[0]]));
					});
				}, 250);
			}
		}
	});

	onWindowResize();
	window.addEventListener('resize', onWindowResize, false);
	requestAnimationFrame(render);
	button.innerHTML = '';
/*
	button.innerHTML = 'play';
	button.style.cursor = 'pointer';
	button.style.textDecoration = 'underline';
	button.onclick = function() {
		music.play();
		requestAnimationFrame(render);
		button.style.display = 'none';
		document.getElementById('body').style.cursor = 'none';
	};
	music.onended = function() {
		button.innerHTML = '<a href="https://2019.cookie.paris/">2019.cookie.paris</a>';
		button.style.display = 'block';
		document.getElementById('body').style.cursor = 'default';
	}
*/
});
});
});
}