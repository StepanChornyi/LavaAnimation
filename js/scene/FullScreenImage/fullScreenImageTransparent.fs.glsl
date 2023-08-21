precision mediump float;

varying vec2 uv;

uniform sampler2D spriteTexture;

void main() {
    gl_FragColor = texture2D(spriteTexture, uv);
}