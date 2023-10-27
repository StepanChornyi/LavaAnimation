#include <packing>

uniform vec4 dimensions;
uniform vec4 channels;
uniform float radius;

varying vec2 fragPos;

void main() {
    vec2 d = abs(fragPos - dimensions.xy) - dimensions.zw + radius;

    float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - radius;

    if(dist < K_FACTOR) {
        gl_FragColor = channels * (1.0 - clamp(dist * K_FACTOR_IVS, 0.0, 1.0));
    } else {
        discard;
    }
}