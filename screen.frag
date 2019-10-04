
precision mediump float;

uniform sampler2D frame, frameBlur;
uniform vec2 resolution;
uniform float time, timeElapsed, timer, motionFrames;

varying vec2 texcoord;

float random (in vec2 st) { return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }

void main() {
	vec2 uv = texcoord;
	gl_FragColor  = texture2D(frame, uv) + texture2D(frameBlur, vec2(uv.x,1.-uv.y)) * 4.;
}