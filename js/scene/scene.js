import { Component, DisplayObject, Black } from 'black-engine';

import WEBGL_UTILS from '../WebGL/WebglUtils';
import ResizeActionComponent from '../libs/resize-action-component';
import Background from './Background/Background';
import Lava from './Lava/Lava';
import BitmapData from './Lava/BitmapData';
import { DATA_TEXTURE_SIZE } from './Lava/lavaConfig';

export default class Scene extends DisplayObject {
    constructor(canvasID = "canvas3D", ss = 1) {
        super();

        this.ss = ss;

        const c = document.createElement("canvas");


        c.style.position = "absolute";
        c.style.width = "100%";
        c.style.height = "100%";
        c.style.filter = "drop-shadow(0px 0px 30px #aa0128)"
        document.body.appendChild(c);

        c.width = window.innerWidth;
        c.height = window.innerHeight;

        this.ctx = c.getContext("2d");


        this.touchable = true;

        this.canvas = document.getElementById(canvasID);
        this.gl = WEBGL_UTILS.getWebGlContext(this.canvas);

        this.lavaMesh = null;

        this.background = null;

        this.lastUpdateTime = performance.now();

        this._init();
    }

    _init() {
        const gl = this.gl;

        this.viewMatrix = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);

        // console.log(canvas.background = 0x000000);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.colorMask(true, true, true, true);

        this.background = new Background(gl);

        const bitmapData = new BitmapData(gl, DATA_TEXTURE_SIZE).initImageData();

        const count = 2;

        this.lavas = [];

        for (let i = 0; i < count; i++) {
            const lava = new Lava(gl, bitmapData, this.ss);

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

        // this.background.render(this.viewMatrix);

        for (let i = 0; i < this.lavas.length; i++) {
            this.lavas[i].updateShapesData();
        }

        this.lavas[0].bitmapData.updateAndBindTexture();

        for (let i = 0; i < this.lavas.length; i++) {
            this.lavas[i].render(this.viewMatrix);
        }

        const ctx = this.ctx;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const grd = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);

        grd.addColorStop(0, "#570b32");
        grd.addColorStop(1, "#2b073a");

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        ctx.globalCompositeOperation = "destination-out";
        ctx.drawImage(this.canvas, 0, 0);
        ctx.globalCompositeOperation = "source-over";

    }

    onResize() {
        const scale = 1//0.25;
        const canvas = this.canvas;
        const gl = this.gl;

        canvas.width = window.innerWidth ;
        canvas.height = window.innerHeight ;

        canvas.style.width = `100%`;
        canvas.style.height = `100%`;

        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}