precision mediump float;

varying vec3 fragColor;

void main() {
  gl_FragColor = vec4(fragColor.xyz, 1.0);
}