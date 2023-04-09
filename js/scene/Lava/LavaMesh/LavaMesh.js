import WEBGL_UTILS from '../../../WebGL/WebglUtils';
import RectMesh from '../../../RectMesh/RectMesh';

import { BLEND_DIST_FACTOR, DATA_TEXTURE_SIZE_IVS, MAX_OBJECTS_COUNT, MIN_RADIUS } from './../lavaConfig';

import vs from "./lava.vs.glsl";
import fsRaw from "./lava.fs.glsl";
import Rect from '../../../Math/Shapes/Rect';

const baseFs = replaceAllArr(fsRaw,
    ["MAX_OBJECTS_COUNT", MAX_OBJECTS_COUNT],
    ["DATA_TEXTURE_SIZE_IVS", DATA_TEXTURE_SIZE_IVS],
    ["BLEND_DIST_FACTOR", BLEND_DIST_FACTOR.toFixed(1)],
    ["MIN_RADIUS", MIN_RADIUS]
);

const finalMaskedFs = replaceAllArr(baseFs,
    ["RENDER_FUNC", "renderWithMask"],
    ["SET_COLOR_FUNC", "setFragColor"],
);

const maskedMaskFs = replaceAllArr(baseFs,
    ["RENDER_FUNC", "renderWithMask"],
    ["SET_COLOR_FUNC", "setFragColorMask"],
);

const maskFs = replaceAllArr(baseFs,
    ["RENDER_FUNC", "renderFull"],
    ["SET_COLOR_FUNC", "setFragColorMask"],
);

const shapesDataUnf = "shapesData";
const maskTextureUnf = "maskTexture";
const maskEdgeOffsetUnf = "maskEdgeOffset";
const dataTextureSizeIvsUnf = "dataTextureSizeIvs";

const uniforms = [shapesDataUnf, maskTextureUnf, maskEdgeOffsetUnf, dataTextureSizeIvsUnf];

const attribs = [
    { name: 'vertPosition', size: 2 },
    { name: 'vertColor', size: 1 },
    { name: 'vertDataX', size: 1 }
];

export default class LavaMesh extends RectMesh {
    constructor(gl) {
        const maskProgram = WEBGL_UTILS.createProgram(gl, vs, maskFs);
        const maskedMaskProgram = WEBGL_UTILS.createProgram(gl, vs, maskedMaskFs);
        const finalMaskedProgram = WEBGL_UTILS.createProgram(gl, vs, finalMaskedFs);

        super(gl, maskProgram, { uniforms, attribs });

        this.maskConfig = this.getCurrentConfig();

        this.program = maskedMaskProgram;
        this.initUniformsAndAttribs({ uniforms, attribs });
        this.maskedMaskConfig = this.getCurrentConfig();

        this.program = finalMaskedProgram;
        this.initUniformsAndAttribs({ uniforms, attribs });
        this.finalMaskedConfig = this.getCurrentConfig();

        this.maskEdgeOffset = -1;
        this.maskTexture = null;
        this.dataTexture = null;

        this._transformIvsDataArr = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    }

    setConfig({ program, attribs, uniforms }) {
        this.program = program;
        this.attribs = attribs;
        this.uniforms = uniforms;
    }

    getCurrentConfig() {
        return {
            program: this.program,
            uniforms: this.uniforms,
            attribs: this.attribs,
        };
    }

    setUniforms(_) {
        super.setUniforms(_);

        const { gl, uniforms } = this;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.dataTexture.texture);

        if (this.maskTexture) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.maskTexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }

        gl.uniform1i(uniforms[shapesDataUnf].location, 0);
        gl.uniform1i(uniforms[maskTextureUnf].location, 1);
        gl.uniform1f(uniforms[maskEdgeOffsetUnf].location, this.maskEdgeOffset);
        gl.uniform2f(uniforms[dataTextureSizeIvsUnf].location, 1 / this.dataTexture.width, 1 / this.dataTexture.height);
    }

    _updateBuffers() { }

    clearBuffers() {
        this.vertices = [];
        this.indices = [];
    }

    addRenderGroup(renderGroup) {
        this._addRect(renderGroup, renderGroup.dataX);
    }

    _addRect(rect, dataX) {
        const [c0, c1, c2, c3] = rect.colors;

        const offset = this.vertices.length / this.vertexByteSize;
        const RECT_INDICES = rect.flipped ? RectMesh.RECT_INDICES_FLIPPED : RectMesh.RECT_INDICES;

        this.vertices.push(
            rect.x, rect.y, c0, dataX,
            rect.right, rect.y, c1, dataX,
            rect.right, rect.bottom, c2, dataX,
            rect.x, rect.bottom, c3, dataX,
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
}

function replaceAllArr(str, ...arr) {
    for (let i = 0; i < arr.length; i++) {
        str = replaceAll(str, arr[i][0], arr[i][1]);
    }

    return str;
}

function replaceAll(str, key, val) {
    while (str.indexOf(key) >= 0) {
        str = str.replace(key, val);
    }

    return str;
}