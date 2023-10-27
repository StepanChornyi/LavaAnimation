#include <packing>

uniform vec4 dimensions;
uniform vec4 character;
uniform vec4 channels;

varying vec2 fragPos;

void main() {
    float dist = 0.0;

    // if(axisDist.x < axisMinDist && axisDist.y < axisMinDist) {
    //     dist = -circleData.z;
    // } else {

    float sineArg = fragPos.x - dimensions.x + character.z;

    float sinVal = sin((sineArg) * character.y);

    // dist = abs(dimensions.y + sinVal * dimensions.w - fragPos.y) - character.x;
    dist = dimensions.y + sinVal * dimensions.w - fragPos.y - character.x;

    // }

    // gl_FragColor = vec4(0.0, dist, 0.0, 0.0);
    // return;

    if(dist < K_FACTOR) {
        gl_FragColor = channels * (1.0 - clamp(dist * K_FACTOR_IVS, 0.0, 1.0));
        // gl_FragDepth = max(0.0, dist * K_FACTOR_IVS);
    } else {
        discard;
        // gl_FragDepth = 1.0;
    }
}