precision mediump float;

varying vec3 fragColor;
varying vec2 uv;

uniform sampler2D spriteTexture;

void main() {
    vec4 texColor = texture2D(spriteTexture, uv);

    // gl_FragColor = vec4(fragColor, 1.0 - texColor.a);
    gl_FragColor =texColor;
}