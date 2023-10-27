#include <packing>

uniform vec3 circleData;
uniform vec4 channels;

varying vec2 fragPos;

void main() {
    vec2 axisDist = abs(circleData.xy - fragPos);
    float axisMinDist = circleData.z * 0.6666;
    float dist = 0.0;

    // if(axisDist.x < axisMinDist && axisDist.y < axisMinDist) {
    //     dist = -circleData.z;
    // } else {
    dist = distance(circleData.xy, fragPos) - circleData.z;
    // }

    if(dist < K_FACTOR) {
        gl_FragColor = channels * (1.0 - clamp(dist * K_FACTOR_IVS, 0.0, 1.0));
        // gl_FragDepth = max(0.0, dist * K_FACTOR_IVS);
    } else {
        discard;
        // gl_FragDepth = 1.0;
    }
}