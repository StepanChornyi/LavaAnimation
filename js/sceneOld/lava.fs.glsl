precision mediump float;

uniform vec2 size;
uniform vec3 glowColorBottom;
uniform vec3 glowColorTop;

uniform vec3 ground0;
uniform vec3 ground1;
uniform vec3 ground2;
uniform vec3 ground3;
uniform vec3 ground4;
uniform vec3 ground5;
uniform vec3 ground6;
uniform vec3 ground7;

uniform mat4 bubble0X;
uniform mat4 bubble0Y;
uniform mat4 bubble0R;

uniform mat4 bubble1X;
uniform mat4 bubble1Y;
uniform mat4 bubble1R;

uniform mat4 bubble2X;
uniform mat4 bubble2Y;
uniform mat4 bubble2R;

varying vec2 vertPos;
varying vec3 fragColor;

float lerp(float a, float b, float k) {
    return a + (b - a) * k;
}

vec3 lerp3(vec3 a, vec3 b, float k) {
    return vec3(lerp(a.x, b.x, k), lerp(a.y, b.y, k), lerp(a.z, b.z, k));
}

float quadraticOutEase(float k) {
    return k * (2.0 - k);
}

float blendDist(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return lerp(b, a, h) - k * h * (1.0 - h);
}

float distToCircle(vec3 circle, vec2 p) {
    return distance(p, circle.xy) - circle.z;
}

float distToRect(vec4 rect, vec2 p) {
    vec2 o = abs(p - rect.xy) - rect.zw;
    float ud = length(max(o, 0.0));
    float n = max(min(o.x, 0.0), min(o.y, 0.0));

    return ud + n;
}

void main() {
    vec2 pos = vec2((vertPos.x * 0.5 + 0.5) * size.x, (-vertPos.y * 0.5 + 0.5) * size.y);

    vec4 baseRect = vec4(size.x * 0.5, size.y, size.x, 50);

    float baseDist = distToRect(baseRect, pos);

    float g1 = blendDist(distToCircle(ground0, pos), distToCircle(ground1, pos), 100.0);
    float g2 = blendDist(distToCircle(ground2, pos), distToCircle(ground3, pos), 100.0);
    float g3 = blendDist(distToCircle(ground4, pos), distToCircle(ground5, pos), 100.0);
    float g4 = blendDist(distToCircle(ground6, pos), distToCircle(ground7, pos), 100.0);
    float g5 = blendDist(g1, g2, 100.0);
    float g6 = blendDist(g3, g4, 100.0);
    float g7 = blendDist(g5, g6, 100.0);

    float bubble;

    for(float i = 0.0; i < 4.0; i++) {
        for(float j = 0.0; j < 4.0; j++) {
            bubble = distToCircle(vec3(bubble0X[int(i)][int(j)], bubble0Y[int(i)][int(j)], bubble0R[int(i)][int(j)]), pos);
            baseDist = blendDist(baseDist, bubble, 100.0);
        }
    }

    for(float i = 0.0; i < 4.0; i++) {
        for(float j = 0.0; j < 4.0; j++) {
            bubble = distToCircle(vec3(bubble1X[int(i)][int(j)], bubble1Y[int(i)][int(j)], bubble1R[int(i)][int(j)]), pos);
            baseDist = blendDist(baseDist, bubble, 100.0);
        }
    }

    for(float i = 0.0; i < 4.0; i++) {
        for(float j = 0.0; j < 4.0; j++) {
            bubble = distToCircle(vec3(bubble2X[int(i)][int(j)], bubble2Y[int(i)][int(j)], bubble2R[int(i)][int(j)]), pos);
            baseDist = blendDist(baseDist, bubble, 100.0);
        }
    }

    baseDist = blendDist(g7, baseDist, 100.0);

    float glowSize = 1.5;
    float bloomSize = 3.0;
    float colorMixFactor = (pos.y / size.y) - 0.3;

    if(baseDist < 0.0) {
        gl_FragColor = vec4(lerp3(glowColorBottom, glowColorTop, colorMixFactor), 1.0);

    } else if(baseDist <= glowSize) {
        vec3 colTop = vec3(0.85098, 0.03921, 0.08627);
        vec3 colBot = vec3(0.9490, 0.7960, 0.03921);

        float glowFactor = quadraticOutEase(1.0 - baseDist / glowSize);
        vec3 glowColor = lerp3(lerp3(colTop, colTop, colorMixFactor), lerp3(glowColorBottom, glowColorTop, colorMixFactor), glowFactor);

        gl_FragColor = vec4(glowColor, glowFactor);
    } else if(baseDist <= bloomSize) {
        vec3 col = vec3(0.8313, 0.05882, 0.3921);

        float glowFactor = quadraticOutEase(1.0 - baseDist / bloomSize) * 0.3;

        gl_FragColor = vec4(col, glowFactor);
    } else {

        gl_FragColor = vec4(0.9, 0.9, 0.9, 0.0);
    }
}