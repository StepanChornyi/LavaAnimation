import { Component, DisplayObject, Black, Vector, Rectangle, Matrix, MathEx, ColorHelper } from 'black-engine';

import Rect from '../../Math/Shapes/Rect';
import Circle from '../../Math/Shapes/Circle';

import { BLEND_DIST_FACTOR, DATA_TEXTURE_SIZE } from './lavaConfig';

import { TEXTURE_DEBUG } from '../../animationConfig';

const PRERENDER_SCALE = 1;

export default class LavaDebugger {
    constructor(shapesController, lavaMesh) {
        this.shapesController = shapesController;
        this.lavaMesh = lavaMesh;

        this.canvas = document.createElement('canvas');

        this.ctx = this.canvas.getContext("2d");

        // if (TEXTURE_DEBUG) {
        this.canvas.style.position = "absolute";
        this.canvas.style.opacity = "1";
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        document.body.appendChild(this.canvas);
        // }

        this.shapes = this.shapesController.shapes;
        this.highLightBoxIndex = -1;
    }

    render() {
        const ctx = this.ctx;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        this.drawShapes(ctx, this.shapes);
        this.drawBoxes(ctx, this.lavaMesh._getBoxes());
    }

    onResize(sceneWidth, sceneHeight) {
        this.canvas.width = sceneWidth;
        this.canvas.height = sceneHeight;
    }

    drawShapes(ctx, shapes) {
        ctx.globalCompositeOperation = "lighter";
        ctx.save()
        ctx.scale(PRERENDER_SCALE, PRERENDER_SCALE)
    
        const shapeOffset = 2;
    
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
    
            ctx.fillStyle = ColorHelper.intToRGBA(0x00ff00, 0.5)
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
    
            ctx.fillStyle = ColorHelper.intToRGBA(0xffff00, 0.1)
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
        ctx.globalCompositeOperation = "source-over";
    }

    drawBoxes(ctx, boxes) {
        ctx.save()
    
        for (let i = 0; i < boxes.length; i++) {
            const { x, y, width, height } = boxes[i];
    
            ctx.strokeStyle = ColorHelper.intToRGBA(0xffffff, 0.1)
            ctx.lineWidth = 1;
            ctx.beginPath();
    
            ctx.rect(x, y, width, height);
            ctx.closePath();
            ctx.stroke();
    
            if (i === this.highLightBoxIndex) {
                ctx.fillStyle = ColorHelper.intToRGBA(0xffffff, 0.5)
                ctx.beginPath();
                ctx.rect(x, y, width, height);
                ctx.closePath();
                ctx.fill();
            }
        }
    
        ctx.restore()
    }
}