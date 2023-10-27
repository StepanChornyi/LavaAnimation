import * as THREE from 'three';

import vertexShader from "./fin.vs.glsl";
import fragmentShader from "./fin.fs.glsl";
import { setKFactor } from './LavaConfig';

// console.log(TransformControls);
export default class Fin extends THREE.Mesh {
    constructor(depth0, depth1, cameraNear, cameraFar) {
        const material = new THREE.ShaderMaterial({
            vertexShader: setKFactor(vertexShader),
            fragmentShader: setKFactor(fragmentShader),
            uniforms: {
                depth0: { value: depth0 },
                depth1: { value: depth1 },
                cameraNear: { value: cameraNear },
                cameraFar: { value: cameraFar },
            },
        });

        material.alphaToCoverage = true;

        super(createGeometry(), material)
    }

    // onResize(width, height) {
    //     this.material.uniforms.textureSize.value.set(width, height);
    // }
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