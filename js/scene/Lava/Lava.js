import { Component, DisplayObject, Black, Vector, Rectangle, Matrix, MathEx, ColorHelper } from 'black-engine';

import Rect from '../../Math/Shapes/Rect';
import Circle from '../../Math/Shapes/Circle';

import BitmapData from './BitmapData';
import { BLEND_DIST_FACTOR, DATA_TEXTURE_SIZE } from './lavaConfig';

import LavaMesh from './LavaMesh/LavaMesh';
import ShapesController from './ShapesController';
import { TEXTURE_DEBUG } from '../../animationConfig';

const PRERENDER_SCALE = 1;

export default class Lava {
    constructor(gl, bitmapData, container) {
        this.gl = gl;

        this._dataX = 0;

        const program = LavaMesh.createProgram(gl);

        this.lavaMesh = new LavaMesh(gl, program);

        this.shapesController = new ShapesController(1);

        this.optimizationTexture = new BitmapData(gl, 10, 10);

        this.canvas = this.optimizationTexture.canvas;

        this.ctx = this.canvas.getContext("2d");

        if (TEXTURE_DEBUG) {
            this.canvas.style.position = "absolute";
            this.canvas.style.opacity = "0";
            this.canvas.style.width = "100%";
            this.canvas.style.height = "100%";
            container.appendChild(this.canvas);
        }

        // this.lavaMesh.setColors( 0xf0851a, 0xf0851a, 0xe33345, 0xe33345);
        this.lavaMesh.setColors(0x2b073a, 0x570b32, 0x570b32, 0x2b073a);

        this.transform = this.lavaMesh.transform;
        this.transformIvs = this.transform.clone().invert();

        this.bitmapData = bitmapData;
    }

    updateShapesData() {
        this.shapesController.onUpdate();

        if (TEXTURE_DEBUG)
            this.bitmapData.clear();

        const shapes = this.shapesController.shapes;

        const boxes = this.lavaMesh._getBoxes();

        for (let j = 0; j < boxes.length; j++) {
            const box = boxes[j];
            const group = [];

            for (let i = 0; i < shapes.length; i++) {
                const shape = shapes[i];

                if (shape.isCircle) {
                    const distX = Math.abs(box.centerX - shape.x);
                    const distY = Math.abs(box.centerY - shape.y);

                    const clipDistX = box.halfWidth + shape.radius + BLEND_DIST_FACTOR * 2;
                    const clipDistY = box.halfHeight + shape.radius + BLEND_DIST_FACTOR * 2;

                    if (distX < clipDistX && distY < clipDistY) {
                        group.push(shape);
                    }
                } else if (shape.isRect) {
                    const distX = Math.abs(box.centerX - shape.centerX);
                    const distY = Math.abs(box.centerY - shape.centerY);

                    const clipDistX = box.halfWidth + shape.halfWidth + BLEND_DIST_FACTOR * 2;
                    const clipDistY = box.halfHeight + shape.halfHeight + BLEND_DIST_FACTOR * 2;

                    if (distX < clipDistX && distY < clipDistY) {
                        group.push(shape);
                    }
                }
            }

            this.bitmapData.setCount(group.length, j * 2, 0);

            for (let i = 0; i < group.length; i++) {
                const shape = group[i];

                if (shape.isCircle) {
                    this.bitmapData.setCircle(shape, j * 2, i + 1);
                } else if (shape.isRect) {
                    this.bitmapData.setRect(shape, j * 2, i + 1);
                }
            }
        }

        drawShapes(this.ctx, shapes);
    }

    onResize(canvasWidth, canvasHeight) {
        const width = canvasWidth;
        const height = canvasHeight;

        this.optimizationTexture.width = Math.round(width * PRERENDER_SCALE);
        this.optimizationTexture.height = Math.round(height * PRERENDER_SCALE);

        this.lavaMesh.setSize(width, height);

        this.shapesController.mirrored = this.mirrored;

        // if (this.mirrored) {
        //     this.transform.setTranslation(canvasWidth - height, width);
        //     this.transform.setRotation(Math.PI * 0.5);
        // } else {
        //     this.transform.setTranslation(height, 0);
        //     this.transform.setRotation(-Math.PI * 0.5);
        // }

        this.transformIvs.copyFrom(this.transform).invert();

        this.shapesController.onResize(width, height);
    }

    render(viewMatrix3x3) {
        // this._updateMovement();

        this.lavaMesh.elementsCount = this.shapesController.shapes.length;

        // this.updateSizeAndTransform();

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

function drawShapes(ctx, shapes) {
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

        if (shape.isCircle) {
            if (shape.radius - shapeOffset <= 0)
                continue;

            ctx.arc(shape.x, shape.y, shape.radius + BLEND_DIST_FACTOR, 0, Math.PI * 2);
        } else if (shape.isRect) {
            ctx.rect(shape.x - BLEND_DIST_FACTOR, shape.y - BLEND_DIST_FACTOR, shape.width + BLEND_DIST_FACTOR * 2, shape.height + BLEND_DIST_FACTOR * 2);
        }

        ctx.closePath();
        ctx.fill();
    }

    ctx.restore()
}