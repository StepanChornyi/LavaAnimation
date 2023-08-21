precision mediump float;

varying vec3 vertPos;
varying vec2 uv;

uniform sampler2D myTex;

void main() {
    float dist = length(vertPos.xy);

    if(dist < vertPos.z) {
        float color = 1.0 - dist / vertPos.z;
        vec4 dst = texture2D(myTex, uv);
        vec4 src = dst;

        if(dst.r == 0.0) {
            src = vec4(color, 0.0, 0.0, 0.0);
        } else {
            if(color > dst.r) {
                src = vec4(color, dst.rgb);
            } else if(color > dst.g) {
                src = vec4(dst.r, color, dst.gb);
            } else if(color > dst.b) {
                src = vec4(dst.rg, color, dst.b);
            } else if(color > dst.a) {
                src = vec4(dst.rgb, color);
            }
        }

        gl_FragColor = src.rgbr;

    } else {
        discard;
    }
}