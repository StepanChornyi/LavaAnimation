import { DoubleSide } from 'three/src/constants';
import { Mesh } from 'three/src/objects/Mesh';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { BufferAttribute } from 'three/src/core/BufferAttribute';

import vertexShader from "./fullScreenImage.vs.glsl";
import fragmentShader from "./fullScreenImage.fs.glsl";
import { basePlaneGeometry, intColorToArr, setKFactor } from '../LavaConfig';

export default class FullScreenImage extends Mesh {
    constructor(texture) {

        const material = new ShaderMaterial({
            vertexShader: setKFactor(vertexShader),
            fragmentShader: setKFactor(fragmentShader),
            uniforms: {
                imgTex: { value: texture }
            },
        });

        material.alphaToCoverage = true;
        material.side = DoubleSide;

        super(basePlaneGeometry, material)
    }
}