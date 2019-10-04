#version 300 es
precision mediump float;

uniform float time;
uniform vec4 tint;

out vec4 color;

void main() {
	color = vec4(tint);
}