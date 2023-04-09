precision mediump float;

attribute vec2 vertPosition;
attribute float vertColor;
attribute float vertDataX;

varying vec3 fragColor;
varying vec2 fragPos;
varying vec2 uv;
varying float dataX;

uniform mat3 transform;
uniform mat3 viewTransform;

void main() {
  fragColor = vec3(vertColor / (256.0 * 256.0), mod(vertColor / 256.0, 256.0), mod(vertColor, 256.0)) * (1.0 / 255.0);

  dataX = vertDataX;
  fragPos = vertPosition;

  vec2 pos = (viewTransform * transform * vec3(vertPosition, 1.0)).xy;
  vec2 glPos = (pos * 2.0 - 1.0) * vec2(1.0, -1.0);

  uv = vec2(pos.x, 1.0 - pos.y);

  gl_Position = vec4(glPos, 1.0, 1.0);
}