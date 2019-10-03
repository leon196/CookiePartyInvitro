
precision mediump float;
attribute vec4 position;
uniform vec2 resolution;
varying vec2 uv;

void main () {
	uv = position.xy * vec2(resolution.x/resolution.y,1);
	gl_Position = vec4(position.xy, 0, 1);
}