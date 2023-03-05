import WEBGL_UTILS from '../../scene/utils/webgl-utils';

import BaseRectMesh from '../BaseRectMesh/BaseRectMesh';

import { DATA_TEXTURE_SIZE_IVS, INT_SCALE_IVS } from './lavaConfig';

import vs from "./lava.vs.glsl";
import fs from "./lava.fs.glsl";

export default class LavaMesh extends BaseRectMesh {
    constructor(gl, program = LavaMesh.createProgram(gl)) {
        super(gl, program);

        this.elementsCount = 0;

        this.setSize(gl.canvas.width, gl.canvas.height);
        this.setColors(0xde0404, 0xffff25, 0xcc0bcc, 0x2d08a6);
    }

    setUniforms(viewMatrix3x3) {
        super.setUniforms(viewMatrix3x3);

        const sizeUniformPos = this.gl.getUniformLocation(this.program, `sizeIvs`);

        this.gl.uniform3f(sizeUniformPos,
            DATA_TEXTURE_SIZE_IVS,
            DATA_TEXTURE_SIZE_IVS,
            INT_SCALE_IVS
        );

        const circlesCount = this.gl.getUniformLocation(this.program, `circlesCount`);

        this.gl.uniform1i(circlesCount, this.elementsCount);
    }

    render(viewMatrix3x3) {
        if (this.gl.canvas.width !== this.width || this.gl.canvas.height !== this.height)
            this.setSize(this.gl.canvas.width, this.gl.canvas.height);

        super.render(viewMatrix3x3);
    }

    static createProgram(gl) {
        return WEBGL_UTILS.createProgram(gl, vs, fs);
    }
}