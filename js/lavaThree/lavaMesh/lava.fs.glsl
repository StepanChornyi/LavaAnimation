#include <packing>

uniform sampler2D groupTex0;
uniform sampler2D groupTex1;

varying vec2 vUv;
varying vec3 fragColorFill;
varying vec3 fragColorBg;

float blendDist(float a, float b) {
    float h = clamp(0.5 + (b - a) * K_FACTOR_IVS_HALF, 0.0, 1.0);

    return mix(b, a, h) - K_FACTOR * h * (1.0 - h);
}

float getTexDist(sampler2D tex) {
    vec4 col = texture2D(tex, vUv);

    col = (vec4(1.0) - col) * K_FACTOR;

    return blendDist(blendDist(col.r, col.g), blendDist(col.b, col.a));
}

void main() {
    // gl_FragColor = vec4(texture2D(groupTex0, vUv).xyz, 1.0);
    // return;

    float lavaDist = blendDist(getTexDist(groupTex0), getTexDist(groupTex1));

    float fadeDist = 3.0;
    float minLavaDist = 0.5;

    // float glowSize = 1.5;
    // float colorHeightMix = (uv.y + 1.0) * 0.5;

    // vec4 glowColorBottom = vec4(0.94, 0.52, 0.1, 1.0);
    // vec4 glowColorTop = vec4(0.89, 0.2, 0.27, 1.0);

    // vec3 col1 = vec3(0.980, 0.0294, 0.0928);
    // vec3 col2 = vec3(0.89, 0.2, 0.27);

    // vec3 baseColor = vec3(0.91, 0.11, 0.38);
    // vec3 baseColor = fragColor;

    if(lavaDist < minLavaDist) {
        gl_FragColor = vec4(fragColorFill, 1.0);
        return;
    }

    if(lavaDist < fadeDist) {
        float f = 1.0 - (lavaDist - minLavaDist) / (fadeDist - minLavaDist);

        vec3 fadeColor = mix(fragColorFill, vec3(0.0, 0.0, 1.0), 1.0 - f);

        gl_FragColor = vec4(mix(fragColorBg, fadeColor, f), 1.0);

        // gl_FragColor = vec4(fadeColor, f);
        return;
    }

    gl_FragColor = vec4(fragColorBg, 1.0);
}