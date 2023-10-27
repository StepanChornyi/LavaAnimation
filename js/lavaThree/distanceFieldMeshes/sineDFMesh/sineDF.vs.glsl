uniform vec2 screenSize;
uniform vec4 dimensions;
uniform vec4 character;

varying vec2 fragPos;

void main() {
    vec2 vertOffset = position.xy * vec2(1.0, -1.0) * vec2(dimensions.z, dimensions.w + K_FACTOR + character.x);

    vec2 rotatedVertOffset = (modelMatrix * vec4(vertOffset, 0.0, 1.0)).xy;

    fragPos = dimensions.xy + vertOffset;

    vec2 fragPosRotated = dimensions.xy + rotatedVertOffset;

    vec2 vertPos = (fragPosRotated) / screenSize.xy;

    vertPos.y = 1.0 - vertPos.y;

    vec2 pos = (vertPos) * 2.0 - 1.0;

    gl_Position = vec4(pos, 0.0, 1.0);
}