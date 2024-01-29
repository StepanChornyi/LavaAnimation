#include <packing>

uniform vec4 channels;

uniform vec3 circleA;
uniform vec3 circleB;

varying vec2 fragPos;

float blendDist(float a, float b) {
    float h = clamp(0.5 + (b - a) * K_FACTOR_IVS_HALF, 0.0, 1.0);

    return mix(b, a, h) - K_FACTOR * h * (1.0 - h);
}


void main() {
   float distA = distance(circleA.xy, fragPos) - circleA.z;
   float distB = distance(circleB.xy, fragPos) - circleB.z;

   float dist = blendDist(distA, distB);

    if(dist < K_FACTOR) {
        gl_FragColor = channels * (1.0 - clamp(dist * K_FACTOR_IVS, 0.0, 1.0));
    } else {
        discard;
        // gl_FragColor = vec4(0.0, 0.0, 0.5, 0.1);
    }
}