import { CustomBlending, MaxEquation, OneFactor } from 'three/src/constants';
import { Vector4 } from 'three/src/math/Vector4';
import { Mesh } from 'three/src/objects/Mesh';

import { basePlaneGeometry } from '../LavaConfig';

export default class DFMesh extends Mesh {
    constructor(material) {
        super(basePlaneGeometry, material);

        material.depthTest = false;
        material.blending = CustomBlending;
        material.blendEquation = MaxEquation;
        material.blendSrc = OneFactor;
        material.blendDst = OneFactor;
    }

    setRenderChannel(renderChannel) {
        this.material.uniforms.channels.value.copy(RENDER_CHANNELS_VECTORS[renderChannel]);
    }

    onResize(width, height) {
        this.material.uniforms.screenSize.value.set(width, height);
    }

    onUpdate(){
        
    }
}

export const RENDER_CHANNELS = {
    RED: "RED",
    GREEN: "GREEN",
    BLUE: "BLUE",
    ALPHA: "ALPHA",
}

const RENDER_CHANNELS_VECTORS = {
    [RENDER_CHANNELS.RED]: new Vector4(1, 0, 0, 0),
    [RENDER_CHANNELS.GREEN]: new Vector4(0, 1, 0, 0),
    [RENDER_CHANNELS.BLUE]: new Vector4(0, 0, 1, 0),
    [RENDER_CHANNELS.ALPHA]: new Vector4(0, 0, 0, 1),
};