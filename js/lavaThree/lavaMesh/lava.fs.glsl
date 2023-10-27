#include <packing>

uniform sampler2D groupTex0;
// uniform sampler2D groupTex1;

varying vec2 vUv;

float blendDist(float a, float b) {
    float h = clamp(0.5 + (b - a) * K_FACTOR_IVS_HALF, 0.0, 1.0);

    return mix(b, a, h) - K_FACTOR * h * (1.0 - h);
}

void main() {
    vec4 d0 = texture2D(groupTex0, vUv);
    // vec4 d1 = texture2D(depth1, vUv);

    // gl_FragColor = vec4(d0.xyz, 1.0);
    // return;

    d0 = (vec4(1.0) - d0) * K_FACTOR;

    float res = blendDist(blendDist(d0.r, d0.g), blendDist(d0.b, d0.a));

    if(res < 0.5) {
        gl_FragColor = vec4(vec3(1.0, 0.0, 0.0), 1.0);
    } else {
        res *= K_FACTOR_IVS;

        gl_FragColor = vec4(vec3(1.0-res), 1.0);
    }
}