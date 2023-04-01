precision mediump float;

varying vec2 uv;

uniform sampler2D spriteTexture;

void main() {
    vec4 texColor = texture2D(spriteTexture, uv);

if(texColor.x<0.0){

    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

return;
}
    // gl_FragColor = vec4(1.0, 1.0, 0.0, 0.5);
    gl_FragColor = vec4(texColor.xyz, texColor.w*0.5);
}