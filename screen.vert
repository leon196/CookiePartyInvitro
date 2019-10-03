
precision mediump float;
attribute vec4 position;
uniform vec2 resolution;
varying vec2 uv;

void main () {
	uv = position.xy * 0.5 + 0.5;
	gl_Position = vec4(position.xy, 0, 1);
}