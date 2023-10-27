import * as THREE from 'three';

import vertexShader from "./lava.vs.glsl";
import fragmentShader from "./lava.fs.glsl";
import { basePlaneGeometry, setKFactor } from '../LavaConfig';

export default class LavaMesh extends THREE.Mesh {
    constructor(groupTex0, groupTex1) {
        const material = new THREE.ShaderMaterial({
            vertexShader: setKFactor(vertexShader),
            fragmentShader: setKFactor(fragmentShader),
            uniforms: {
                groupTex0: { value: groupTex0 },
                // group1: { value: groupTex1 }
            },
        });

        material.alphaToCoverage = true;

        super(basePlaneGeometry, material)
    }
}