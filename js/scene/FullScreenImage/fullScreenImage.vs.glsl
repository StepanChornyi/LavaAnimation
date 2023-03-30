precision mediump float;

attribute vec2 vertPosition;
attribute vec2 vertUv;

varying vec2 uv;

void main() {
    uv = vertUv;

    gl_Position = vec4(vertPosition, 1.0, 1.0);
}