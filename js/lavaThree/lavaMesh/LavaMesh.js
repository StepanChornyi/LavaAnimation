import { DoubleSide } from 'three/src/constants';
import { Mesh } from 'three/src/objects/Mesh';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { BufferAttribute } from 'three/src/core/BufferAttribute';

import vertexShader from "./lava.vs.glsl";
import fragmentShader from "./lava.fs.glsl";
import { intColorToArr, setKFactor } from '../LavaConfig';

export default class LavaMesh extends Mesh {
    constructor(groupTex0, groupTex1) {

        const material = new ShaderMaterial({
            vertexShader: setKFactor(vertexShader),
            fragmentShader: setKFactor(fragmentShader),
            uniforms: {
                groupTex0: { value: groupTex0 },
                groupTex1: { value: groupTex1 }
            },
        });

        material.alphaToCoverage = true;
        material.side = DoubleSide;

        super(lavaPlaneGeometry, material)
    }
}

const colorCenterTop = intColorToArr(0xff1f00);;
const colorCenterBot = intColorToArr(0x8717d1);;
const colorSideBot = intColorToArr(0x2b17d1);
const colorSideTop = intColorToArr(0xd100ff);

const bgTopColor = intColorToArr(0x5b0434);
const bgBotColor = intColorToArr(0x1b0d66);

export const lavaPlaneGeometry = new BufferGeometry();

const vertices = new Float32Array([
    -1, 1, 0,
    0, 1, 0,
    1, 1, 0,
    1, -1, 0,
    0, -1, 0,
    -1, -1, 0,
]);

const colorFill = new Float32Array([
    ...colorSideTop,
    ...colorCenterTop,
    ...colorSideTop,
    ...colorSideBot,
    ...colorCenterBot,
    ...colorSideBot,
]);

const colorBg = new Float32Array([
    ...bgTopColor,
    ...bgTopColor,
    ...bgTopColor,
    ...bgBotColor,
    ...bgBotColor,
    ...bgBotColor,
]);

const indices = [
    0, 1, 4,
    0, 4, 5,
    1, 2, 3,
    1, 3, 4,
];

lavaPlaneGeometry.setIndex(indices);

lavaPlaneGeometry.setAttribute('position', new BufferAttribute(vertices, 3));
lavaPlaneGeometry.setAttribute('colorFill', new BufferAttribute(colorFill, 3));
lavaPlaneGeometry.setAttribute('colorBg', new BufferAttribute(colorBg, 3));