precision mediump float;

varying vec3 fragColor;
varying vec2 vertPos;
varying vec2 uv;

uniform vec3 sizeIvs;
uniform int circlesCount;

uniform sampler2D sampler;

const int maxCount = 128;
const float blendDistFactor = 100.0;

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
    float x = dot(t1.rg, vec2(255.0, 65025.0)) * sizeIvs.z;
    float y = dot(t2.rg, vec2(255.0, 65025.0)) * sizeIvs.z;
    float r = t1.b * 255.0;

    return vec3(x, y, r);
}

float quadraticOutEase(float k) {
    return k * (2.0 - k);
}

float getDistanceToLava() {
    float distances[maxCount];
    int maxIndex = circlesCount - 1;

    for(int i = 0; i < maxCount; i++) {
        if(i > maxIndex) {
            break;
        }

        distances[i] = distToCircle(getCircle(0.0, float(i)), vertPos);

        if(distances[i] <= 0.0) {
            return distances[i];
        }
    }

    if(circlesCount < 2) {
        return distances[0];
    }

    maxIndex = circlesCount - 2;

    for(int i = 0; i < maxCount - 1; i += 2) {
        if(i > maxIndex) {
            break;
        }
        distances[i] = blendDist(distances[i], distances[i + 1], blendDistFactor);
    }

    if(circlesCount < 3) {
        return distances[0];
    }

    maxIndex = circlesCount - 3;

    for(int i = 0; i < maxCount - 1; i += 4) {
        if(i > maxIndex) {
            break;
        }
        distances[i] = blendDist(distances[i], distances[i + 2], blendDistFactor);
    }

    if(circlesCount < 5) {
        return distances[0];
    }

    maxIndex = circlesCount - 5;

    for(int i = 0; i < maxCount - 1; i += 8) {
        if(i > maxIndex) {
            break;
        }
        distances[i] = blendDist(distances[i], distances[i + 4], blendDistFactor);
    }

    if(circlesCount < 9) {
        return distances[0];
    }

    maxIndex = circlesCount - 9;

    for(int i = 0; i < maxCount - 1; i += 16) {
        if(i > maxIndex) {
            break;
        }
        distances[i] = blendDist(distances[i], distances[i + 8], blendDistFactor);
    }

    if(circlesCount < 17) {
        return distances[0];
    }

    maxIndex = circlesCount - 17;

    for(int i = 0; i < maxCount - 1; i += 32) {
        if(i > maxIndex) {
            break;
        }
        distances[i] = blendDist(distances[i], distances[i + 16], blendDistFactor);
    }

    if(circlesCount < 33) {
        return distances[0];
    }

    maxIndex = circlesCount - 33;

    for(int i = 0; i < maxCount - 1; i += 64) {
        if(i > maxIndex) {
            break;
        }
        distances[i] = blendDist(distances[i], distances[i + 32], blendDistFactor);
    }

    if(circlesCount < 65) {
        return distances[0];
    }

    maxIndex = circlesCount - 65;

    for(int i = 0; i < maxCount - 1; i += 128) {
        if(i > maxIndex) {
            break;
        }
        distances[i] = blendDist(distances[i], distances[i + 64], blendDistFactor);
    }

    return distances[0];
}

void setFragColor(float lavaDist) {
    float glowSize = 3.5;
    float bloomSize = 0.0;
    float colorHeightMix = (uv.y + 1.0) * 0.5;

    vec4 glowColorBottom = vec4(0.94, 0.52, 0.1, 1.0);
    vec4 glowColorTop = vec4(0.89, 0.2, 0.27, 1.0);

    if(lavaDist < 0.0) {
        gl_FragColor = vec4(fragColor, 1.0); //mix(glowColorBottom, glowColorTop, colorHeightMix);
    } else if(lavaDist <= glowSize) {
        float glowFactor = quadraticOutEase(1.0 - lavaDist / glowSize);

        vec4 colorTop = vec4(0.85098, 0.03921, 0.08627, glowFactor);
        vec4 colorBot = vec4(0.850, 0.0425, 0.460, glowFactor);

        vec4 glowColor = mix(mix(colorTop, colorBot, colorHeightMix), vec4(fragColor, 1.0), glowFactor);

        gl_FragColor = glowColor;
    } else if(lavaDist <= bloomSize) {
        vec3 col = vec3(0.8313, 0.05882, 0.3921);

        float glowFactor = quadraticOutEase(1.0 - lavaDist / bloomSize) * 0.3;

        gl_FragColor = vec4(col, glowFactor);
    } else {
        // gl_FragColor = texture2D(sampler, (glPos+1.0)*0.5);

        discard;
    }
}

void main() {
    setFragColor(getDistanceToLava());
}
