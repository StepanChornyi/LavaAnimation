import { Component, DisplayObject, Black, ColorHelper } from 'black-engine';

import WEBGL_UTILS from '../WebGL/WebglUtils';
import Background from '../scene/Background/Background';
import Lava from './Lava';

export default class Scene extends DisplayObject {
    constructor(container) {
        super();

        this.container = container;
        this.cachedWidth = null;
        this.cachedHeight = null;

        this.canvas = container.getElementsByTagName("canvas")[0];
        this.gl = WEBGL_UTILS.getWebGlContext(this.canvas);

        this.touchable = true;

        this.lavaMesh = null;

        this.background = null;

        this.lastUpdateTime = performance.now();

        this._init();
    }

    _init() {
        const gl = this.gl;

        this.viewMatrix = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);

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

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clearColor(0, 0, 0, 0);
        gl.colorMask(true, true, true, true);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.lava.render(this.viewMatrix);
    }

    onResize() {
        const container = this.container;
        const canvas = this.canvas;
        const scale = 1;

        const sceneWidth = this.cachedWidth = container.offsetWidth;
        const sceneHeight = this.cachedHeight = container.offsetHeight;

        canvas.width = Math.ceil(sceneWidth * scale);
        canvas.height = Math.ceil(sceneHeight * scale);

        this._updateViewMatrix(sceneWidth, sceneHeight);

        this.lava.onResize(sceneWidth, sceneHeight);
    }

    isResizeNeeded() {
        return this.container.offsetWidth !== this.cachedWidth || this.container.offsetHeight !== this.cachedHeight;
    }

    _updateViewMatrix(width, height) {
        this.viewMatrix[0] = 1 / width;
        this.viewMatrix[4] = 1 / height;
    }
}