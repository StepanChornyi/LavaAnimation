precision mediump float;

varying vec2 fragTexCoord;
varying float fragLight;

uniform sampler2D sampler;

void main() {
  gl_FragColor = vec4(texture2D(sampler, fragTexCoord).xyz * fragLight, 1.0);
}