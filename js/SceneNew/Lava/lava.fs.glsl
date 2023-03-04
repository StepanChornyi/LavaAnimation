precision mediump float;

varying vec3 fragColor;
varying vec2 vertPos;

uniform vec3 ground0;
uniform vec3 ground1;

float blendDist(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);

    return mix(b, a, h) - k * h * (1.0 - h);
}

float distToCircle(vec3 circle, vec2 p) {
    return distance(p, circle.xy) - circle.z;
}

void main() {
    float g = blendDist(distToCircle(ground0, vertPos), distToCircle(ground1, vertPos), 100.0);

    float glowSize = 3.5;
    float bloomSize = 3.0;

    if(g < 0.0) {
        gl_FragColor = vec4(0.97, 0.85, 0.15, 1.0);
    } else if(g < glowSize) {
        float alpha = (1.0 - g / glowSize);

        gl_FragColor = vec4(0.97, 0.65, 0.15, alpha);
    } else {
        discard;
    }
}
