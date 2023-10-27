uniform vec2 textureSize;
uniform vec4 sineData0;
uniform vec4 sineData1;

varying vec2 fragPos;

void main() {
    vec2 vertOffset = position.xy * vec2(1.0, -1.0) * vec2(sineData0.z, sineData0.w + 100.0 + sineData1.x);

    vec2 rotatedVertOffset = (modelMatrix * vec4(vertOffset, 0.0, 1.0)).xy;

    fragPos = sineData0.xy + vertOffset;

    vec2 fragPosRotated = sineData0.xy + rotatedVertOffset;

    vec2 vertPos = (fragPosRotated) / textureSize.xy;

    vertPos.y = 1.0 - vertPos.y;

    vec2 pos = (vertPos) * 2.0 - 1.0;

    gl_Position = vec4(pos, 0.0, 1.0);
}