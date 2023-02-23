import { Component, DisplayObject, Black } from 'black-engine';

import Camera from '../scene/camera';
import WEBGL_UTILS from '../scene/utils/webgl-utils';
import ResizeActionComponent from '../libs/resize-action-component';
import Background from './Background/Background';
import Lava from './Lava/Lava';

export default class SceneNew extends DisplayObject {
    constructor() {
        super();

        this.touchable = true;

        this.gl = null;
        this.canvas = null;
        this.camera = null;
        this.lavaMesh = null;

        this.background = null;

        this.lastUpdateTime = performance.now();

        this._init();
    }

    _init() {
        const canvas = this.canvas = document.getElementById("canvas3D");
        const gl = this.gl = WEBGL_UTILS.getWebGlContext(canvas);

        // console.log(canvas.background = 0x000000);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.colorMask(true, true, true, true);

        this.camera = new Camera(gl);
        this.background = new Background(gl);
        this.lava = new Lava(gl);
    }

    onAdded() {
        this.addComponent(new ResizeActionComponent(this.onResize, this));
    }

    onUpdate() {
        const camera = this.camera;
        const gl = this.gl;

        // const dt = (- this.lastUpdateTime + (this.lastUpdateTime = performance.now())) * 0.06;//*0.06 same as 1/16.666666

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.background.render(camera);
        this.lava.render(camera);
    }

    onResize() {
        const scale = 1//0.25;
        const canvas = this.canvas;
        const gl = this.gl;

        canvas.width = window.innerWidth * Black.device.pixelRatio * scale;
        canvas.height = window.innerHeight * Black.device.pixelRatio * scale;

        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        gl.viewport(0, 0, canvas.width, canvas.height);

        this.camera.aspect = canvas.width / canvas.height;
    }
}