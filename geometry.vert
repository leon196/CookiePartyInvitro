precision mediump float;

attribute vec4 position;
attribute vec4 seed;
uniform mat4 viewProjection;
uniform float time;
uniform vec2 resolution;
mat2 rotation (float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }
void main () {
	vec4 pos = position;
	float t = time * 0.1 + seed.w * 3.1415 * 2.;
	pos.xz *= rotation(t);
	pos.yz *= rotation(t);
	pos.yx *= rotation(t);
	pos.xyz *= 0.15 + seed.z * 0.05;
	pos.xyz += seed.xyz * 4.0 * vec3(resolution.x/resolution.y,1,1);
	gl_Position = viewProjection * pos;
	gl_PointSize = 4.0;
}