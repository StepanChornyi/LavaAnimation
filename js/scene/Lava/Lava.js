import { Component, DisplayObject, Black, Vector, Rectangle, Matrix, MathEx, ColorHelper } from 'black-engine';

import Rect from '../../Math/Shapes/Rect';
import Circle from '../../Math/Shapes/Circle';

import BitmapData from './BitmapData';
import { DATA_TEXTURE_SIZE } from './lavaConfig';

import LavaMesh from './LavaMesh/LavaMesh';
import ShapesController from './ShapesController';
import { TEXTURE_DEBUG } from '../../animationConfig';

const PRERENDER_SCALE = 0.25

export default class Lava {
    constructor(gl, bitmapData, ss) {
        this.gl = gl;

        this._dataX = 0;

        const program = LavaMesh.createProgram(gl);

        this.lavaMesh = new LavaMesh(gl, program);

        this.shapesController = new ShapesController(ss);

        this.optimizationTexture = new BitmapData(gl, Math.round(window.innerWidth * PRERENDER_SCALE), Math.round(window.innerHeight * PRERENDER_SCALE));

        this.canvas = this.optimizationTexture.canvas;

        this.ctx = this.canvas.getContext("2d");

        if(TEXTURE_DEBUG){
            this.canvas.style.position = "absolute";
            this.canvas.style.opacity = "0";
            this.canvas.style.width = "100%";
            this.canvas.style.height = "100%";
            document.body.appendChild(this.canvas);
        }

        this.lavaMesh.setColors(0xe33345, 0xe33345, 0xf0851a, 0xf0851a);

        this.transform = this.lavaMesh.transform;
        this.transformIvs = this.transform.clone().invert();

        this.bitmapData = bitmapData;

        this.rect = new Rect(0, 0, 100, 100);

        this.shapes = [this.rect, ...this._createCircles()];

        this._initMouseControl(this.rect);

        this.updateSizeAndTransform();
    }

    _initMouseControl(shape) {
        shape.x = window.innerWidth - shape.width;
        shape.y = window.innerHeight - shape.height;

        window.addEventListener('mousemove', e => {
            const { x, y } = this.transformIvs.transformVector(new Vector(e.clientX, e.clientY));

            shape.x = x - shape.width * 0.5;
            shape.y = y - shape.height * 0.5;
        });
    }

    _createCircles() {
        const COUNT = 30;
        const circles = [];

        for (let i = 0; circles.length < COUNT; i++) {
            const c = Math.random() < 0.5 ? new Circle(0, 0, 100) : new Rect(0, 0, 200, 200);

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

    // _updateMovement() {
    //     for (let i = 0; i < this.shapes.length; i++) {
    //         const s = this.shapes[i];

    //         if (isNaN(s.vx) || isNaN(s.vy))
    //             continue;

    //         if (s.right > this.lavaMesh.width)
    //             s.vx = Math.abs(s.vx) * -1;

    //         if (s.left < 0)
    //             s.vx = Math.abs(s.vx);

    //         if (s.bottom > this.lavaMesh.height)
    //             s.vy = Math.abs(s.vy) * -1;

    //         if (s.top < 0)
    //             s.vy = Math.abs(s.vy);

    //         s.x += s.vx;
    //         s.y += s.vy;
    //     }
    // }

    updateShapesData() {
        this.shapesController.onUpdate();

        const shapes = this.shapesController.shapes;

        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];

            if (shape.isCircle) {
                this.bitmapData.setCircle(shapes[i], this.dataX, i);
            } else if (shape.isRect) {
                this.bitmapData.setRect(shapes[i], this.dataX, i);
            }
        }

        const ctx = this.ctx;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.globalCompositeOperation = "lighter";
        ctx.save()
        ctx.scale(PRERENDER_SCALE, PRERENDER_SCALE)

        const shapeOffset = 2;

        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];

            ctx.fillStyle = ColorHelper.intToRGBA(0x00ff00, 1)
            ctx.beginPath();

            if (shape.isCircle) {
                if (shape.radius - shapeOffset <= 0)
                    continue;

                ctx.arc(shape.x, shape.y, shape.radius - shapeOffset, 0, Math.PI * 2);
            } else if (shape.isRect) {
                ctx.rect(shape.x + shapeOffset, shape.y + shapeOffset, shape.width - shapeOffset * 2, shape.height - shapeOffset * 2);
            }

            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = ColorHelper.intToRGBA(0x0000ff, 1)
            ctx.beginPath();

            const blendDist = 100 * 0.75;

            if (shape.isCircle) {
                if (shape.radius - shapeOffset <= 0)
                continue;
                
                ctx.arc(shape.x, shape.y, shape.radius + blendDist, 0, Math.PI * 2);
            } else if (shape.isRect) {
                ctx.rect(shape.x - blendDist, shape.y - blendDist, shape.width + blendDist * 2, shape.height + blendDist * 2);
            }

            ctx.closePath();
            ctx.fill();
        }

        ctx.restore()

    }

    updateSizeAndTransform(force = false) {
        const width = window.innerHeight;
        const height = window.innerWidth * 0.5;

        if (this.lavaMesh.width === width && this.lavaMesh.height === height && !force)
            return;

        this.optimizationTexture.width = Math.round(width * PRERENDER_SCALE)
        this.optimizationTexture.height = Math.round(height * PRERENDER_SCALE)

        this.lavaMesh.setSize(width, height);

        if (this.mirrored) {
            this.transform.setTranslation(window.innerWidth - height, width);
            this.transform.setRotation(Math.PI * 0.5);
        } else {
            this.transform.setTranslation(height, 0);
            this.transform.setRotation(-Math.PI * 0.5);
        }

        this.transformIvs.copyFrom(this.transform).invert();

        this.shapesController.onResize(width, height);

        this.lavaMesh.elementsCount = this.shapesController.shapes.length;
    }

    render(viewMatrix3x3) {
        // this._updateMovement();

        this.updateSizeAndTransform();

        // this.bitmapData.updateAndBindTexture();
        this.optimizationTexture.updateAndBindTextureCanvas();


        this.lavaMesh.render(viewMatrix3x3);
    }

    get dataX() {
        return this.lavaMesh.dataX;
    }

    set dataX(x) {
        this.lavaMesh.dataX = x;
    }
}

function rndBtw(a, b) {
    return a + (b - a) * Math.random();
}

function rndSign() {
    return Math.random() < 0.5 ? -1 : 1;
}