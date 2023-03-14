precision mediump float;

attribute vec2 vertPosition;
attribute float vertColor;
attribute vec2 vertUv;

varying vec3 fragColor;
varying vec2 fragPos;
varying vec2 uv;

uniform mat3 transform;
uniform mat3 viewTransform;

void main() {
  fragPos = vertPosition;
  fragColor = vec3(vertColor / (256.0 * 256.0), mod(vertColor / 256.0, 256.0), mod(vertColor, 256.0)) * (1.0 / 255.0);
  uv = vec2(vertUv.x, 1.0 - vertUv.y);

  vec3 pos = viewTransform * transform * vec3(vertPosition, 1.0);

  gl_Position = vec4((pos.xy * 2.0 - 1.0) * vec2(1.0, -1.0), 1.0, 1.0);
}