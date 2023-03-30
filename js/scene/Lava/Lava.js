import { Component, DisplayObject, Black, Vector, Rectangle, Matrix, MathEx, ColorHelper } from 'black-engine';

import Rect from '../../Math/Shapes/Rect';
import Circle from '../../Math/Shapes/Circle';

import BitmapData from './BitmapData';
import { BLEND_DIST_FACTOR, DATA_TEXTURE_SIZE } from './lavaConfig';

import LavaMesh from './LavaMesh/LavaMesh';
import ShapesController from './ShapesController';
import { TEXTURE_DEBUG } from '../../animationConfig';
import LavaDebugger from './LavaDebugger';
import RenderTexture from '../../WebGL/RenderTexture';
import FullScreenImage from '../FullScreenImage/FullScreenImage';

export default class Lava {
    constructor(gl) {
        this.gl = gl;

        this.lavaMesh = new LavaMesh(gl);

        this.bitmapData = new BitmapData(gl, DATA_TEXTURE_SIZE).initImageData();

        this.shapesController = new ShapesController(1);

        this.mask = new RenderTexture(gl);

        this.image = new FullScreenImage(gl);

        // this.debugger = new LavaDebugger(this.shapesController);

        // this.lavaMesh.setColors( 0xf0851a, 0xf0851a, 0xe33345, 0xe33345);
        this.lavaMesh.setColors(0x2b073a, 0x570b32, 0x570b32, 0x2b073a);

        this.transform = this.lavaMesh.transform;
        this.transformIvs = this.transform.clone().invert();

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

                group.push(shape);
                continue;

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

            // this.bitmapData.setCount(group.length, j * 2, 0);

            for (let i = 0; i < group.length; i++) {
                const shape = group[i];

                if (shape.isCircle) {
                    this.bitmapData.setCircle(shape, j * 2, i);
                } else if (shape.isRect) {
                    this.bitmapData.setRect(shape, j * 2, i);
                }
            }

            this.bitmapData.setEmpty(j * 2, group.length);

        }

        this.bitmapData.updateAndBindTexture();
    }

    onResize(sceneWidth, sceneHeight, canvasWidth, canvasHeight) {

        this.lavaMesh.setSize(sceneWidth, sceneHeight);

        this.shapesController.mirrored = this.mirrored;

        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        const MASK_SCALE = 0.1;

        this.mask.setSize(Math.round(canvasWidth * MASK_SCALE), Math.round(canvasHeight * MASK_SCALE));

        this.transformIvs.copyFrom(this.transform).invert();

        this.shapesController.onResize(sceneWidth, sceneHeight);

        this.debugger && this.debugger.onResize(sceneWidth, sceneHeight);
    }

    render(viewMatrix3x3) {
        this.updateShapesData();

        const gl = this.gl;
        const lavaMesh = this.lavaMesh;
        const mask = this.mask;

        mask.bindFramebuffer();

        gl.bindFramebuffer(gl.FRAMEBUFFER, mask.frameBuffer);
        gl.clearColor(0, 0, 0, 0);
        gl.colorMask(true, true, true, true);
        gl.viewport(0, 0, mask.width, mask.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        lavaMesh.maskEdgeOffset = 10;
        lavaMesh.setConfig(lavaMesh.maskConfig);
        lavaMesh.render(viewMatrix3x3);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clearColor(0, 0, 0, 0);
        gl.colorMask(true, true, true, true);
        gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
        {
            // this.image.texture = mask.texture;
            // this.image.render(viewMatrix3x3);
            // return;
        }

        {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, mask.texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
            lavaMesh.setConfig(lavaMesh.finalMaskedConfig);
            // lavaMesh.setConfig(lavaMesh.maskConfig);
            lavaMesh.render(viewMatrix3x3);
        }

        // this.debugger && this.debugger.render();
    }
}