precision mediump float;

attribute vec4 position;
attribute vec4 seed;

uniform mat4 viewProjection;
uniform float time, growth;
uniform vec2 resolution;

const float PI = 3.1415;

mat2 rotation (float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

void main () {
	vec4 pos = position;
	float t = seed.w * PI * 2.;
	pos.xyz *= growth;
	gl_Position = viewProjection * pos;
	gl_PointSize = 20.;
}

