import { Component, DisplayObject, Black } from 'black-engine';

import WEBGL_UTILS from '../WebGL/WebglUtils';
import ResizeActionComponent from '../libs/resize-action-component';
import Background from './Background/Background';
import Lava from './Lava/Lava';
import BitmapData from './Lava/BitmapData';
import { DATA_TEXTURE_SIZE } from './Lava/lavaConfig';

export default class Scene extends DisplayObject {
    constructor() {
        super();

        this.touchable = true;

        this.gl = null;
        this.canvas = null;
        this.lavaMesh = null;

        this.background = null;

        this.lastUpdateTime = performance.now();

        this._init();
    }

    _init() {
        const canvas = this.canvas = document.getElementById("canvas3D");
        const gl = this.gl = WEBGL_UTILS.getWebGlContext(canvas);

        this.viewMatrix = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);

        // console.log(canvas.background = 0x000000);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.colorMask(true, true, true, true);

        this.background = new Background(gl);

        const bitmapData =  new BitmapData(gl, DATA_TEXTURE_SIZE).initImageData();

        const count = 2;

        this.lavas = [];

        for (let i = 0; i < count; i++) {
            const lava = new Lava(gl, bitmapData);

            lava.mirrored = !i;
            lava.dataX = i * 2;
            lava.updateSizeAndTransform(true);

            this.lavas.push(lava);
        }
    }

    _updateViewMatrix() {
        this.viewMatrix[0] = 1 / this.gl.canvas.width;
        this.viewMatrix[4] = 1 / this.gl.canvas.height;
    }

    onAdded() {
        this.addComponent(new ResizeActionComponent(this.onResize, this));
    }

    onRender() {
        const gl = this.gl;

        // const dt = (- this.lastUpdateTime + (this.lastUpdateTime = performance.now())) * 0.06;//*0.06 same as 1/16.666666

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this._updateViewMatrix();

        this.background.render(this.viewMatrix);

        for (let i = 0; i < this.lavas.length; i++) {
            this.lavas[i].updateShapesData();
        }

        this.lavas[0].bitmapData.updateAndBindTexture();

        for (let i = 0; i < this.lavas.length; i++) {
            this.lavas[i].render(this.viewMatrix);
        }
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
    }
}