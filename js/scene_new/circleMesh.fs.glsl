precision mediump float;

varying vec3 vertPos;
varying vec2 uv;

uniform sampler2D myTex;

void main() {
    float dist = length(vertPos.xy);

    vec4 pixelData = texture2D(myTex, uv);

    if(dist < vertPos.z) {
        float color = 1.0 - dist / vertPos.z;

        if(pixelData.r == 0.0) {
            gl_FragColor = vec4(color, 0.0, 0.0, 1.0);
        } else {
            if(pixelData.r < color) {
                gl_FragColor = vec4(color, pixelData.r, pixelData.g, 1.0);
            } else if(pixelData.g < color) {
                gl_FragColor = vec4(pixelData.r, color, pixelData.g, 1.0);
            } else if(pixelData.b < color) {
                gl_FragColor = vec4(pixelData.r, pixelData.g, color, 1.0);
            }
        }
    } else {
        gl_FragColor = pixelData;
    }
}