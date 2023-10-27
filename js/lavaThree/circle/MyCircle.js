import * as THREE from 'three';

import vertexShader from "./myCircle.vs.glsl";
import fragmentShader from "./myCircle.fs.glsl";
import { setKFactor } from '../fin/LavaConfig';

// console.log(TransformControls);
export default class MyCircle extends THREE.Mesh {
    constructor(circleData) {
        const material = new THREE.ShaderMaterial({
            vertexShader, fragmentShader: setKFactor(fragmentShader), uniforms: {
                textureSize: { value: new THREE.Vector2(10, 10) },
                circleData: { value: circleData },
                channels: { value: new THREE.Vector4(1, 0, 0, 0) },
            },
        });

        // material.alphaToCoverage = true;

        material.depthTest = false;
        material.blending = THREE.CustomBlending;
        material.blendEquation = THREE.MaxEquation;
        material.blendSrc = THREE.OneFactor;
        material.blendDst = THREE.OneFactor;

        super(createGeometry(), material)
    }

    setPosition(x, y) {
        this.material.uniforms.circleData.value.x = x;
        this.material.uniforms.circleData.value.y = y;
    }

    setRadius(r) {
        this.material.uniforms.circleData.value.z = r;
    }

    onResize(width, height) {
        this.material.uniforms.textureSize.value.set(width, height);
    }
}

function intColorToVec3(color) {
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;

    return new THREE.Vector3(r / 255, g / 255, b / 255);
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