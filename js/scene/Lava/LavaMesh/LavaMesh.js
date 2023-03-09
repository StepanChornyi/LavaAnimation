import WEBGL_UTILS from '../../../WebGL/WebglUtils';
import RectMesh from '../../../RectMesh/RectMesh';

import { BLEND_DIST_FACTOR, DATA_TEXTURE_SIZE_IVS, INT_OFFSET, INT_SCALE_IVS, MAX_OBJECTS_COUNT } from './../lavaConfig';

import vs from "./lava.vs.glsl";
import fsRaw from "./lava.fs.glsl";

const fs = fsRaw
    .replace("MAX_OBJECTS_COUNT", MAX_OBJECTS_COUNT)
    .replace("DATA_TEXTURE_SIZE_IVS", DATA_TEXTURE_SIZE_IVS)
    .replace("BLEND_DIST_FACTOR", BLEND_DIST_FACTOR.toFixed(1))
    .replace("INT_SCALE_IVS", INT_SCALE_IVS.toFixed(8))
    .replace("INT_OFFSET", INT_OFFSET.toFixed(1));

export default class LavaMesh extends RectMesh {
    constructor(gl, program = LavaMesh.createProgram(gl)) {
        super(gl, program);

        this.elementsCount = 0;
        this.dataX = 0;

        this.setColors(0xde0404, 0xffff25, 0xcc0bcc, 0x2d08a6);
    }

    setUniforms(viewMatrix3x3) {
        super.setUniforms(viewMatrix3x3);

        const dataTextureXUniformPos = this.gl.getUniformLocation(this.program, `dataTextureX`);

        this.gl.uniform1i(dataTextureXUniformPos, this.dataX);

        const circlesCount = this.gl.getUniformLocation(this.program, `circlesCount`);

        this.gl.uniform1i(circlesCount, this.elementsCount);

        const u_image0Location = this.gl.getUniformLocation(this.program, "shapesData");
        const u_image1Location = this.gl.getUniformLocation(this.program, "prerendered");

        this.gl.uniform1i(u_image0Location, 0);
        this.gl.uniform1i(u_image1Location, 1);
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