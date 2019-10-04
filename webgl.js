loadFiles(['screen.vert','motion.frag','blur.frag','screen.frag','geometry.vert','geometry.frag'], function(shaders) {
	const gl = document.getElementById('canvas').getContext('webgl2');
	if (!gl) { alert("Demo requires WebGL 2.0"); return; }
	var materials = {
		'geometry': 	['geometry.vert', 	'geometry.frag'],
		'blur': 			['screen.vert', 		'blur.frag'],
		'motion': 		['screen.vert', 		'motion.frag'],
		'screen': 		['screen.vert', 		'screen.frag'],
	};
	Object.keys(materials).forEach(function(key) {
		materials[key] = twgl.createProgramInfo(gl,
			[shaders[materials[key][0]],shaders[materials[key][1]]]); });
	const geometry = twgl.createBufferInfoFromArrays(gl, attributes);
	const geometryQuad = twgl.createBufferInfoFromArrays(gl, {
		position:[-1,-1,0,1,-1,0,-1,1,0,-1,1,0,1,-1,0,1,1,0] });
	const divergence = 0.2;
	var camera = [0,0,6];
	var target = [0,0,0];
	var fieldOfView = 50;
	var projection, cameraLeft, cameraRight;
	var motionFrames = 1;
	var uniforms = { motionFrames: motionFrames };
	var frameMotion = twgl.createFramebufferInfo(gl);
	var frameScreen = twgl.createFramebufferInfo(gl);
	var frameBlurA = twgl.createFramebufferInfo(gl);
	var frameBlurB = twgl.createFramebufferInfo(gl);
	var frames = [];
	var currentFrame = 0;
	for (var index = 0; index < motionFrames; ++index) {
		frames.push(twgl.createFramebufferInfo(gl));
		uniforms['frame'+index] = frames[index].attachments[0];
	}
	var frameToResize = [frameMotion,frameScreen,frameBlurA,frameBlurB].concat(frames);
	// var frameArray = twgl.createTexture(gl, {
	// 	target: gl.TEXTURE_2D_ARRAY,
	// 	src: frames,
	// });

	
	function render(elapsed) {
		elapsed /= 1000;
		var deltaTime = elapsed - uniforms.time;
		uniforms.time = elapsed;
		
		cameraLeft = twgl.m4.lookAt([-divergence+camera[0], camera[1], camera[2]], target, [0, 1, 0]);
		cameraRight = twgl.m4.lookAt([divergence+camera[0], camera[1], camera[2]], target, [0, 1, 0]);

		// anaglyph geometry
		gl.bindFramebuffer(gl.FRAMEBUFFER, frames[currentFrame].framebuffer);
		gl.clearColor(0,0,0,1);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.useProgram(materials['geometry'].program);
		twgl.setBuffersAndAttributes(gl, materials['geometry'], geometry);
		uniforms.tint = [1,0,0,1];
		uniforms.viewProjection = twgl.m4.multiply(projection, twgl.m4.inverse(cameraLeft));
		twgl.setUniforms(materials['geometry'], uniforms);
		twgl.drawBufferInfo(gl, geometry, gl.LINES);
		uniforms.tint = [0,1,1,1];
		uniforms.viewProjection = twgl.m4.multiply(projection, twgl.m4.inverse(cameraRight));
		twgl.setUniforms(materials['geometry'], uniforms);
		twgl.drawBufferInfo(gl, geometry, gl.LINES);

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
  	projection = twgl.m4.perspective(fieldOfView*Math.PI/180, gl.canvas.width/gl.canvas.height, 0.01, 100.0);
  	uniforms.resolution = [gl.canvas.width, gl.canvas.height];
  }
  onWindowResize();
  window.addEventListener('resize', onWindowResize, false);
  requestAnimationFrame(render);
});