import * as THREE from 'three';
import { basePlaneGeometry } from '../LavaConfig';

export default class DFMesh extends THREE.Mesh {
    constructor(material) {
        super(basePlaneGeometry, material);

        material.depthTest = false;
        material.blending = THREE.CustomBlending;
        material.blendEquation = THREE.MaxEquation;
        material.blendSrc = THREE.OneFactor;
        material.blendDst = THREE.OneFactor;
    }

    setRenderChannel(renderChannel) {
        this.material.uniforms.channels.value.copy(RENDER_CHANNELS_VECTORS[renderChannel]);
    }

    onResize(width, height) {
        this.material.uniforms.screenSize.value.set(width, height);
    }
}

export const RENDER_CHANNELS = {
    RED: "RED",
    GREEN: "GREEN",
    BLUE: "BLUE",
    ALPHA: "ALPHA",
}

const RENDER_CHANNELS_VECTORS = {
    [RENDER_CHANNELS.RED]: new THREE.Vector4(1, 0, 0, 0),
    [RENDER_CHANNELS.GREEN]: new THREE.Vector4(0, 1, 0, 0),
    [RENDER_CHANNELS.BLUE]: new THREE.Vector4(0, 0, 1, 0),
    [RENDER_CHANNELS.ALPHA]: new THREE.Vector4(0, 0, 0, 1),
};