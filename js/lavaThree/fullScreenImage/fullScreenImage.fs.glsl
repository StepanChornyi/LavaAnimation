uniform sampler2D imgTex;

varying vec2 vUv;

void main() {
    gl_FragColor = texture2D(imgTex, vUv);
}