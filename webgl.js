loadFiles(['screen.vert','screen.frag','geometry.vert','geometry.frag'], function(shaders) {
	const gl = document.getElementById('canvas').getContext('webgl');
	const m4 = twgl.m4;
	const geometry = twgl.createBufferInfoFromArrays(gl, attributes);
	const programInfo = twgl.createProgramInfo(gl, [shaders['geometry.vert'], shaders['geometry.frag']])
	const programInfoScreen = twgl.createProgramInfo(gl,
		[shaders['screen.vert'], shaders['screen.frag']]);
	const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
		position:[-1,-1,0,1,-1,0,-1,1,0,-1,1,0,1,-1,0,1,1,0] });
	var frames = [twgl.createFramebufferInfo(gl), twgl.createFramebufferInfo(gl)];
	var currentFrame = 0;
	var timeElapsed = 0;
	const divergence = 0.2;
	var projection = m4.perspective(50 * Math.PI / 180, gl.canvas.width/gl.canvas.height, 0.01, 100.0);
	var cameraLeft, cameraRight;
	const uniforms = {
		resolution: [1, 1],
		time: 0,
		frame: 0,
		viewProjection: 0,
		color: [1,1,1,1],
	};
	function render(elapsed) {
		elapsed /= 1000;
		var deltaTime = elapsed - uniforms.time;
		uniforms.time = elapsed;
		
		cameraLeft = m4.lookAt([-divergence, 0, 10], [0, 0, 0], [0, 1, 0]);
		cameraRight = m4.lookAt([divergence, 0, 10], [0, 0, 0], [0, 1, 0]);

		// gl.bindFramebuffer(gl.FRAMEBUFFER, frames[currentFrame].framebuffer);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		// currentFrame = (currentFrame+1)%2;
		// uniforms.frame = frames[currentFrame].attachments[0];

		gl.useProgram(programInfo.program);
		twgl.setBuffersAndAttributes(gl, programInfo, geometry);
		uniforms.color = [1,0,0,1];
		uniforms.viewProjection = m4.multiply(projection, m4.inverse(cameraLeft));
		twgl.setUniforms(programInfo, uniforms);
		twgl.drawBufferInfo(gl, geometry, gl.LINES);
		uniforms.color = [0,1,1,1];
		uniforms.viewProjection = m4.multiply(projection, m4.inverse(cameraRight));
		twgl.setUniforms(programInfo, uniforms);
		twgl.drawBufferInfo(gl, geometry, gl.LINES);

		// gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		// gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		// gl.useProgram(programInfoScreen.program);
		// twgl.setBuffersAndAttributes(gl, programInfoScreen, bufferInfo);
		// twgl.setUniforms(programInfoScreen, uniforms);
		// twgl.drawBufferInfo(gl, bufferInfo);

		requestAnimationFrame(render);
	}
	function onWindowResize() {
		twgl.resizeCanvasToDisplaySize(gl.canvas);
		twgl.resizeFramebufferInfo(gl, frames[0]);
		twgl.resizeFramebufferInfo(gl, frames[1]);
		projection = m4.perspective(50 * Math.PI / 180, gl.canvas.width/gl.canvas.height, 0.01, 100.0);
		uniforms.resolution = [gl.canvas.width, gl.canvas.height];
	}
	onWindowResize();
	window.addEventListener('resize', onWindowResize, false);
	requestAnimationFrame(render);
});