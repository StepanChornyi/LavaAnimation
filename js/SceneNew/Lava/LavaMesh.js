import { Component, DisplayObject, Black, Vector, Rectangle, Matrix } from 'black-engine';

import WEBGL_UTILS from '../../scene/utils/webgl-utils';

import BaseRectMesh from '../BaseRectMesh/BaseRectMesh';

import vs from "./lava.vs.glsl";
import fs from "./lava.fs.glsl";

export default class LavaMesh extends BaseRectMesh {
    constructor(gl) {
        super(gl, WEBGL_UTILS.createProgram(gl, BaseRectMesh.vs, fs));

        // WEBGL_UTILS.createProgram()

        this.setSize(50 + 200 * Math.random());
        this.setColors(0x9d0000, 0xffff25, 0xcc0bcc, 0x1b1b7f)

        this.x = gl.canvas.width * Math.random();
        this.y = gl.canvas.height * Math.random();

        this.sx = (0.5 + Math.random() * 2) * (Math.random() < 0.5 ? -1 : 1);
        this.sy = (0.5 + Math.random() * 2) * (Math.random() < 0.5 ? -1 : 1);

        // this.transform.skew(2, 1);
    }

    updateUniforms(viewMatrix3x3) {
        super.updateUniforms(viewMatrix3x3);
    }

    render(viewMatrix3x3) {
        if (this.x + this.width > this.gl.canvas.width) {
            this.sx = Math.abs(this.sx) * -1;
        }

        if (this.x < 0) {
            this.sx = Math.abs(this.sx);
        }

        if (this.y + this.height > this.gl.canvas.height) {
            this.sy = Math.abs(this.sy) * -1;
        }

        if (this.y < 0) {
            this.sy = Math.abs(this.sy);
        }

        this.x += this.sx;
        this.y += this.sy;

        this.transform.setTranslation(this.x, this.y);

        super.render(viewMatrix3x3);
    }
}