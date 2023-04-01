import { Component, DisplayObject, Black, ColorHelper } from 'black-engine';

import WEBGL_UTILS from '../WebGL/WebglUtils';
import ResizeActionComponent from '../libs/resize-action-component';
import Background from './Background/Background';
import Lava from './Lava/Lava';
import BitmapData from './Lava/BitmapData';
import { DATA_TEXTURE_SIZE } from './Lava/lavaConfig';
import RenderTexture from '../WebGL/RenderTexture';
import SpriteGl from './SpriteGL/SpriteGl';
import SkipFilter from './Post/SkipFilter';

export default class Scene extends DisplayObject {
    constructor(container) {
        super();

        this.container = container;
        this.cachedWidth = null;
        this.cachedHeight = null;

        this.canvas = container.getElementsByTagName("canvas")[0];
        this.gl = WEBGL_UTILS.getWebGlContext(this.canvas);

        // this.renderTexture = new RenderTexture(this.gl);

        // this.renderTexture.setSize(window.innerWidth, window.innerHeight);

        // this.spriteGl = new SpriteGl(this.gl);
        // this.spriteGl.setColors(0x2b073a, 0x570b32, 0x570b32, 0x2b073a);

        // this.spriteGl.texture = this.renderTexture.texture;
        // this.spriteGl.setSize(this.renderTexture.width, this.renderTexture.height);


        // this.skipFilter = new SkipFilter(this.gl);

        // this.canvas.style.display = "none";

        // const c = document.createElement("canvas");

        // c.style.color = ColorHelper.hexColorToString(0xaa0128);

        // c.id = "glow";

        // container.appendChild(c);

        // this.ctx = c.getContext("2d");

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

        this.background = new Background(gl);

        this.lava = new Lava(gl);
    }

    onRender() {
        const gl = this.gl;

        if (this.isResizeNeeded())
            this.onResize();

        // const dt = (- this.lastUpdateTime + (this.lastUpdateTime = performance.now())) * 0.06;//*0.06 same as 1/16.666666


        // gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderTexture.frameBuffer);
        // gl.clearColor(0, 0, 0, 0);
        // gl.colorMask(true, true, true, true);
        // gl.viewport(0, 0, this.renderTexture.width, this.renderTexture.height);
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clearColor(0, 0, 0, 0);
        gl.colorMask(true, true, true, true);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        this.lava.render(this.viewMatrix);

        // this.skipFilter.render(this.viewMatrix, this.renderTexture.texture);


        // this.ctx.canvas.width = width;
        // this.ctx.canvas.height = height;

        // this.spriteGl.texture = this.renderTexture.texture;
        // this.spriteGl.render(this.viewMatrix);


        // const ctx = this.ctx;

        // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // const grd = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);

        // grd.addColorStop(0, "#570b32");
        // grd.addColorStop(1, "#2b073a");

        // ctx.fillStyle = grd;
        // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        // ctx.globalCompositeOperation = "destination-out";
        // ctx.drawImage(this.canvas, 0, 0);
        // ctx.globalCompositeOperation = "source-over";

        // this.ctx.canvas.style.filter = `drop-shadow(0px 0px 30px ${ColorHelper.hexColorToString(getColor(this.ctx.canvas, 'color'))})`;
        // this.canvas.style.filter = `drop-shadow(0px 0px 30px ${ColorHelper.hexColorToString(0xaa0128)})`;

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

        canvas.width = Math.ceil(this.cachedWidth * scale);
        canvas.height = Math.ceil(this.cachedHeight * scale);

        console.log(canvas.width,  canvas.height);

        gl.viewport(0, 0, canvas.width, canvas.height);

        this.lava.onResize(this.cachedWidth, this.cachedHeight, canvas.width, canvas.height);

        // this.spriteGl.setSize(width, height);
        // this.skipFilter.onResize(width, height);

        this._updateViewMatrix(this.cachedWidth, this.cachedHeight);
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
