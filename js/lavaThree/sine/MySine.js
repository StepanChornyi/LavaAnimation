import * as THREE from 'three';

import vertexShader from "./mySine.vs.glsl";
import fragmentShader from "./mySine.fs.glsl";
import { setConfigToMaterial, setKFactor } from '../fin/LavaConfig';
console.log(vertexShader);
// console.log(TransformControls);
export default class MySine extends THREE.Mesh {
    constructor(sineData) {

        const halfLength = 1250;
        const amplitude = 50;
        const thickness = 20;
        const frequency = 0.01;
        const phaseShift = 0;

        const material = new THREE.ShaderMaterial({
            vertexShader, fragmentShader: setKFactor(fragmentShader), uniforms: {
                textureSize: { value: new THREE.Vector2(10, 10) },
                sineData0: { value: new THREE.Vector4(1, 1, halfLength, amplitude) },
                sineData1: { value: new THREE.Vector4(thickness, frequency, phaseShift, 1) },
                channels: { value: new THREE.Vector4(1, 0, 0, 0) },
            },
        });

        super(createGeometry(), setConfigToMaterial(material))
    }

    setPosition(x, y) {
        this.material.uniforms.sineData0.value.x = x;
        this.material.uniforms.sineData0.value.y = y;
    }

    onResize(width, height) {
        this.material.uniforms.textureSize.value.set(width, height);
    }

    onUpdate(dt) {
        this.material.uniforms.sineData1.value.z += -100 * dt;
    }
}

function createGeometry() {
    const geometry = new THREE.BufferGeometry();

    const vertices = new Float32Array([
        -1.0, -1.0, 0,
        1.0, -1.0, 0,
        1.0, 1.0, 0,
        -1.0, 1.0, 0,
    ]);

    const indices = [
        0, 1, 2,
        2, 3, 0,
    ];

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    return geometry;
}