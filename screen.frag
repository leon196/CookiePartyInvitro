
precision mediump float;
uniform sampler2D frame0,frame1,frame2,frame3,frame4,frame5,frame6,frame7,frame8,frame9;
uniform vec2 resolution;
uniform float time, timeElapsed, timer, motionFrames;
varying vec2 uv;

float random (in vec2 st) { return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }

void main() {
	gl_FragColor  = texture2D(frame0, uv)/motionFrames;
	gl_FragColor += texture2D(frame1, uv)/motionFrames;
	gl_FragColor += texture2D(frame2, uv)/motionFrames;
	gl_FragColor += texture2D(frame3, uv)/motionFrames;
	gl_FragColor += texture2D(frame4, uv)/motionFrames;
	gl_FragColor += texture2D(frame5, uv)/motionFrames;
	gl_FragColor += texture2D(frame6, uv)/motionFrames;
	gl_FragColor += texture2D(frame7, uv)/motionFrames;
	gl_FragColor += texture2D(frame8, uv)/motionFrames;
	gl_FragColor += texture2D(frame9, uv)/motionFrames;
}