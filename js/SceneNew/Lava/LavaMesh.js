import { Component, DisplayObject, Black, Vector, Rectangle, Matrix, Circle, MathEx, ColorHelper } from 'black-engine';

import WEBGL_UTILS from '../../scene/utils/webgl-utils';

import BaseRectMesh from '../BaseRectMesh/BaseRectMesh';

import vs from "./lava.vs.glsl";
import fs from "./lava.fs.glsl";

const INT_SCALE = 5;
const INT_SCALE_IVS = 1 / INT_SCALE;

export default class LavaMesh extends BaseRectMesh {
    constructor(gl) {
        super(gl, WEBGL_UTILS.createProgram(gl, vs, fs));

        this.setSize(gl.canvas.width, gl.canvas.height);
        this.setColors(0x9d0000, 0xffff25, 0xcc0bcc, 0x1b1b7f)

        this.circle2 = new Circle(gl.canvas.width * 0.5 + 150, gl.canvas.height * 0.5, 100);

        this.circles = [this.circle2];

        for (let i = 0; this.circles.length < 128; i++) {
            const c = new Circle(gl.canvas.width * Math.random(), gl.canvas.height * Math.random(),0);

            c.sx = (0.5 + Math.random() * 2) * (Math.random() < 0.5 ? -1 : 1);
            c.sy = (0.5 + Math.random() * 2) * (Math.random() < 0.5 ? -1 : 1);

            const col = 30;

            c.x = (i % col) * 50 + 50
            c.y = Math.floor(i / col) * 50 + 50
            c.r = 1

            this.circles.push(c);
        }

        const canvas = document.createElement('canvas');

        canvas.style.position = "absolute";
        canvas.style.imageRendering = "pixelated";
        canvas.style.width = "500px";

        canvas.width = 128;
        canvas.height = 128;

        const ctx = this._ctx = canvas.getContext("2d");
        const imgData = this._imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        document.body.appendChild(canvas)

        const texture = this._texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx.canvas);
        gl.bindTexture(gl.TEXTURE_2D, null);

        window.addEventListener('mousemove', e => {
            this.circle2.x = e.clientX;
            this.circle2.y = e.clientY;
        })

        // this.transform.skew(2, 1);
    }

    setPixel(x, y, r, g, b, a) {
        const i = (x + this._imgData.width * y) * 4;

        this._imgData.data[i] = r;
        this._imgData.data[i + 1] = g;
        this._imgData.data[i + 2] = b;
        this._imgData.data[i + 3] = a;
    }

    setCircle(circle, h) {
        const x = Math.round(circle.x * INT_SCALE);
        const y = Math.round(circle.y * INT_SCALE);
        const r = Math.round(circle.r);

        const xR = (x) & 0xff;
        const xG = (x >> 8) & 0xff;
        const yR = (y) & 0xff;
        const yG = (y >> 8) & 0xff;
        const rB = (r) & 0xff;

        // console.log(Math.round((circle.x)), r, g, r + g * 255);

        this.setPixel(0, h, xR, xG, rB, 255);
        this.setPixel(1, h, yR, yG, 0, 255);
    }

    _updateMovement() {
        for (let i = 0; i < this.circles.length; i++) {
            const c = this.circles[i];

            if (c === this.circle2)
                continue;

            if (c.x + c.r > this.width) {
                c.sx = Math.abs(c.sx) * -1;
            }

            if (c.x < c.r) {
                c.sx = Math.abs(c.sx);
            }

            if (c.y + c.r > this.height) {
                c.sy = Math.abs(c.sy) * -1;
            }

            if (c.y < c.r) {
                c.sy = Math.abs(c.sy);
            }

            c.x += c.sx;
            c.y += c.sy;
        }
    }

    setUniforms(viewMatrix3x3) {
        super.setUniforms(viewMatrix3x3);

        // this._updateMovement();

        for (let i = 0; i < this.circles.length; i++) {
            this.setCircle(this.circles[i], i);
        }

        this._ctx.putImageData(this._imgData, 0, 0);

        const gl = this.gl;

        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._ctx.canvas);
        gl.activeTexture(gl.TEXTURE0);

        const sizeUniformPos = this.gl.getUniformLocation(this.program, `sizeIvs`);

        this.gl.uniform3f(sizeUniformPos,
            1 / this._ctx.canvas.width,
            1 / this._ctx.canvas.height,
            INT_SCALE_IVS
        );

        const circlesCount = this.gl.getUniformLocation(this.program, `circlesCount`);

        this.gl.uniform1i(circlesCount, this.circles.length);
    }

    render(viewMatrix3x3) {
        if (this.gl.canvas.width !== this.width || this.gl.canvas.height !== this.height)
            this.setSize(this.gl.canvas.width, this.gl.canvas.height);

        super.render(viewMatrix3x3);
    }
}