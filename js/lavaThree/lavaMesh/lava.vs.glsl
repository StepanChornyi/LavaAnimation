varying vec2 vUv;
varying vec3 fragColorFill;
varying vec3 fragColorBg;

attribute vec3 colorFill;
attribute vec3 colorBg;

void main() {
    vUv = (position.xy + vec2(1.0)) * 0.5;

    fragColorFill = colorFill;
    fragColorBg = colorBg;

    gl_Position = vec4(position.xy, 0.0, 1.0);
}