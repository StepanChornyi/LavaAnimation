precision mediump float;

attribute vec2 vertPosition;
attribute vec3 vertColor;

varying vec3 fragColor;

uniform vec4 transform;

void main() {
    vec2 pos = ((vertPosition + transform.xy) * transform.zw * 2.0 - 1.0) * vec2(1.0, -1.0);

    fragColor = vertColor;

    gl_Position = vec4(pos, 1.0, 1.0);
}