import { Component, DisplayObject, Black, Vector, Rectangle, Matrix, MathEx, ColorHelper } from 'black-engine';

import Rect from '../../Math/Shapes/Rect';
import Circle from '../../Math/Shapes/Circle';

import { BLEND_DIST_FACTOR, DATA_TEXTURE_SIZE, MIN_RADIUS } from './lavaConfig';

import LavaMesh from './LavaMesh/LavaMesh';
import ShapesController from './ShapesController';
import { TEXTURE_DEBUG } from '../../animationConfig';
import LavaDebugger from './LavaDebugger';
import RenderTexture from '../../WebGL/RenderTexture';
import FullScreenImage from '../FullScreenImage/FullScreenImage';
import DataTexture from './DataTexture';

export default class Lava {
    constructor(gl) {
        this.gl = gl;

        this.lavaMesh = new LavaMesh(gl);

        this.shapesController = new ShapesController(1);

        this.maskSmall = new RenderTexture(gl);
        this.maskLarge = new RenderTexture(gl);

        this.image = new FullScreenImage(gl);

        // this.debugger = new LavaDebugger(this.shapesController, this.lavaMesh);

        // this.lavaMesh.setColors( 0xf0851a, 0xf0851a, 0xe33345, 0xe33345);
        this.lavaMesh.setColors(0x2b073a, 0x570b32, 0x570b32, 0x2b073a);

        this.transform = this.lavaMesh.transform;
        this.transformIvs = this.transform.clone().invert();

        this.dataTexture = new DataTexture(gl, DATA_TEXTURE_SIZE);

        this.lavaMesh.dataTexture = this.dataTexture.texture;
    }

    updateShapesData() {
        this.shapesController.onUpdate();

        const shapes = this.shapesController.shapes;

        this.debugger && (this.debugger.shapes = shapes);

        const boxes = this.lavaMesh._getBoxes();

        this.dataTexture.clear(MIN_RADIUS);

        const clipDist = BLEND_DIST_FACTOR * 1.5;

        for (let j = 0; j < boxes.length; j++) {
            const box = boxes[j];
            const group = [];

            for (let i = 0, distX, distY, x, y, radiusX, radiusY; i < shapes.length; i++) {
                const shape = shapes[i];

                group.push(shape);
                continue;

                if (shape.isCircle) {
                    x = shape.x;
                    y = shape.y;
                    radiusX = radiusY = shape.radius;
                } else if (shape.isRect) {
                    x = shape.centerX;
                    y = shape.centerY;
                    radiusX = shape.halfWidth;
                    radiusY = shape.halfHeight;
                }

                distX = Math.abs(box.centerX - x) - radiusX - box.halfWidth;
                distY = Math.abs(box.centerY - y) - radiusY - box.halfHeight;

                if (distX < clipDist && distY < clipDist) {
                    group.push(shape);
                }
            }

            if (this.debugger && this.shapesController.activeBoxIndex === j) {
                this.debugger.shapes = group
            }

            for (let i = 0; i < group.length; i++) {
                const shape = group[i];

                if (shape.isCircle) {
                    this.dataTexture.set(j, i, shape.x, shape.y, shape.radius, -1);
                } else if (shape.isRect) {
                    this.dataTexture.set(j, i, shape.centerX, shape.centerY, shape.halfWidth, shape.halfHeight);
                }
            }

            this.dataTexture.set(j, group.length, -1, -1, MIN_RADIUS - 1, -1);
        }

        // this.drawData();

        this.dataTexture.drawToGPU();
    }

    onResize(sceneWidth, sceneHeight, canvasWidth, canvasHeight) {

        this.lavaMesh.setSize(sceneWidth, sceneHeight);

        this.shapesController.mirrored = this.mirrored;

        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        const MASK_SMALL_SCALE = 0.05;
        const MASK_LARGE_SCALE = 0.3;

        this.maskSmall.setSize(Math.round(canvasWidth * MASK_SMALL_SCALE), Math.round(canvasHeight * MASK_SMALL_SCALE));
        this.maskLarge.setSize(Math.round(canvasWidth * MASK_LARGE_SCALE), Math.round(canvasHeight * MASK_LARGE_SCALE));

        this.transformIvs.copyFrom(this.transform).invert();

        this.shapesController.onResize(sceneWidth, sceneHeight);

        this.shapesController.setBoxes(this.lavaMesh._getBoxes());

        this.debugger && this.debugger.onResize(sceneWidth, sceneHeight);
    }

    render(viewMatrix3x3) {
        this.updateShapesData();

        const gl = this.gl;
        const lavaMesh = this.lavaMesh;
        const maskSmall = this.maskSmall;
        const maskLarge = this.maskLarge;

        maskSmall.bindFramebuffer(true);

        lavaMesh.maskEdgeOffset = 15;
        lavaMesh.maskTexture = null;
        lavaMesh.setConfig(lavaMesh.maskConfig);
        lavaMesh.render(viewMatrix3x3);

        maskLarge.bindFramebuffer(true);

        lavaMesh.maskEdgeOffset = 2;
        lavaMesh.maskTexture = maskSmall.texture;
        lavaMesh.setConfig(lavaMesh.maskedMaskConfig);
        lavaMesh.render(viewMatrix3x3);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clearColor(0, 0, 0, 0);
        gl.colorMask(true, true, true, true);
        gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        {
            // gl.activeTexture(gl.TEXTURE1);
            // gl.bindTexture(gl.TEXTURE_2D, maskSmall.texture);
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        lavaMesh.maskTexture = maskLarge.texture;
            lavaMesh.setConfig(lavaMesh.finalMaskedConfig);
            // lavaMesh.setConfig(lavaMesh.maskConfig);
            lavaMesh.render(viewMatrix3x3);
        }


        {
            // this.image.texture =  maskLarge.texture;
            // this.image.texture = this.dataTexture.texture;
            // this.image.render(viewMatrix3x3);

            // return;
        }

        if (this.debugger) {
            this.debugger.highLightBoxIndex = this.shapesController.activeBoxIndex;
            this.debugger.render();
        }
    }
}