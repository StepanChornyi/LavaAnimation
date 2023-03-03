precision mediump float;

varying vec3 fragColor;
varying vec2 vertPos;

void main() {
    float r = length(vertPos);
    float a = 1.0;
    float smoothRadius = 0.01;
    float offset = 1.0 - smoothRadius;

    if(r > 1.0) {
        discard;
    }

    if(r > offset) {
        a = (1.0 - (r - offset) / smoothRadius);
    }

    gl_FragColor = vec4(fragColor, a);
}