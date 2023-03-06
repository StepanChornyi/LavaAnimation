import { Component, DisplayObject, Black, Vector, Rectangle, Matrix, MathEx, ColorHelper } from 'black-engine';

import Rect from '../../Math/Shapes/Rect';
import Circle from '../../Math/Shapes/Circle';

import BitmapData from './BitmapData';
import { DATA_TEXTURE_SIZE } from './lavaConfig';

import LavaMesh from './LavaMesh/LavaMesh';

export default class Lava {
    constructor(gl) {
        this.gl = gl;

        const program = LavaMesh.createProgram(gl);

        this.lavaMesh = new LavaMesh(gl, program);

        this.transform = this.lavaMesh.transform;
        this.transformIvs = this.transform.clone().invert();

        this.bitmapData = new BitmapData(gl, DATA_TEXTURE_SIZE);

        this.rect = new Rect(0, 0, 100, 100);

        this.shapes = [this.rect, ...this._createCircles()];

        this._initMouseControl(this.rect);

        this.updateSizeAndTransform();
    }

    _initMouseControl(shape) {
        shape.vx = 0;
        shape.vy = 0;

        window.addEventListener('mousemove', e => {
            const { x, y } = this.transformIvs.transformVector(new Vector(e.clientX, e.clientY));

            shape.x = x - shape.width * 0.5;
            shape.y = y - shape.height * 0.5;
        });
    }

    _createCircles() {
        const COUNT = 5;
        const circles = [];

        for (let i = 0; circles.length < COUNT; i++) {
            const c =Math.random()<0.5? new Circle(0, 0, 50) :new Rect(0, 0, 100, 100);

            c.vx = rndBtw(1, 2) * rndSign();
            c.vy = rndBtw(1, 2) * rndSign()

            c.x = this.gl.canvas.height * Math.random();
            c.y = this.gl.canvas.height * Math.random();

            {//to arrange in columns
                const col = 30;

                const offset = this.lavaMesh.width / (col + 1)

                // c.x = (i % col) * offset + offset;
                // c.y = Math.floor(i / col) * offset + offset;
                // c.r = 50
            }

            circles.push(c);
        }

        return circles;
    }

    _updateMovement() {
        for (let i = 0; i < this.shapes.length; i++) {
            const s = this.shapes[i];

            if (isNaN(s.vx) || isNaN(s.vy))
                continue;

            if (s.right > this.lavaMesh.width)
                s.vx = Math.abs(s.vx) * -1;

            if (s.left < 0)
                s.vx = Math.abs(s.vx);

            if (s.bottom > this.lavaMesh.height)
                s.vy = Math.abs(s.vy) * -1;

            if (s.top < 0)
                s.vy = Math.abs(s.vy);

            s.x += s.vx;
            s.y += s.vy;
        }
    }

    updateShapesData() {
        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];

            if (shape.isCircle) {
                this.bitmapData.setCircle(this.shapes[i], 0, i);
            } else if (shape.isRect) {
                this.bitmapData.setRect(this.shapes[i], 0, i);
            }
        }
    }

    updateSizeAndTransform() {
        if (this.lavaMesh.width === window.innerHeight && this.lavaMesh.height === window.innerHeight)
            return;

        this.lavaMesh.setSize(window.innerHeight, window.innerHeight);

        this.transform.setTranslation(window.innerHeight, 0);
        this.transform.setRotation(-Math.PI * 0.5);

        this.transformIvs.copyFrom(this.transform).invert();

        this.lavaMesh.elementsCount = this.shapes.length;
    }

    render(viewMatrix3x3) {
        this._updateMovement();

        this.updateShapesData();

        this.updateSizeAndTransform();

        this.bitmapData.updateAndBindTexture();

        this.lavaMesh.render(viewMatrix3x3);
    }
}

function rndBtw(a, b) {
    return a + (b - a) * Math.random();
}

function rndSign() {
    return Math.random() < 0.5 ? -1 : 1;
}