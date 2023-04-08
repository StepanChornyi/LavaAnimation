import { Component, DisplayObject, Black, Vector, Rectangle, Matrix, MathEx, ColorHelper } from 'black-engine';

import Rect from '../../Math/Shapes/Rect';
import Circle from '../../Math/Shapes/Circle';

import { BLEND_DIST_FACTOR, DATA_TEXTURE_SIZE, EMPTY_DATA_VAL, MASK_EDGE_OFFSET, MASK_SCALE, MIN_RADIUS } from './lavaConfig';

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

        this.shapesController = new ShapesController();

        this.dataTexture = new DataTexture(gl);
        this.mask = new RenderTexture(gl);
        this.lavaMesh = new LavaMesh(gl);

        this.image = new FullScreenImage(gl);//tmp for debug

        // this.debugger = new LavaDebugger(this.shapesController, this.lavaMesh);
    }

    updateShapesData() {
        this.shapesController.onUpdate();

        const renderGroups = this.shapesController.renderGroups;

        if (!this.dataTexture.matchSize(renderGroups.length, DATA_TEXTURE_SIZE)) {
            this.dataTexture.resize(renderGroups.length, DATA_TEXTURE_SIZE);
        }

        for (let j = 0; j < renderGroups.length; j++) {
            const { shapes, dataX } = renderGroups[j];

            for (let i = 0; i < DATA_TEXTURE_SIZE; i++) {
                const shape = shapes[i];

                if (!shape) {
                    this.dataTexture.set(dataX, i, EMPTY_DATA_VAL);
                    continue;
                }

                if (shape.isCircle) {
                    this.dataTexture.set(dataX, i, shape.x, shape.y, shape.radius, EMPTY_DATA_VAL);
                } else if (shape.isRect) {
                    this.dataTexture.set(dataX, i, shape.centerX, shape.centerY, shape.halfWidth, shape.halfHeight);
                }
            }
        }

        this.dataTexture.drawToGPU();
    }

    onResize(width, height) {
        this.lavaMesh.setSize(width, height);

        this.mask.setSize(
            Math.round(this.gl.canvas.width * MASK_SCALE),
            Math.round(this.gl.canvas.height * MASK_SCALE)
        );

        this.shapesController.onResize(width, height);

        this.lavaMesh.clearBuffers();

        for (let i = 0; i < this.shapesController.renderGroups.length; i++) {
            this.lavaMesh.addRenderGroup(this.shapesController.renderGroups[i]);
        }

        this.lavaMesh.drawBuffersData();

        // this.debugger && this.debugger.onResize(sceneWidth, sceneHeight);
    }

    render(viewMatrix3x3) {
        const gl = this.gl;
        const lavaMesh = this.lavaMesh;
        const mask = this.mask;

        this.updateShapesData();

        mask.bindFramebuffer(true);

        lavaMesh.dataTexture = this.dataTexture;

        lavaMesh.saveTransform();
        lavaMesh.resetTransform();

        lavaMesh.maskEdgeOffset = MASK_EDGE_OFFSET;
        lavaMesh.maskTexture = null;
        lavaMesh.setConfig(lavaMesh.maskConfig);
        lavaMesh.render(viewMatrix3x3);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clearColor(0, 0, 0, 0);
        gl.colorMask(true, true, true, true);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        lavaMesh.restoreTransform();
        lavaMesh.maskTexture = mask.texture;
        lavaMesh.setConfig(lavaMesh.finalMaskedConfig);
        lavaMesh.render(viewMatrix3x3);

        {
            // this.image.texture =  mask.texture;
            // this.image.render(viewMatrix3x3);
            // return;
        }

        if (this.debugger) {
            this.debugger.highLightBoxIndex = this.shapesController.activeBoxIndex;
            this.debugger.render();
        }
    }
}