varying vec2 vUv;

void main() {
    vUv = (position.xy + vec2(1.0)) * 0.5;

    gl_Position = vec4(position.xy, 0.0, 1.0);
}