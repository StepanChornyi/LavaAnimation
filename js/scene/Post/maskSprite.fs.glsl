precision mediump float;

varying vec3 fragColor;
varying vec2 uv;

uniform sampler2D spriteTexture;
uniform sampler2D maskTexture;

void main() {
    vec4 texColor = texture2D(spriteTexture, uv);
    vec4 maskColor = texture2D(maskTexture, uv);

    if(maskColor.a > 0.001) {
        gl_FragColor = maskColor;
        return;
    }

    gl_FragColor = texColor;
}