precision mediump float;

varying vec3 fragColor;
varying vec2 fragPos;
varying vec2 uv;
varying float dataX;

uniform float maskEdgeOffset;
uniform vec2 dataTextureSizeIvs;

uniform sampler2D dataTexture;
uniform sampler2D maskTexture;

//external constants will be replaced before compilation

const int maxCount = MAX_OBJECTS_COUNT;//external
const float blendDistFactor = BLEND_DIST_FACTOR;//external

float blendDist(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);

    return mix(b, a, h) - k * h * (1.0 - h);
}

float distToCircle(vec3 circle, vec2 p) {
    return distance(p, circle.xy) - circle.z;
}

float distToRect(vec4 rect, vec2 p) {
    vec2 o = abs(p - rect.xy) - rect.zw;

    return length(max(o, 0.0)) + max(min(o.x, 0.0), min(o.y, 0.0));
}

float distToSinusoide(vec4 sinusoide, vec2 p) {
    float sinVal = sin((fragPos.x - sinusoide.x) * 0.01 * mod(sinusoide.z, 10.0));
    vec2 sinPoint = vec2(p.x, sinusoide.y + sinVal * sinusoide.w);

    return abs(p.y - sinPoint.y) - 80.0;
}

vec4 getTextel(vec2 pos) {
    return texture2D(dataTexture, (pos + 0.5) * dataTextureSizeIvs);
}

float quadraticOutEase(float k) {
    return k * (2.0 - k);
}

float getDistanceToLava() {
    float distances[maxCount];
    int circlesCount = 0;
    int maxIndex = -1;

    for(int i = 0; i < maxCount; i++) {
        vec4 shape = getTextel(vec2(dataX, float(i)));

        if(int(shape.z) < MIN_RADIUS) {
            break;
        }

        if(int(shape.w) < MIN_RADIUS) {
            distances[i] = distToCircle(shape.xyz, fragPos);
        } else {
            distances[i] = distToSinusoide(shape, fragPos);
        }

        if(distances[i] > blendDistFactor * 2.0) {
            distances[i] = 99999.0;
        }

        circlesCount = i + 1;

        if(distances[i] <= -5.0) {
            return distances[i];
        }
    }

    if(circlesCount == 0) {
        return 999.0;
    }

    if(circlesCount == 1) {
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
    float fadeDist = 2.0;

    if(lavaDist >= fadeDist) {
        discard;
        return;
    }

    float glowSize = 1.5;
    float colorHeightMix = (uv.y + 1.0) * 0.5;

    // vec4 glowColorBottom = vec4(0.94, 0.52, 0.1, 1.0);
    // vec4 glowColorTop = vec4(0.89, 0.2, 0.27, 1.0);

    // vec3 col1 = vec3(0.980, 0.0294, 0.0928);
    // vec3 col2 = vec3(0.89, 0.2, 0.27);

    // vec3 baseColor = vec3(0.91, 0.11, 0.38);
    vec3 baseColor = fragColor;

    if(lavaDist < 0.0) {
        gl_FragColor = vec4(baseColor, 1.0);
        return;
    }

    if(lavaDist < fadeDist) {
        float f = 1.0 - lavaDist / fadeDist;

        gl_FragColor = vec4(mix(baseColor, vec3(0.0, 0.0, 1.0), 1.0 - f), f);
        // gl_FragColor = vec4(f, 1.0, 0.0, 1.0);
        return;
    }

    discard;

    // gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}

void setFragColorMask(float lavaDist) {
    if(abs(lavaDist) < 1.0) {
        gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
        return;
    }

    if(abs(lavaDist) < maskEdgeOffset) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        return;
    }

    if(lavaDist < 0.0) {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        return;
    }

    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
}

void renderWithMask() {
    vec4 mask = texture2D(maskTexture, uv);

    if(mask.z > 0.5) {
        SET_COLOR_FUNC(999.0);
    } else if(mask.x > 0.5) {
        SET_COLOR_FUNC(getDistanceToLava());
    } else {
        SET_COLOR_FUNC(-999.0);
        // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
}

void renderFull() {
    SET_COLOR_FUNC(getDistanceToLava());
}

void main() {
    RENDER_FUNC();//external renderWithMask|renderFull
}
