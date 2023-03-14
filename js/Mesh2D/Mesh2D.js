import { Matrix } from "black-engine";
import WEBGL_UTILS from '../WebGL/WebglUtils';
import Mesh from "../WebGL/Mesh";

import vs from "./mesh2D.vs.glsl";
import fs from "./mesh2D.fs.glsl";

const TRANSFORM_UNF = "transform";
const VIEW_TRANSFORM_UNF = "viewTransform";

const currentConfig = {
    uniforms: [
        TRANSFORM_UNF,
        VIEW_TRANSFORM_UNF
    ]
};

export default class Mesh2D extends Mesh {
    constructor(gl, program = WEBGL_UTILS.createProgram(gl, vs, fs), config = currentConfig) {
        super(gl, program, Mesh.mergeConfigs(config, currentConfig));

        this.transform = new Matrix();

        this._transformDataArr = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    }

    _updateBuffers() { }

    _getTransformDataArr() {
        this._transformDataArr[0] = this.transform.data[0];
        this._transformDataArr[1] = this.transform.data[1];
        this._transformDataArr[3] = this.transform.data[2];
        this._transformDataArr[4] = this.transform.data[3];
        this._transformDataArr[6] = this.transform.data[4];
        this._transformDataArr[7] = this.transform.data[5];

        return this._transformDataArr;
    }

    setUniforms(viewTransform) {
        this.gl.uniformMatrix3fv(this.uniforms[TRANSFORM_UNF].location, false, this._getTransformDataArr());
        this.gl.uniformMatrix3fv(this.uniforms[VIEW_TRANSFORM_UNF].location, false, viewTransform);
    }

    render(viewTransform) {
        this.gl.useProgram(this.program);

        this._updateBuffers();

        this.setUniforms(viewTransform);
        this.updateAttribPointers();

        this._render();
    }

    _render() {
        const gl = this.gl;

        gl.colorMask(true, true, true, true);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }

    static get vs() {
        return vs;
    }
}