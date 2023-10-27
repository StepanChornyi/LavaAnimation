import * as THREE from 'three';
import CircleDFMesh from './distanceFieldMeshes/circleDFMesh/CircleDFMesh';
import SineDFMesh from './distanceFieldMeshes/sineDFMesh/SineDFMesh';
import { RENDER_CHANNELS } from './distanceFieldMeshes/DFMesh';
import RectDFMesh from './distanceFieldMeshes/rectDFMesh/RectDFMesh';

export class LavaController {
    constructor() {
        const sineGroup = new LavaRenderGroup();

        this._renderGroups = [sineGroup];

        const leftSine0 = this.leftSine0 = new SineDFMesh();
        const leftSine1 = this.leftSine1 = new SineDFMesh();
        const leftSine2 = this.leftSine2 = new SineDFMesh();

        const rightSine0 = this.rightSine0 = new SineDFMesh();
        const rightSine1 = this.rightSine1 = new SineDFMesh();
        const rightSine2 = this.rightSine2 = new SineDFMesh();


        sineGroup.add(leftSine0, RENDER_CHANNELS.RED);
        sineGroup.add(leftSine1, RENDER_CHANNELS.ALPHA);
        sineGroup.add(leftSine2, RENDER_CHANNELS.BLUE);

        sineGroup.add(rightSine0, RENDER_CHANNELS.RED);
        sineGroup.add(rightSine1, RENDER_CHANNELS.ALPHA);
        sineGroup.add(rightSine2, RENDER_CHANNELS.BLUE);

        leftSine0.frequency = 0.01
        leftSine1.frequency = 0.02
        leftSine2.frequency = 0.005


        // console.log(sineGroup);

        // {
        //     const myc = new CircleDFMesh();

        //     myc.x = 300;
        //     myc.y = 400;
        //     myc.radius = 50;

        //     sineGroup.add(myc, RENDER_CHANNELS.RED);
        // }

        // {
        //     const myc = new CircleDFMesh();

        //     myc.x = 300;
        //     myc.y = 300;
        //     myc.radius = 50;

        //     sineGroup.add(myc, RENDER_CHANNELS.BLUE);
        // }


        const mouseCircle = this.mouseCircle = new RectDFMesh();

        mouseCircle.width = 500;
        mouseCircle.height = 300;
        mouseCircle.radius = -5;

        sineGroup.add(mouseCircle, RENDER_CHANNELS.GREEN);

        window.addEventListener("mousemove", (evt) => {
            mouseCircle.x = evt.clientX;
            mouseCircle.y = evt.clientY;
        })
    }

    onUpdate(dt) {
        // this.myc2.phaseShift += -100 * dt;
        const { leftSine0, leftSine1, leftSine2 } = this;
        const { rightSine0, rightSine1, rightSine2 } = this;

        leftSine0.phaseShift += -100 * dt;
        leftSine1.phaseShift += 50 * dt;
        leftSine2.phaseShift += -10 * dt;

        rightSine0.phaseShift += -100 * dt;
        rightSine1.phaseShift += 50 * dt;
        rightSine2.phaseShift += -10 * dt;
    }

    onResize(width, height) {
        for (let i = 0; i < this._renderGroups.length; i++) {
            this._renderGroups[i].onResize(width, height);
        }

        const { leftSine0, leftSine1, leftSine2 } = this;
        const { rightSine0, rightSine1, rightSine2 } = this;

        leftSine0.x = leftSine1.x = leftSine2.x = 100;
        leftSine0.y = leftSine1.y = leftSine2.y = height * 0.5;
        leftSine0.halfLength = leftSine1.halfLength = leftSine2.halfLength = height * 0.5;
        leftSine0.angle = leftSine1.angle = leftSine2.angle = Math.PI * 0.5;

        rightSine0.x = rightSine1.x = rightSine2.x = width - 100;
        rightSine0.y = rightSine1.y = rightSine2.y = height * 0.5;
        rightSine0.halfLength = rightSine1.halfLength = rightSine2.halfLength = height * 0.5;
        rightSine0.angle = rightSine1.angle = rightSine2.angle = Math.PI * 0.5;
        rightSine0.scaleY = rightSine1.scaleY = rightSine2.scaleY = -1;
    }

    render(renderer, camera) {
        for (let i = 0; i < this._renderGroups.length; i++) {
            const { scene, renderTarget } = this._renderGroups[i];

            renderer.setClearColor(0x000000, 0)
            renderer.setRenderTarget(renderTarget);
            renderer.render(scene, camera);
        }
    }

    get textures() {
        const textures = [];

        for (let i = 0; i < this._renderGroups.length; i++) {
            textures.push(this._renderGroups[i].texture);
        }

        return textures;
    }
}

class LavaRenderGroup {
    constructor() {
        this.renderTarget = new THREE.WebGLRenderTarget(10, 10, { depthBuffer: false });
        this.scene = new THREE.Scene();
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
    }

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