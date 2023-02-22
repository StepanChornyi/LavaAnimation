precision mediump float;

attribute vec2 vertPosition;
attribute vec3 vertColor;

varying vec3 fragColor;

uniform mat4 mProj;

void main() {
    fragColor = vertColor;

    gl_Position = vec4(vertPosition.xy, 1.0, 1.0);
}