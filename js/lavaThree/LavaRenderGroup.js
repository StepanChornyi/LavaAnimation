import { Scene } from 'three/src/scenes/Scene';
import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';

import { RENDER_CHANNELS } from './distanceFieldMeshes/DFMesh';

export default class LavaRenderGroup {
    constructor() {
        this.width = 10;
        this.height = 10;

        this.renderTarget = new WebGLRenderTarget(10, 10, { depthBuffer: false });
        this.scene = new Scene();
        this.channels = {
            [RENDER_CHANNELS.RED]: [],
            [RENDER_CHANNELS.GREEN]: [],
            [RENDER_CHANNELS.BLUE]: [],
            [RENDER_CHANNELS.ALPHA]: [],
        }

        this.channelsArr = [];

        for (const key in this.channels) {
            if (Object.hasOwnProperty.call(this.channels, key)) {
                this.channelsArr.push(this.channels[key]);
            }
        }
    }

    clear() {
        for (let i = 0; i < this.channelsArr.length; i++) {
            const meshes = this.channelsArr[i];

            for (let j = 0; j < meshes.length; j++) {
                this.scene.remove(meshes[j])

                meshes[j].material.dispose();
            }

            meshes.splice(0);
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
        this.width = width;
        this.height = height;

        this.renderTarget.setSize(width, height);

        for (let i = 0; i < this.scene.children.length; i++) {
            this.scene.children[i].onResize(width, height);
        }
    }

    get texture() {
        return this.renderTarget.texture;
    }
}