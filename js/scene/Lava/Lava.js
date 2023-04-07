import { Component, DisplayObject, Black, Vector, Rectangle, Matrix, MathEx, ColorHelper } from 'black-engine';

import Rect from '../../Math/Shapes/Rect';
import Circle from '../../Math/Shapes/Circle';

import { BLEND_DIST_FACTOR, DATA_TEXTURE_SIZE, MASK_EDGE_OFFSET, MASK_SCALE, MIN_RADIUS } from './lavaConfig';

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

        this.mask = new RenderTexture(gl);

        this.image = new FullScreenImage(gl);

        // this.debugger = new LavaDebugger(this.shapesController, this.lavaMesh);

        // this.lavaMesh.setColors( 0xf0851a, 0xf0851a, 0xe33345, 0xe33345);
        this.lavaMesh.setColors(0x2b073a, 0x570b32, 0x570b32, 0x2b073a);

        this.transform = this.lavaMesh.transform;
        this.transformIvs = this.transform.clone().invert();

        this.dataTexture = new DataTexture(gl);

        this.lavaMesh.dataTexture = this.dataTexture.texture;
    }

    updateShapesData() {
        this.shapesController.onUpdate();

        const shapes = this.shapesController.shapes;

        this.debugger && (this.debugger.shapes = shapes);

        const boxesCount = this.lavaMesh._getBoxes().length;


        if (!this.dataTexture.matchSize(boxesCount, DATA_TEXTURE_SIZE)) {
            this.dataTexture.resize(boxesCount, DATA_TEXTURE_SIZE);
        }

        this.dataTexture.clear(MIN_RADIUS);

        for (let j = 0; j < boxesCount; j++) {
            for (let i = 0; i < shapes.length; i++) {
                const shape = shapes[i];

                if (shape.isCircle) {
                    this.dataTexture.set(j, i, shape.x, shape.y, shape.radius, -1);
                } else if (shape.isRect) {
                    this.dataTexture.set(j, i, shape.centerX, shape.centerY, shape.halfWidth, shape.halfHeight);
                }
            }

            this.dataTexture.set(j, shapes.length, -1, -1, MIN_RADIUS - 1, -1);
        }

        this.dataTexture.drawToGPU();
    }

    onResize(sceneWidth, sceneHeight, canvasWidth, canvasHeight) {

        this.lavaMesh.setSize(sceneWidth, sceneHeight);

        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

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

        mask.bindFramebuffer(true);

        lavaMesh.maskEdgeOffset = MASK_EDGE_OFFSET;
        lavaMesh.maskTexture = null;
        lavaMesh.setConfig(lavaMesh.maskConfig);
        lavaMesh.render(viewMatrix3x3);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clearColor(0, 0, 0, 0);
        gl.colorMask(true, true, true, true);
        gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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