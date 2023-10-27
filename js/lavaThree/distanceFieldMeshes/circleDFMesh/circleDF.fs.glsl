#include <packing>

uniform vec3 dimensions;
uniform vec4 channels;

varying vec2 fragPos;

void main() {
    vec2 axisDist = abs(dimensions.xy - fragPos);
    float axisMinDist = dimensions.z * 0.6666;
    float dist = 0.0;

    // if(axisDist.x < axisMinDist && axisDist.y < axisMinDist) {
    //     dist = -dimensions.z;
    // } else {
    dist = distance(dimensions.xy, fragPos) - dimensions.z;
    // }

    if(dist < K_FACTOR) {
        gl_FragColor = channels * (1.0 - clamp(dist * K_FACTOR_IVS, 0.0, 1.0));
        // gl_FragDepth = max(0.0, dist * K_FACTOR_IVS);
    } else {
        discard;
        // gl_FragDepth = 1.0;
    }
}