import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { Scene } from 'three/src/scenes/Scene';

import LavaMesh from './lavaMesh/LavaMesh';
import { LavaController } from './LavaController';

export class LavaThree {
    constructor(canvas) {
        this.renderer = new WebGLRenderer({ canvas, antialias: true });
        this.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);

        const lavaController = this.lavaController = new LavaController();

        const scene = this.scene = new Scene();

        scene.add(new LavaMesh(...lavaController.textures));
    }

    update(dt) {
        this.lavaController.onUpdate(dt);
    }

    render() {
        const { renderer, camera, scene } = this;

        this.lavaController.render(renderer, camera);

        renderer.setClearColor(0x303030, 1)
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
    }

    resize(width, height) {
        const { renderer, camera } = this;

        renderer.setSize(width, height);

        camera.aspect = window.innerWidth / window.innerHeight;

        camera.updateProjectionMatrix();

        this.lavaController.onResize(width, height);
    }
}