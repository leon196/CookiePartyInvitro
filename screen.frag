
precision mediump float;
uniform sampler2D frame;
uniform vec2 resolution;
uniform float time, timeElapsed, timer;
varying vec2 uv;

void main() {
	gl_FragColor = texture2D(frame, uv*vec2(resolution.y/resolution.x,1)*0.5+0.5);
	gl_FragColor *= smoothstep(timer, timer-1.0, timeElapsed);
	gl_FragColor *= smoothstep(0.0, 1.0, timeElapsed);
}