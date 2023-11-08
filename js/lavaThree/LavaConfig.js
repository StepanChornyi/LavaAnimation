import { Vector3 } from 'three/src/math/Vector3';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { BufferAttribute } from 'three/src/core/BufferAttribute';

export const K_FACTOR = 100;

export const setKFactor = (shader) => {
    return shader
        .replace(/K_FACTOR_IVS_HALF/g, (0.5 / K_FACTOR))
        .replace(/K_FACTOR_IVS/g, (1 / K_FACTOR))
        .replace(/K_FACTOR/g, K_FACTOR.toFixed(1))
}

export const intColorToArr = (color) => {
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;

    return [r / 255, g / 255, b / 255];
}

export const intColorToVec3 = (color) => {
    const [r, g, b] = intColorToArr(color);

    return new Vector3(r / 255, g / 255, b / 255);
}

export const basePlaneGeometry = new BufferGeometry();

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

basePlaneGeometry.setIndex(indices);
basePlaneGeometry.setAttribute('position', new BufferAttribute(vertices, 3));