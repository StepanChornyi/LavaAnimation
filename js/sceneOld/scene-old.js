import { Component, DisplayObject, Black } from 'black-engine';

import Camera from './camera';
import WEBGL_UTILS from '../WebGL/WebglUtils';
import ResizeActionComponent from '../libs/resize-action-component';
import Background from './background';
import LavaMesh from './lava-mesh';

const canvas = document.getElementById("canvas3D");
const gl = WEBGL_UTILS.getWebGlContext(canvas);

// console.log(canvas.background = 0x000000);

gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export default class SceneOld extends DisplayObject {
  constructor() {
    super();

    this.touchable = true;

    this.camera = null;
    this.lavaMesh = null;

    this.background = null;

    this.lastUpdateTime = performance.now();

    this._init();
  }

  _init() {
    this.lavaMesh = new LavaMesh(gl, this);
    this.camera = new Camera(gl);
    this.background = new Background(gl);
  }

  onAdded() {
    this.addComponent(new ResizeActionComponent(this.onResize, this));

    setTimeout(() => {
      this.onResize();
      }, 100);
  }

  onUpdate() {
    const camera = this.camera;

    // const dt = (- this.lastUpdateTime + (this.lastUpdateTime = performance.now())) * 0.06;//*0.06 same as 1/16.666666

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.colorMask(true, true, true, true);

    this.background.render(camera);
    this.lavaMesh.render(camera);
  }

  onResize() {
    const scale = 1//0.25;

    canvas.width = window.innerWidth * Black.device.pixelRatio * scale;
    canvas.height = window.innerHeight * Black.device.pixelRatio * scale;

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    gl.viewport(0, 0, canvas.width, canvas.height);

    this.camera.aspect = canvas.width / canvas.height;

    const stageBounds = Black.stage.getBounds();

    this.x = stageBounds.left;
    this.y = stageBounds.top;
    this.scale = 1/Black.stage.scaleFactor;
  }
}