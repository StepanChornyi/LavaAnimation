import { Component, DisplayObject, Black, ColorHelper } from 'black-engine';

import WEBGL_UTILS from '../WebGL/WebglUtils';
import ResizeActionComponent from '../libs/resize-action-component';
import Background from './Background/Background';
import Lava from './Lava/Lava';
import BitmapData from './Lava/BitmapData';
import { DATA_TEXTURE_SIZE } from './Lava/lavaConfig';

export default class Scene extends DisplayObject {
    constructor(container, ss = 1) {
        super();

        this.container = container;
        this.cachedWidth = null;
        this.cachedHeight = null;

        this.canvas = container.getElementsByTagName("canvas")[0];
        this.gl = WEBGL_UTILS.getWebGlContext(this.canvas);

        this.ss = ss;

        this.canvas.style.display = "none";

        const c = document.createElement("canvas");

        c.style.color = ColorHelper.hexColorToString(0xaa0128);

        c.id = "glow";

        container.appendChild(c);

        this.ctx = c.getContext("2d");

        this.touchable = true;

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

        // this.background = new Background(gl);

        const bitmapData = new BitmapData(gl, DATA_TEXTURE_SIZE).initImageData();

        const count = 2;

        this.lavas = [];

        for (let i = 0; i < count; i++) {
            const lava = new Lava(gl, bitmapData, this.container);

            lava.mirrored = !i;
            lava.dataX = i * 2;
            // lava.updateSizeAndTransform(true);

            this.lavas.push(lava);
        }
    }

    onRender() {
        const gl = this.gl;

        if (this.isResizeNeeded())
            this.onResize();

        // const dt = (- this.lastUpdateTime + (this.lastUpdateTime = performance.now())) * 0.06;//*0.06 same as 1/16.666666

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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

        this.ctx.canvas.style.filter = `drop-shadow(0px 0px 30px ${ColorHelper.hexColorToString(getColor(this.ctx.canvas, 'color'))})`;
    }

    isResizeNeeded() {
        return this.container.offsetWidth !== this.cachedWidth || this.container.offsetHeight !== this.cachedHeight;
    }

    onResize() {
        const scale = 1;
        const container = this.container;
        const canvas = this.canvas;
        const gl = this.gl;

        this.cachedWidth = container.offsetWidth;
        this.cachedHeight = container.offsetHeight;

        const width = this.cachedWidth * scale;
        const height = this.cachedHeight * scale;

        canvas.width = width;
        canvas.height = height;

        this.ctx.canvas.width = width;
        this.ctx.canvas.height = height;

        gl.viewport(0, 0, width, height);

        for (let i = 0; i < this.lavas.length; i++) {
            this.lavas[i].onResize(width, height, scale);
        }

        this._updateViewMatrix(width, height);
    }

    _updateViewMatrix(width, height) {
        this.viewMatrix[0] = 1 / width;
        this.viewMatrix[4] = 1 / height;
    }
}

function getColor(element, prop) {
    const color = element.style[prop];

    if (!color || color.indexOf("rgb(") === -1)
        return 0x000000;

    const [r, g, b] = color.split("rgb(")[1].split(")")[0].split(", ").map((v) => +v);

    const hex = r << 16 | g << 8 | b;

    return hex;
}
