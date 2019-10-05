precision mediump float;

attribute vec4 position;
attribute vec4 seed;

uniform mat4 viewProjection;
uniform float time, expansion, growth, timeRotation;
uniform vec2 resolution;

const float PI = 3.1415;

mat2 rotation (float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }
float random (in vec2 st) { return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }

void main () {
	vec4 pos = position;
	float t = time * (seed.w*0.5+0.5) * 4. + seed.w;//(seed.w * 0.1 + 0.5 + 0.5);
	float ratio = mod(t, 1.);

	// pos.xyz *= 0.1 + 0.2 * abs(seed.z);
	// pos.xz *= rotation(seed.x);
	// pos.yz *= rotation(seed.y);
	// pos.yx *= rotation(seed.z);
	// pos.xyz += seed.xyz * 4.;

	// train ride
	// float range = (mod(ratio+seed.w*3.5,1.) * 2. - 1.)*20.;
	// pos.yz *= rotation(PI/2.);
	// pos.z += range;
	// pos.y += sin(pos.z*.5)*.5;
	// pos.xy *= rotation(pos.z * .1);

	// expansion
	float fade = smoothstep(0.0,0.2,ratio)*smoothstep(1.0,0.5,ratio);
	float wave = pow(ratio, 4.0);
	pos.xz *= rotation(time*seed.w);
	pos.yz *= rotation(time*seed.w);
	pos.yx *= rotation(time*seed.w);
	pos.xyz *= 0.1 + abs(seed.z);
	// pos.xyz *= expansion;
	pos.xyz += seed.xyz * 4. * (.5+expansion * ratio);
	pos.xz *= rotation(seed.w*1.687);
	pos.yz *= rotation(seed.w*1.57468);
	pos.yx *= rotation(seed.w*1.132);

	gl_Position = viewProjection * pos;
	gl_PointSize = 1.+4.*smoothstep(0.6,1.,abs(seed.x));
	gl_PointSize *= fade;
}