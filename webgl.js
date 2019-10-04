loadFiles(['screen.vert','motion.frag','blur.frag','screen.frag','geometry.vert','geometry.frag'], function(shaders) {
	const gl = document.getElementById('canvas').getContext('webgl');
	const m4 = twgl.m4;
	const geometry = twgl.createBufferInfoFromArrays(gl, attributes);
	const shaderGeometry = twgl.createProgramInfo(gl,
		[shaders['geometry.vert'], shaders['geometry.frag']])
	const shaderBlur = twgl.createProgramInfo(gl,
		[shaders['screen.vert'], shaders['blur.frag']]);
	const shaderMotionBlur = twgl.createProgramInfo(gl,
		[shaders['screen.vert'], shaders['motion.frag']]);
	const shaderScreen = twgl.createProgramInfo(gl,
		[shaders['screen.vert'], shaders['screen.frag']]);
	const geometryQuad = twgl.createBufferInfoFromArrays(gl, {
		position:[-1,-1,0,1,-1,0,-1,1,0,-1,1,0,1,-1,0,1,1,0] });
	var timeElapsed = 0;
	const divergence = 0.8;
	var camera = [0,0,10];
	var fieldOfView = 30;
	var projection = m4.perspective(fieldOfView * Math.PI / 180, gl.canvas.width/gl.canvas.height, 0.01, 100.0);
	var cameraLeft, cameraRight;
	var motionFrames = 3;
	const uniforms = {
		motionFrames: motionFrames,
	};
	var frameMotionBlur = twgl.createFramebufferInfo(gl);
	var frameScreen = twgl.createFramebufferInfo(gl);
	var frameBlurA = twgl.createFramebufferInfo(gl);
	var frameBlurB = twgl.createFramebufferInfo(gl);
	var frames = [];
	var currentFrame = 0;
	for (var index = 0; index < motionFrames; ++index) {
		frames.push(twgl.createFramebufferInfo(gl));
		uniforms['frame'+index] = frames[index].attachments[0];
	}
	
	var frameBlurA, frameBlurB;

	function render(elapsed) {
		elapsed /= 1000;
		var deltaTime = elapsed - uniforms.time;
		uniforms.time = elapsed;
		
		cameraLeft = m4.lookAt([-divergence+camera[0], camera[1], camera[2]], [0, 0, 0], [0, 1, 0]);
		cameraRight = m4.lookAt([divergence+camera[0], camera[1], camera[2]], [0, 0, 0], [0, 1, 0]);

		// draw anaglyph geometry
		gl.bindFramebuffer(gl.FRAMEBUFFER, frames[currentFrame].framebuffer);
		gl.clearColor(0,0,0,1);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.useProgram(shaderGeometry.program);
		twgl.setBuffersAndAttributes(gl, shaderGeometry, geometry);
		uniforms.color = [1,0,0,1];
		uniforms.viewProjection = m4.multiply(projection, m4.inverse(cameraLeft));
		twgl.setUniforms(shaderGeometry, uniforms);
		twgl.drawBufferInfo(gl, geometry, gl.LINES);
		uniforms.color = [0,1,1,1];
		uniforms.viewProjection = m4.multiply(projection, m4.inverse(cameraRight));
		twgl.setUniforms(shaderGeometry, uniforms);
		twgl.drawBufferInfo(gl, geometry, gl.LINES);

		// motion blur
		currentFrame = (currentFrame+1)%motionFrames;
		draw(shaderMotionBlur, geometryQuad, frameMotionBlur.framebuffer);

		// gaussian blur
		var iterations = 8
		var writeBuffer = frameBlurA
		var readBuffer = frameBlurB;
		for (var i = 0; i < iterations; i++) {
			var radius = (iterations - i - 1)
			if (i === 0) uniforms.frame = frameMotionBlur.attachments[0];
			else uniforms.frame = readBuffer.attachments[0]
			uniforms.flip = true
			uniforms.direction = i % 2 === 0 ? [radius, 0] : [0, radius]
			draw(shaderBlur, geometryQuad, writeBuffer.framebuffer);
      var t = writeBuffer;
      writeBuffer = readBuffer;
      readBuffer = t;
    }

    // draw
		uniforms.frame = frameMotionBlur.attachments[0]
		uniforms.frameBlur = writeBuffer.attachments[0]
    uniforms.direction = [0, 0]
    uniforms.flip = iterations % 2 !== 0
		draw(shaderScreen, geometryQuad, null);

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
  	for (var index = 0; index < motionFrames; ++index) {
  		twgl.resizeFramebufferInfo(gl, frames[index]);
  	}
  	twgl.resizeFramebufferInfo(gl, frameMotionBlur);
		twgl.resizeFramebufferInfo(gl, frameBlurA);
		twgl.resizeFramebufferInfo(gl, frameScreen);
		twgl.resizeFramebufferInfo(gl, frameBlurB);
  	projection = m4.perspective(fieldOfView * Math.PI / 180, gl.canvas.width/gl.canvas.height, 0.01, 100.0);
  	uniforms.resolution = [gl.canvas.width, gl.canvas.height];
  }
  onWindowResize();
  window.addEventListener('resize', onWindowResize, false);
  requestAnimationFrame(render);
});