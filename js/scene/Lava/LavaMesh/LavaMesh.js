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

const dataTextureXUnf = "dataTextureX";
const circlesCountUnf = "circlesCount";
const shapesDataUnf = "shapesData";
const preRenderedUnf = "preRendered";

const uniforms = [dataTextureXUnf, circlesCountUnf, shapesDataUnf, preRenderedUnf];

const vertexByteSize = 5;
const attribs = [
    {
        name: 'vertPosition',
        size: 2
    },
    {
        name: 'vertColor',
        size: 1
    },
    {
        name: 'vertUv',
        size: 2
    }
];

export default class LavaMesh extends RectMesh {
    constructor(gl, program = LavaMesh.createProgram(gl)) {
        super(gl, program, { vertexByteSize, uniforms, attribs });

        this.elementsCount = 0;
        this.dataX = 0;

        this.colors = [0xff0000, 0xffff00, 0xff00ff, 0x0000ff];
    }

    setUniforms(_) {
        super.setUniforms(_);

        const { gl, uniforms } = this;

        gl.uniform1i(uniforms[dataTextureXUnf].location, this.dataX);
        gl.uniform1i(uniforms[circlesCountUnf].location, this.elementsCount);
        gl.uniform1i(uniforms[shapesDataUnf].location, 0);
        gl.uniform1i(uniforms[preRenderedUnf].location, 1);
    }

    setColors(topLeft, topRight = topLeft, bottomRight = topRight, bottomLeft = bottomRight) {
        // this.colors = [topLeft, topRight, bottomRight, bottomLeft];
        this.dirty = true;

        return this;
    }

    _updateBuffers() {
        if (!this.dirty)
            return;

        this.vertices = [];
        this.indices = [];

        const rows = 10;
        const cols = rows;

        const segmentWidth = Math.floor(this.width / cols);
        const lastSegmentWidth = Math.floor(this.width - segmentWidth * (cols - 1));

        const segmentHeight = Math.floor(this.height / rows);
        const lastSegmentHeight = Math.floor(this.height - segmentHeight * (rows - 1));

        for (let yy = 0; yy < rows; yy++) {
            for (let xx = 0; xx < cols; xx++) {
                const w = (xx === cols - 1) ? lastSegmentWidth : segmentWidth;
                const h = (yy === rows - 1) ? lastSegmentHeight : segmentHeight;

                this._addRect(xx * segmentWidth, yy * segmentHeight, w, h);
            }
        }

        this.drawBuffersData();

        this.dirty = false;
    }

    _addRect(x, y, w, h) {
        const [c0, c1, c2, c3] = this.colors;

        const offset = this.vertices.length / vertexByteSize;
        const RECT_INDICES = RectMesh.RECT_INDICES;

        const ul = x / this.width;
        const ur = (x + w) / this.width;
        const vt = 1 - y / this.height;
        const vb = 1 - (y + h) / this.height;

        this.vertices.push(
            x, y, c0, ul, vt,
            x + w, y, c1, ur, vt,
            x + w, y + h, c2, ur, vb,
            x, y + h, c3, ul, vb
        );

        for (let i = 0; i < RECT_INDICES.length; i++) {
            this.indices.push(RECT_INDICES[i] + offset);
        }
    }

    render(_) {
        if (this.width === 0 || this.height === 0)
            return console.warn(`Invalid mesh dimensions! width = ${this.width} | height = ${this.width}`);

        super.render(_);
    }

    static createProgram(gl) {
        return WEBGL_UTILS.createProgram(gl, vs, fs);
    }
}