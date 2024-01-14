import { DoubleSide } from 'three/src/constants';
import { Mesh } from 'three/src/objects/Mesh';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { BufferAttribute } from 'three/src/core/BufferAttribute';

import vertexShader from "./lava.vs.glsl";
import fragmentShader from "./lava.fs.glsl";
import { intColorToArr, setKFactor } from '../LavaConfig';

export default class LavaMesh extends Mesh {
    constructor(colors, groupTex0, groupTex1, groupTex2) {

        const material = new ShaderMaterial({
            vertexShader: setKFactor(vertexShader),
            fragmentShader: setKFactor(fragmentShader),
            uniforms: {
                groupTex0: { value: groupTex0 },
                groupTex1: { value: groupTex1 },
                groupTex2: { value: groupTex2 },

                text0FlipY: { value: groupTex0.flipY },
                text1FlipY: { value: groupTex1.flipY },
                text2FlipY: { value: groupTex2.flipY },
            },
        });

        material.transparent = true;
        material.alphaToCoverage = true;
        material.side = DoubleSide;

        super(createLavaGeometry(colors), material)
    }
}

function createLavaGeometry(colors) {
    const lavaPlaneGeometry = new BufferGeometry();

    const vertices = new Float32Array([
        -1, 1, 0,
        1, 1, 0,
        -1, 0, 0,
        1, 0, 0,
        -1, -1, 0,
        1, -1, 0
    ]);

    const indices = [
        0, 1, 2,
        1, 2, 3,
        2, 3, 4,
        3, 4, 5,
    ];

    const colorFill = new Float32Array([
        ...colors.edge,
        ...colors.edge,
        ...colors.center,
        ...colors.center,
        ...colors.edge,
        ...colors.edge,
    ]);

    const colorBg = new Float32Array([
        ...colors.glow,
        ...colors.glow,
        ...colors.glow,
        ...colors.glow,
        ...colors.glow,
        ...colors.glow,
    ]);


    lavaPlaneGeometry.setIndex(indices);

    lavaPlaneGeometry.setAttribute('position', new BufferAttribute(vertices, 3));
    lavaPlaneGeometry.setAttribute('colorFill', new BufferAttribute(colorFill, 3));
    lavaPlaneGeometry.setAttribute('colorGlow', new BufferAttribute(colorBg, 3));

    return lavaPlaneGeometry;
}