#include <packing>

uniform vec3 dimensions;
uniform vec4 channels;

varying vec2 fragPos;

void main() {
    float dist = distance(dimensions.xy, fragPos) - dimensions.z;

    if(dist < K_FACTOR) {
        gl_FragColor = channels * (1.0 - clamp(dist * K_FACTOR_IVS, 0.0, 1.0));
    } else {
        discard;
        // gl_FragDepth = 1.0;
    }
}