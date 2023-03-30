import { Component, DisplayObject, Black, Vector, Rectangle, Matrix, MathEx, ColorHelper } from 'black-engine';

import Rect from '../../Math/Shapes/Rect';
import Circle from '../../Math/Shapes/Circle';

import { BLEND_DIST_FACTOR, DATA_TEXTURE_SIZE } from './lavaConfig';

import { TEXTURE_DEBUG } from '../../animationConfig';

const PRERENDER_SCALE = 1;

export default class LavaDebugger {
    constructor(shapesController) {
        this.shapesController = shapesController;

        this.canvas = document.createElement('canvas');

        this.ctx = this.canvas.getContext("2d");

        // if (TEXTURE_DEBUG) {
            this.canvas.style.position = "absolute";
            this.canvas.style.opacity = "0.5";
            this.canvas.style.width = "100%";
            this.canvas.style.height = "100%";
            document.body.appendChild(this.canvas);
        // }
    }

    render() {
        drawShapes(this.ctx, this.shapesController.shapes);
    }

    onResize(sceneWidth, sceneHeight) {
        this.canvas.width = sceneWidth;
        this.canvas.height = sceneHeight;
    }
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