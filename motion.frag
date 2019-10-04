#version 300 es
precision mediump float;

uniform mediump sampler2DArray frames;
uniform sampler2D frame0,frame1,frame2,frame3,frame4,frame5,frame6,frame7,frame8,frame9;
uniform vec2 resolution;
uniform float time, timeElapsed, timer, motionFrames;

in vec2 texcoord;
out vec4 color;

float random (in vec2 st) { return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }

void main() {
	vec2 uv = texcoord;
	color  = texture(frame0, uv);//vec3(uv,0));
	// gl_FragColor  = texture(frame0, uv);
	// gl_FragColor  = texture(frame0, uv)/motionFrames;
	// gl_FragColor += texture(frame1, uv)/motionFrames;
	// gl_FragColor += texture(frame2, uv)/motionFrames;
	// gl_FragColor += texture(frame3, uv)/motionFrames;
	// gl_FragColor += texture(frame4, uv)/motionFrames;
	// gl_FragColor += texture(frame5, uv)/motionFrames;
	// gl_FragColor += texture(frame6, uv)/motionFrames;
	// gl_FragColor += texture(frame7, uv)/motionFrames;
	// gl_FragColor += texture(frame8, uv)/motionFrames;
	// gl_FragColor += texture(frame9, uv)/motionFrames;
}