import WEBGL_UTILS from '../../../WebGL/WebglUtils';
import RectMesh from '../../../RectMesh/RectMesh';

import { DATA_TEXTURE_SIZE_IVS, INT_OFFSET, INT_SCALE_IVS } from './../lavaConfig';

import vs from "./lava.vs.glsl";
import fs from "./lava.fs.glsl";

export default class LavaMesh extends RectMesh {
    constructor(gl, program = LavaMesh.createProgram(gl)) {
        super(gl, program);

        this.elementsCount = 0;
        this.dataX = 0;

        this.setColors(0xde0404, 0xffff25, 0xcc0bcc, 0x2d08a6);
    }

    setUniforms(viewMatrix3x3) {
        super.setUniforms(viewMatrix3x3);

        const sizeUniformPos = this.gl.getUniformLocation(this.program, `sizeIvs`);

        this.gl.uniform4f(sizeUniformPos,
            this.dataX,
            DATA_TEXTURE_SIZE_IVS,
            INT_SCALE_IVS,
            INT_OFFSET
        );

        const circlesCount = this.gl.getUniformLocation(this.program, `circlesCount`);

        this.gl.uniform1i(circlesCount, this.elementsCount);

        const u_image0Location = this.gl.getUniformLocation(this.program, "shapesData");
        const u_image1Location = this.gl.getUniformLocation(this.program, "prerendered");

        // set which texture units to render with.
        this.gl.uniform1i(u_image0Location, 0);  // texture unit 0
        this.gl.uniform1i(u_image1Location, 1);  // texture unit 1
    }

    render(viewMatrix3x3) {
        if (this.width === 0 || this.height === 0)
            return console.warn(`Invalid mesh dimensions! width = ${this.width} | height = ${this.width}`);

        super.render(viewMatrix3x3);
    }

    static createProgram(gl) {
        return WEBGL_UTILS.createProgram(gl, vs, fs);
    }
}