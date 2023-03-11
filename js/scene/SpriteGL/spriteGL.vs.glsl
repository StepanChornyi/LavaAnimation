precision mediump float;

attribute vec2 vertPosition;
attribute vec3 vertColor;
attribute vec2 vertUv;

varying vec3 fragColor;
varying vec2 uv;

uniform mat3 transform;
uniform mat3 viewTransform;

void main() {
    vec3 pos = viewTransform * transform * vec3(vertPosition.xy, 1.0);

    vec2 glPos = (pos.xy * 2.0 - 1.0) * vec2(1.0, -1.0);

    fragColor = vertColor;
    uv = vertUv;

    gl_Position = vec4(glPos, 1.0, 1.0);
}