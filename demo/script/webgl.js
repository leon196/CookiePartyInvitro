// Leon Denise 
// Cookie Party Invitro 2019

window.onload = function () {


// shaders file to load
loadFiles('shader/',['screen.vert','blur.frag','text.vert','screen.frag','geometry.vert','point.vert','tint.frag'],
	function(shaders) {

// animation data
loadFiles('animation/',['animation.json'], function(animationData) {

// texts
loadFiles('animation/',['cookie.obj'], function(meshes) {
	var lines = meshes['cookie.obj'].split('\n');
	var attributesText = {position:[],indices:{numComponents:2,data:[]},seed:{numComponents:4,data:[]}};
	for (var i = 4; i < lines.length; ++i) {
		if (lines[i][0] == 'v') {
			var columns = lines[i].split(' ');
			attributesText.position.push(columns[1], columns[2],columns[3]);
			attributesText.seed.data.push(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1,i-4);
		} else if (lines[i][0] == 'l') {
			var columns = lines[i].split(' ');
			attributesText.indices.data.push(columns[1]-1, columns[2]-1);
		} else {
			break;
		}
	}

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
	const geometryLine = twgl.createBufferInfoFromArrays(gl, attributes);
	const geometryPoint = twgl.createBufferInfoFromArrays(gl, attributesPoint);
	const geometryDFT = twgl.createBufferInfoFromArrays(gl, attributesLine);
	const geometryText = twgl.createBufferInfoFromArrays(gl, attributesText);
	const geometryQuad = twgl.createBufferInfoFromArrays(gl, {
		position:[-1,-1,0,1,-1,0,-1,1,0,-1,1,0,1,-1,0,1,1,0] });

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
	var blenderSocket = new BlenderWebSocket();
	var timeElapsed = 0;
	uniforms.time = 0;
	uniforms.timeRotation = 0;
	blenderSocket.addListener('time', function(newTime) { timeElapsed = newTime; });

	function render(elapsed) {
		elapsed /= 1000;
		elapsed = timeElapsed;

		var deltaTime = elapsed - uniforms.time;
		uniforms.time = elapsed;
		uniforms.timeRotation += deltaTime * getAnimation('rotation-speed', elapsed);
		
		camera = animations['camera'].paths['location'].evaluate(elapsed);
		target = animations['target'].paths['location'].evaluate(elapsed);
		var z = v3.normalize(v3.subtract(camera,target));
		var x = v3.normalize(v3.cross(z,[0,1,0]));
		var d = divergence;
		cameraLeft  = m4.lookAt([camera[0]-d*x[0], camera[1]-d*x[1], camera[2]-d*x[2]], target, [0, 1, 0]);
		cameraRight = m4.lookAt([camera[0]+d*x[0], camera[1]+d*x[0], camera[2]+d*x[0]], target, [0, 1, 0]);
		var fieldOfView = 20+60*getAnimation('fov', elapsed);
		projection = m4.perspective(fieldOfView*Math.PI/180, gl.canvas.width/gl.canvas.height, 0.01, 100.0);
		uniforms.camera = camera;
		uniforms.target = target;
		uniforms.fade = getAnimation('fade', elapsed);
		uniforms.expansion = getAnimation('expansion', elapsed);
		uniforms.growth = getAnimation('growth', elapsed);

		// anaglyph geometry
		gl.bindFramebuffer(gl.FRAMEBUFFER, frames[currentFrame].framebuffer);
		gl.clearColor(0,0,0,1);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		// gizmos
		gl.useProgram(materials['geometry'].program);
		twgl.setBuffersAndAttributes(gl, materials['geometry'], geometryLine);
		uniforms.tint = [1,0,0,1];
		uniforms.viewProjection = m4.multiply(projection, m4.inverse(cameraLeft));
		twgl.setUniforms(materials['geometry'], uniforms);
		twgl.drawBufferInfo(gl, geometryLine, gl.LINES);
		uniforms.tint = [0,1,1,1];
		uniforms.viewProjection = m4.multiply(projection, m4.inverse(cameraRight));
		twgl.setUniforms(materials['geometry'], uniforms);
		twgl.drawBufferInfo(gl, geometryLine, gl.LINES);

		// points
		gl.useProgram(materials['point'].program);
		twgl.setBuffersAndAttributes(gl, materials['point'], geometryPoint);
		uniforms.tint = [1,0,0,1];
		uniforms.viewProjection = m4.multiply(projection, m4.inverse(cameraLeft));
		twgl.setUniforms(materials['point'], uniforms);
		twgl.drawBufferInfo(gl, geometryPoint, gl.POINTS);
		uniforms.tint = [0,1,1,1];
		uniforms.viewProjection = m4.multiply(projection, m4.inverse(cameraRight));
		twgl.setUniforms(materials['point'], uniforms);
		twgl.drawBufferInfo(gl, geometryPoint, gl.POINTS);

		if (animations['title'].paths['location'].evaluate(elapsed)[0] > 0.5) {
			gl.useProgram(materials['text'].program);
			twgl.setBuffersAndAttributes(gl, materials['text'], geometryText);
			uniforms.tint = [1,0,0,1];
			uniforms.viewProjection = m4.multiply(projection, m4.inverse(cameraLeft));
			twgl.setUniforms(materials['text'], uniforms);
			twgl.drawBufferInfo(gl, geometryText, gl.LINES);
			uniforms.tint = [0,1,1,1];
			uniforms.viewProjection = m4.multiply(projection, m4.inverse(cameraRight));
			twgl.setUniforms(materials['text'], uniforms);
			twgl.drawBufferInfo(gl, geometryText, gl.LINES);
		}

		// motion blur
		currentFrame = (currentFrame+1)%motionFrames;
		draw(materials['motion'], geometryQuad, frameMotion.framebuffer);

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
			draw(materials['blur'], geometryQuad, writeBuffer.framebuffer);
			var t = writeBuffer;
			writeBuffer = readBuffer;
			readBuffer = t;
		}

		// final composition
		uniforms.frame = frameMotion.attachments[0];
		uniforms.frameBlur = writeBuffer.attachments[0];
		draw(materials['screen'], geometryQuad, null);

		requestAnimationFrame(render);
	}
	function draw(shader, geometry, frame) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, frame);
		gl.clearColor(0,0,0,1);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.useProgram(shader.program);
		twgl.setBuffersAndAttributes(gl, shader, geometry);
		twgl.setUniforms(shader, uniforms);
		twgl.drawBufferInfo(gl, geometry);
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
});
});
});
}