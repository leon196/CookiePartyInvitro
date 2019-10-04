precision mediump float;

uniform sampler2D frame, frameBlur;
uniform vec2 resolution;
uniform float time, motionFrames;

varying vec2 texcoord;

float random (in vec2 st) { return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }

void main() {
	vec2 uv = texcoord;
	float dither = random(uv+fract(time));
	vec4 blur = texture2D(frameBlur, vec2(uv.x,1.-uv.y));
	vec4 neon = pow(blur, vec4(0.5));
	gl_FragColor  = texture2D(frame, uv);
	gl_FragColor += smoothstep(0.0, 0.75, neon);
	gl_FragColor *= 0.9 + 0.1 * dither;
}