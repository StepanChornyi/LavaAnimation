import { Component, DisplayObject, Black, Vector, Rectangle, Matrix, Circle, MathEx, ColorHelper } from 'black-engine';

import WEBGL_UTILS from '../../scene/utils/webgl-utils';

import BitmapData from './BitmapData';
import { DATA_TEXTURE_SIZE } from './lavaConfig';

import LavaMesh from './LavaMesh';

export default class Lava {
    constructor(gl) {
        this.gl = gl;

        const program = LavaMesh.createProgram(gl);

        this._initTexture(gl);

        this.lavaMesh = new LavaMesh(gl, program);

        this.bitmapData = new BitmapData(DATA_TEXTURE_SIZE);

        this.circles = this._createCircles();

        this.lavaMesh.elementsCount = this.circles.length;
        
        this.mouseControlledCircle = this.circles[0];
        this.mouseControlledCircle.r = 100;
        this.mouseControlledCircle.vx = 0;
        this.mouseControlledCircle.vy = 0;

        window.addEventListener('mousemove', e => {
            this.mouseControlledCircle.x = e.clientX;
            this.mouseControlledCircle.y = e.clientY;
        })

        // this.transform.skew(2, 1);
    }

    _createCircles() {
        const COUNT = 32;
        const circles = [];

        for (let i = 0; circles.length < COUNT; i++) {
            const c = new Circle(0, 0, 50);

            c.vx = (0.05 + Math.random() * 0.2) * (Math.random() < 0.5 ? -1 : 1);
            c.vy = (0.05 + Math.random() * 0.2) * (Math.random() < 0.5 ? -1 : 1);


            c.x = this.gl.canvas.width * Math.random();
            c.y = this.gl.canvas.height * Math.random();

            {//to arrange in columns
                const col = 30;

                c.x = (i % col) * 50 + 50;
                c.y = Math.floor(i / col) * 50 + 50;
                c.r = 1
            }

            circles.push(c);
        }

        return circles;
    }

    _initTexture(gl) {
        const texture = this._texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    _updateMovement() {
        for (let i = 0; i < this.circles.length; i++) {
            const c = this.circles[i];

            if (c.x + c.r > window.innerWidth) {
                c.vx = Math.abs(c.vx) * -1;
            }

            if (c.x < c.r) {
                c.vx = Math.abs(c.vx);
            }

            if (c.y + c.r > window.innerHeight) {
                c.vy = Math.abs(c.vy) * -1;
            }

            if (c.y < c.r) {
                c.vy = Math.abs(c.vy);
            }

            c.x += c.vx;
            c.y += c.vy;
        }
    }

    updateCirclesData() {
        for (let i = 0; i < this.circles.length; i++) {
            this.bitmapData.setCircle(this.circles[i], 0, i);
        }

        this.bitmapData.putImageData();

        const gl = this.gl;

        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.bitmapData.canvas);
        gl.activeTexture(gl.TEXTURE0);
    }

    render(viewMatrix3x3) {
        this._updateMovement();

        this.updateCirclesData();

        this.lavaMesh.render(viewMatrix3x3);
    }
}