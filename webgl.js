loadFiles(['screen.vert','screen.frag','geometry.vert','geometry.frag'], function(shaders) {
	const gl = document.getElementById('canvas').getContext('webgl');
	const m4 = twgl.m4;
	const geometry = twgl.createBufferInfoFromArrays(gl, attributes);
	const programInfo = twgl.createProgramInfo(gl, [shaders['geometry.vert'], shaders['geometry.frag']])
	const programInfoScreen = twgl.createProgramInfo(gl,
		[shaders['screen.vert'], shaders['screen.frag']]);
	const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
		position:[-1,-1,0,1,-1,0,-1,1,0,-1,1,0,1,-1,0,1,1,0] });
	var timeElapsed = 0;
	const divergence = 0.8;
	var camera = [0,0,10];
	var fieldOfView = 30;
	var projection = m4.perspective(fieldOfView * Math.PI / 180, gl.canvas.width/gl.canvas.height, 0.01, 100.0);
	var cameraLeft, cameraRight;
	var motionFrames = 10;
	const uniforms = {
		resolution: [1, 1],
		time: 0,
		viewProjection: 0,
		color: [1,1,1,1],
		motionFrames: motionFrames,
	};
	var frames = [];
	var currentFrame = 0;
	for (var index = 0; index < motionFrames; ++index) {
		frames.push(twgl.createFramebufferInfo(gl));
		uniforms['frame'+index] = frames[index].attachments[0];
	}
	console.log(uniforms)
	function render(elapsed) {
		elapsed /= 1000;
		var deltaTime = elapsed - uniforms.time;
		uniforms.time = elapsed;
		
		cameraLeft = m4.lookAt([-divergence+camera[0], camera[1], camera[2]], [0, 0, 0], [0, 1, 0]);
		cameraRight = m4.lookAt([divergence+camera[0], camera[1], camera[2]], [0, 0, 0], [0, 1, 0]);

		gl.bindFramebuffer(gl.FRAMEBUFFER, frames[currentFrame].framebuffer);
		gl.clearColor(0,0,0,1);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
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

		currentFrame = (currentFrame+1)%motionFrames;
		// uniforms.frame = frames[currentFrame].attachments[0];
	// for (var index = 0; index < motionFrames; ++index) {
	// 	uniforms['frame'+index] = frames[index].attachments[0];
	// }

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0,0,0,1);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.useProgram(programInfoScreen.program);
		twgl.setBuffersAndAttributes(gl, programInfoScreen, bufferInfo);
		twgl.setUniforms(programInfoScreen, uniforms);
		twgl.drawBufferInfo(gl, bufferInfo);

		requestAnimationFrame(render);
	}
	function onWindowResize() {
		twgl.resizeCanvasToDisplaySize(gl.canvas);
		for (var index = 0; index < motionFrames; ++index) {
			twgl.resizeFramebufferInfo(gl, frames[index]);
		}
		projection = m4.perspective(fieldOfView * Math.PI / 180, gl.canvas.width/gl.canvas.height, 0.01, 100.0);
		uniforms.resolution = [gl.canvas.width, gl.canvas.height];
	}
	onWindowResize();
	window.addEventListener('resize', onWindowResize, false);
	requestAnimationFrame(render);
});