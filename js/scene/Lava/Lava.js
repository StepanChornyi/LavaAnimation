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

        // this.debugger = new LavaDebugger(this.shapesController, this.lavaMesh);

        // this.lavaMesh.setColors( 0xf0851a, 0xf0851a, 0xe33345, 0xe33345);
        this.lavaMesh.setColors(0x2b073a, 0x570b32, 0x570b32, 0x2b073a);

        this.transform = this.lavaMesh.transform;
        this.transformIvs = this.transform.clone().invert();

        const texture = this.texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        const width = DATA_TEXTURE_SIZE;
        const height = DATA_TEXTURE_SIZE;

        const data = this.data = new Float32Array(width * height * 4);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;

                const xx = (x % 2)
                const yy = (y % 2)

                this.setData(x, y, (xx || yy)?1:0, 0, 0, 1);
            }
        }

        this.drawData();
    }

    drawData() {
        const gl = this.gl;

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, DATA_TEXTURE_SIZE, DATA_TEXTURE_SIZE, 0, gl.RGBA, gl.FLOAT, this.data);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    setData(dataX, dataY, r, g, b, a) {
        const width = DATA_TEXTURE_SIZE;

        const index = (dataY * width + dataX) * 4;

        this.data[index] = r;
        this.data[index + 1] = g;
        this.data[index + 2] = b;
        this.data[index + 3] = a;
    }

    updateShapesData() {
        this.shapesController.onUpdate();

        if (TEXTURE_DEBUG)
            this.bitmapData.clear();

        const shapes = this.shapesController.shapes;

        this.debugger && (this.debugger.shapes = shapes);

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

                    const clipDistX = shape.radius + BLEND_DIST_FACTOR * 8;
                    const clipDistY = shape.radius + BLEND_DIST_FACTOR * 8;

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

            if (this.debugger && this.shapesController.activeBoxIndex === j) {
                this.debugger.shapes = group
            }

            // this.bitmapData.setCount(group.length, j * 2, 0);

            for (let i = 0; i < group.length; i++) {
                const shape = group[i];

                if (shape.isCircle) {
                    this.bitmapData.setCircle(shape, j * 2, i);

                    this.setData(j, i, shape.x, shape.y, shape.radius, -1)
                } else if (shape.isRect) {
                    this.bitmapData.setRect(shape, j * 2, i);
                    this.setData(j, i, shape.centerX, shape.centerY, shape.halfWidth, shape.halfHeight)

                }
            }

            this.setData(j, group.length, -1, -1, -1, -1)

            this.bitmapData.setEmpty(j * 2, group.length);
        }

        this.drawData();

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

        this.shapesController.setBoxes(this.lavaMesh._getBoxes());

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
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, mask.texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            lavaMesh.setConfig(lavaMesh.finalMaskedConfig);
            // lavaMesh.setConfig(lavaMesh.maskConfig);
            lavaMesh.render(viewMatrix3x3);
        }


        {
            this.image.texture = this.texture;
            this.image.render(viewMatrix3x3);
            // return;
        }

        if (this.debugger) {
            this.debugger.highLightBoxIndex = this.shapesController.activeBoxIndex;
            this.debugger.render();
        }
    }
}