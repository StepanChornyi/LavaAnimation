precision mediump float;

attribute vec3 vertPosition;

varying vec3 vertPos;
varying vec2 uv;

uniform mat3 transform;
uniform mat3 viewTransform;

void main() {
    vec3 pos = viewTransform * transform * vec3(vertPosition.xy, 1.0);

    vec2 glPos = (pos.xy * 2.0 - 1.0) * vec2(1.0, -1.0);

    uv = (glPos * 0.5) + 0.5;

    vertPos = vertPosition;

    gl_Position = vec4(glPos, 1.0, 1.0);
}