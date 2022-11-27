precision mediump float;

attribute vec3 vertPosition;
attribute vec2 vertTexCoord;
attribute float faceLight;
attribute float blockIndex;

varying vec2 fragTexCoord;
varying float fragLight;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

uniform float hightLightIndex;

void main() {
  fragLight = faceLight;

  if(hightLightIndex == blockIndex) {
    fragLight *= 3.0;
  }

  fragTexCoord = vertTexCoord;
  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}