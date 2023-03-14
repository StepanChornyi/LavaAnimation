import WEBGL_UTILS from '../../../WebGL/WebglUtils';
import RectMesh from '../../../RectMesh/RectMesh';

import { BLEND_DIST_FACTOR, DATA_TEXTURE_SIZE_IVS, INT_OFFSET, INT_SCALE_IVS, MAX_OBJECTS_COUNT } from './../lavaConfig';

import vs from "./lava.vs.glsl";
import fsRaw from "./lava.fs.glsl";
import Rect from '../../../Math/Shapes/Rect';

const fs = fsRaw
    .replace("MAX_OBJECTS_COUNT", MAX_OBJECTS_COUNT)
    .replace("DATA_TEXTURE_SIZE_IVS", DATA_TEXTURE_SIZE_IVS)
    .replace("BLEND_DIST_FACTOR", BLEND_DIST_FACTOR.toFixed(1))
    .replace("INT_SCALE_IVS", INT_SCALE_IVS.toFixed(8))
    .replace("INT_OFFSET", INT_OFFSET.toFixed(1))
    .replace("INT_OFFSET", INT_OFFSET.toFixed(1))
    .replace("INT_OFFSET", INT_OFFSET.toFixed(1));

const dataTextureXUnf = "dataTextureX";
const circlesCountUnf = "circlesCount";
const shapesDataUnf = "shapesData";
const preRenderedUnf = "preRendered";

const uniforms = [dataTextureXUnf, circlesCountUnf, shapesDataUnf, preRenderedUnf];

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
        name: 'vertDataX',
        size: 1
    },
    {
        name: 'vertUv',
        size: 2
    }
];

const vertexByteSize = attribs.reduce((acc, attr) => (acc + attr.size), 0);

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

        const boxes = this._getBoxes();

        for (let i = 0; i < boxes.length; i++) {
            this._addRect(boxes[i], i * 2);
        }

        this.drawBuffersData();

        this.dirty = false;
    }

    _getBoxes() {
        const boxes = [];
        const rows = 4;
        const cols = rows;

        const segmentWidth = Math.floor(this.width / cols);
        const lastSegmentWidth = Math.floor(this.width - segmentWidth * (cols - 1));

        const segmentHeight = Math.floor(this.height / rows);
        const lastSegmentHeight = Math.floor(this.height - segmentHeight * (rows - 1));

        for (let yy = 0; yy < rows; yy++) {
            for (let xx = 0; xx < cols; xx++) {
                const w = (xx === cols - 1) ? lastSegmentWidth : segmentWidth;
                const h = (yy === rows - 1) ? lastSegmentHeight : segmentHeight;

                boxes.push(new Rect(xx * segmentWidth, yy * segmentHeight, w, h));
            }
        }

        return boxes;
    }

    _addRect(rect, i) {
        const [c0, c1, c2, c3] = this.colors;

        const offset = this.vertices.length / vertexByteSize;
        const RECT_INDICES = RectMesh.RECT_INDICES;

        const ul = rect.x / this.width;
        const ur = rect.right / this.width;
        const vt = 1 - rect.y / this.height;
        const vb = 1 - rect.bottom / this.height;

        this.vertices.push(
            rect.x, rect.y, c0, i, ul, vt,
            rect.right, rect.y, c1, i, ur, vt,
            rect.right, rect.bottom, c2, i, ur, vb,
            rect.x, rect.bottom, c3, i, ul, vb
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