import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { Scene } from 'three/src/scenes/Scene';
import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';
import { Mesh } from 'three/src/objects/Mesh';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { DoubleSide } from 'three/src/constants';
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry';


import LavaMesh from './lavaMesh/LavaMesh';
import { LavaController } from './animationController/LavaController';
import { basePlaneGeometry, intColorToArr } from './LavaConfig';
import { LavaParallaxController } from './animationController/LavaParallaxController';
import * as THREE from 'three';
import FullScreenImage from './fullScreenImage/FullScreenImage';

function setColor(element, prop, color) {
    element.style[prop] = intToRGBA(color)
}

function getColor(element, prop) {
    const color = element.style[prop];

    if (!color || color.indexOf("rgb(") === -1)
        return 0x000000;

    const [r, g, b] = color.split("rgb(")[1].split(")")[0].split(", ").map((v) => +v);

    const hex = r << 16 | g << 8 | b;

    return hex;
}

function intToRGBA(color, alpha = 1) {
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}



export class LavaThree {
    constructor(canvas) {
        setColor(canvas, "color", 0xfed5b7);


        this.renderer = new WebGLRenderer({ canvas, antialias: true });
        this.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
        const scene = this.scene = new Scene();

        this.renderTarget = new WebGLRenderTarget(10, 10, { depthBuffer: false });

        scene.add(new FullScreenImage(this.renderTarget.texture));

        this.lavaScene = new Scene();
        this.lavaControllers = [];

        this.initLavaControllers();
    }

    initLavaControllers() {
        const { lavaScene } = this;

        const lavaController1 = new LavaParallaxController({
            amplitudeFactor: 1,
            frequencyFactor: 1,
            parallaxFactor: 1,
            offsetY: 0,
            bubbleOffsetX: 100,
            bubbleScale: 3,
            bubbleHeightFactor: 1.2
        });

        const lavaMesh1 = new LavaMesh({
            edge: intColorToArr(0x330f33),
            center: intColorToArr(0x570236),
            glow: intColorToArr(0xfd5238),
        }, ...lavaController1.textures);

        const lavaController2 = new LavaParallaxController({
            amplitudeFactor: 1,
            frequencyFactor: 0.6,
            parallaxFactor: 0.4,
            offsetY: 100,
            bubbleOffsetX: 50,
            bubbleScale: 2,
            bubbleHeightFactor: 1
        });

        const lavaMesh2 = new LavaMesh({
            edge: intColorToArr(0x8b0136),
            center: intColorToArr(0xda343e),
            glow: intColorToArr(0xfed5b7),
        }, ...lavaController2.textures);

        const lavaController3 = new LavaParallaxController({
            amplitudeFactor: 1,
            frequencyFactor: 0.3,
            parallaxFactor: 0.2,
            offsetY: 200,
            bubbleOffsetX: 20,
            bubbleScale: 0.5,
            bubbleHeightFactor: 0.6
        });

        const lavaMesh3 = new LavaMesh({
            edge: intColorToArr(0xfd5238),
            center: intColorToArr(0xfe763a),
            glow: intColorToArr(0xfed5b7),
        }, ...lavaController3.textures);

        lavaMesh1.renderOrder = 0;
        lavaMesh2.renderOrder = -1;
        lavaMesh3.renderOrder = -2;

        this.lavaControllers.push(lavaController1, lavaController2, lavaController3);
        lavaScene.add(lavaMesh1, lavaMesh2, lavaMesh3);
    }

    update(dt) {
        for (let i = 0; i < this.lavaControllers.length; i++)
            this.lavaControllers[i].onUpdate(dt);
    }

    render() {
        const { renderer, camera, scene } = this;

        for (let i = 0; i < this.lavaControllers.length; i++)
            this.lavaControllers[i].render(renderer, camera);

        renderer.setClearColor(getColor(this.renderer.domElement, 'color'), 1)
        renderer.setRenderTarget(this.renderTarget);
        renderer.render(this.lavaScene, camera);

        renderer.setClearColor(0x303030, 1)
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
    }

    resize(width, height) {
        const { renderer, camera } = this;

        renderer.setSize(width, height);

        this.renderTarget.setSize(width, height);

        camera.aspect = window.innerWidth / window.innerHeight;

        camera.updateProjectionMatrix();

        for (let i = 0; i < this.lavaControllers.length; i++)
            this.lavaControllers[i].onResize(width, height);
    }
}