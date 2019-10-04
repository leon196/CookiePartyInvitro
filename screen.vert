#version 300 es
precision mediump float;

uniform vec2 resolution;

in vec4 position;
out vec2 texcoord;

void main () {
	texcoord = position.xy * 0.5 + 0.5;
	gl_Position = vec4(position.xy, 0, 1);
}