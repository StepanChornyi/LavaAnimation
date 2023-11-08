import { Scene } from 'three/src/scenes/Scene';
import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';

import { RENDER_CHANNELS } from './distanceFieldMeshes/DFMesh';

export default class LavaRenderGroup {
    constructor() {
        this.renderTarget = new WebGLRenderTarget(10, 10, { depthBuffer: false });
        this.scene = new Scene();
        this.channels = {
            [RENDER_CHANNELS.RED]: [],
            [RENDER_CHANNELS.GREEN]: [],
            [RENDER_CHANNELS.BLUE]: [],
            [RENDER_CHANNELS.ALPHA]: [],
        }
    }

    add(dfMesh, channel = RENDER_CHANNELS.RED) {
        dfMesh.setRenderChannel(channel);

        this.channels[channel].push(dfMesh);

        this.scene.add(dfMesh);

        return dfMesh;
    }

    onUpdate(dt) { }

    onResize(width, height) {
        this.renderTarget.setSize(width, height);

        for (let i = 0; i < this.scene.children.length; i++) {
            this.scene.children[i].onResize(width, height);
        }
    }

    get texture() {
        return this.renderTarget.texture;
    }
}