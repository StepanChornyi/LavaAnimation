precision mediump float;

varying vec3 fragColor;
varying vec2 vertPos;
varying vec2 glPos;

uniform vec3 sizeIvs;
uniform int circlesCount;

uniform sampler2D sampler;

const int count = 32;

float blendDist(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);

    return mix(b, a, h) - k * h * (1.0 - h);
}

float distToCircle(vec3 circle, vec2 p) {
    return distance(p, circle.xy) - circle.z;
}

vec4 getTextel(vec2 pos) {
    return texture2D(sampler, (pos + vec2(0.5, 0.5)) * sizeIvs.xy);
}

vec3 getCircle(float xX, float yY) {
    vec4 t1 = getTextel(vec2(xX * 2.0, yY));
    vec4 t2 = getTextel(vec2(xX * 2.0 + 1.0, yY));
    float x = dot(t1.rg, vec2(255.0, 255.0 * 255.0)) * sizeIvs.z;
    float y = dot(t2.rg, vec2(255.0, 255.0 * 255.0)) * sizeIvs.z;
    float r = t1.b * 255.0;

    return vec3(x, y, r);
}

float quadraticOutEase(float k) {
    return k * (2.0 - k);
}

void main() {
    int maxIndex = circlesCount - 1;

    float d[count];

    for(int i = 0; i < count; i++) {
        if(i > maxIndex) {
            break;
        }

        d[i] = distToCircle(getCircle(0.0, float(i)), vertPos);
    }

    maxIndex = circlesCount - 2;

    for(int i = 0; i < count - 1; i += 2) {
        if(i > maxIndex) {
            break;
        }
        d[i] = blendDist(d[i], d[i + 1], 100.0);
    }

    maxIndex = circlesCount - 3;

    for(int i = 0; i < count - 1; i += 4) {
        if(i > maxIndex) {
            break;
        }
        d[i] = blendDist(d[i], d[i + 2], 100.0);
    }

    maxIndex = circlesCount - 5;

    for(int i = 0; i < count - 1; i += 8) {
        if(i > maxIndex) {
            break;
        }
        d[i] = blendDist(d[i], d[i + 4], 100.0);
    }

    maxIndex = circlesCount - 9;

    for(int i = 0; i < count - 1; i += 16) {
        if(i > maxIndex) {
            break;
        }
        d[i] = blendDist(d[i], d[i + 8], 100.0);
    }

    maxIndex = circlesCount - 17;

    for(int i = 0; i < count - 1; i += 32) {
        if(i > maxIndex) {
            break;
        }
        d[i] = blendDist(d[i], d[i + 16], 100.0);
    }

    float baseDist = d[0];

    float glowSize = 3.5;
    float bloomSize = 0.0;
    float hf = (glPos.y + 1.0) * 0.5;

    vec3 glowColorBottom = vec3(0.94, 0.52, 0.1);
    vec3 glowColorTop = vec3(0.89, 0.2, 0.27);

    if(baseDist < 0.0) {
        gl_FragColor = vec4(mix(glowColorBottom, glowColorTop, hf), 1.0);

    } else if(baseDist <= glowSize) {
        vec3 colTop = vec3(0.85098, 0.03921, 0.08627);
        vec3 colBot = vec3(0.9490, 0.7960, 0.03921);

        float glowFactor = quadraticOutEase(1.0 - baseDist / glowSize);
        vec3 glowColor = mix(mix(colTop, colTop, hf), mix(glowColorBottom, glowColorTop, hf), glowFactor);

        gl_FragColor = vec4(glowColor, glowFactor);
    } else if(baseDist <= bloomSize) {
        vec3 col = vec3(0.8313, 0.05882, 0.3921);

        float glowFactor = quadraticOutEase(1.0 - baseDist / bloomSize) * 0.3;

        gl_FragColor = vec4(col, glowFactor);
    } else {
        discard;
    }

    // float glowSize = 3.5;
    // float bloomSize = 3.0;

    // vec4 col = vec4(float(circlesCount) / 10.0, 0.85, 0.15, 1.0);

    // if(g < 0.0) {
    //     gl_FragColor = col;
    // } else if(g < glowSize) {
    //     float alpha = (1.0 - g / glowSize);

    //     gl_FragColor = mix(vec4(0.97, 0.65, 0.15, 0.0), col, alpha);
    // } else {
    //     discard;
    // }
}
