uniform vec2 screenSize;
uniform vec3 dimensions;

varying vec2 fragPos;
varying vec2 vUv;

void main() {
    vec2 vertOffset = position.xy * vec2(1.0, -1.0) * (dimensions.z + K_FACTOR);

    fragPos = dimensions.xy + vertOffset;

    vec2 vertPos = fragPos / screenSize.xy;

    vertPos.y = 1.0 - vertPos.y;

    vec2 pos = (vertPos) * 2.0 - 1.0;

    gl_Position = vec4(pos, 0.0, 1.0);
}