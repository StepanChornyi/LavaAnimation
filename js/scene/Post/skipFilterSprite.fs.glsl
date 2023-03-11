precision mediump float;

varying vec3 fragColor;
varying vec2 uv;

uniform vec2 offset;

uniform sampler2D spriteTexture;

void main() {
    vec4 texColorOrig = texture2D(spriteTexture, uv);
    vec4 texColor = texture2D(spriteTexture, uv + offset);

    if(texColorOrig.a > 0.0) {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        return;
    }

    gl_FragColor = vec4(0.0, 1.0, 0.0, texColor.a);
}