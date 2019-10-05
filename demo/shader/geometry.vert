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
	float t = 0.5 * timeRotation * (seed.w*0.5+0.5) + seed.w;//(seed.w * 0.1 + 0.5 + 0.5);
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
	float fade = smoothstep(0.0,0.1,ratio)*smoothstep(1.0,0.9,ratio);
	float wave = pow(ratio, 4.0);
	pos.xz *= rotation(timeRotation*seed.w);
	pos.yz *= rotation(timeRotation*seed.w);
	pos.yx *= rotation(timeRotation*seed.w);
	pos.xyz *= 0.2 + smoothstep(0.5,1.0,abs(seed.z));
	// pos.xyz *= expansion;
	pos.xyz += seed.xyz * 3.;// * ((1.-expansion)+expansion * ratio);
	pos.xyz = normalize(pos.xyz) * max(3.*growth,length(pos.xyz));
	pos.xz *= rotation(t*1.687);
	pos.yz *= rotation(t*1.57468);
	pos.yx *= rotation(t*1.132);

	gl_Position = viewProjection * pos;
}