precision mediump float;

attribute vec4 position;

uniform vec2 resolution;

varying vec2 texcoord;

void main () {
	texcoord = position.xy * 0.5 + 0.5;
	gl_Position = vec4(position.xy, 0, 1);
}