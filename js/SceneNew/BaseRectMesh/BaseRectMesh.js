import { Matrix, RGB, Vector } from "black-engine";
import WEBGL_UTILS from "../../scene/utils/webgl-utils";
import BaseMesh from "../BaseMesh";

import vs from "./baseRect.vs.glsl";
import fs from "./baseRect.fs.glsl";

export default class BaseRectMesh extends BaseMesh {
    constructor(gl, program = WEBGL_UTILS.createProgram(gl, vs, fs)) {
        super(gl, program);

        this.gl = gl;
        this.width = 0;
        this.height = 0;
        this.transform = new Matrix();
        this.colors = [new RGB(), new RGB(), new RGB(), new RGB()];
        this.dirty = true;

        this._transformUniformPos = gl.getUniformLocation(program, `transform`);
        this._viewTransformUniformPos = gl.getUniformLocation(program, `viewTransform`);

        this.indices = [
            0, 1, 2,
            2, 3, 0
        ];

        this._transformMatrix3x3 = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    }

    setSize(width = this.width, height = width) {
        this.width = width;
        this.height = height;

        this.dirty = true;

        return this;
    }

    setPosition(x, y) {
        this.position.set(x, y);

        return this;
    }

    setColors(topLeft, topRight = topLeft, bottomRight = topRight, bottomLeft = bottomRight) {
        hex2rgb(topLeft, this.colors[0]);
        hex2rgb(topRight, this.colors[1]);
        hex2rgb(bottomRight, this.colors[2]);
        hex2rgb(bottomLeft, this.colors[3]);

        this.dirty = true;

        return this;
    }

    _updateVertices() {
        if (!this.dirty)
            return;

        const [c0, c1, c2, c3] = this.colors;

        this.vertices = [
            0, 0, c0.r, c0.g, c0.b, 0, 1,
            this.width, 0, c1.r, c1.g, c1.b, 1, 1,
            this.width, this.height, c2.r, c2.g, c2.b, 1, 0,
            0, this.height, c3.r, c3.g, c3.b, 0, 0
        ];

        this.drawBuffersData();

        this.dirty = false;
    }

    _getTransform() {
        this._transformMatrix3x3[0] = this.transform.data[0];
        this._transformMatrix3x3[1] = this.transform.data[1];
        this._transformMatrix3x3[3] = this.transform.data[2];
        this._transformMatrix3x3[4] = this.transform.data[3];
        this._transformMatrix3x3[6] = this.transform.data[4];
        this._transformMatrix3x3[7] = this.transform.data[5];

        return this._transformMatrix3x3;
    }

    updateAttribPointers() {
        super.updateAttribPointers();

        const gl = this.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        const positionAttribLocation = gl.getAttribLocation(this.program, 'vertPosition');
        const colorAttribLocation = gl.getAttribLocation(this.program, 'vertColor');
        const uvAttribLocation = gl.getAttribLocation(this.program, 'vertUv');

        gl.vertexAttribPointer(
            positionAttribLocation,
            2,
            gl.FLOAT,
            gl.FALSE,
            7 * Float32Array.BYTES_PER_ELEMENT,
            0
        );

        gl.vertexAttribPointer(
            colorAttribLocation,
            3,
            gl.FLOAT,
            gl.FALSE,
            7 * Float32Array.BYTES_PER_ELEMENT,
            2 * Float32Array.BYTES_PER_ELEMENT
        );

        gl.vertexAttribPointer(
            uvAttribLocation,
            2,
            gl.FLOAT,
            gl.FALSE,
            7 * Float32Array.BYTES_PER_ELEMENT,
            5 * Float32Array.BYTES_PER_ELEMENT
        );

        gl.enableVertexAttribArray(positionAttribLocation);
        gl.enableVertexAttribArray(colorAttribLocation);
        gl.enableVertexAttribArray(uvAttribLocation);
    }

    setUniforms(viewMatrix3x3) {
        this.gl.uniformMatrix3fv(this._transformUniformPos, false, this._getTransform());
        this.gl.uniformMatrix3fv(this._viewTransformUniformPos, false, viewMatrix3x3);
    }

    render(viewMatrix3x3) {
        const gl = this.gl;

        this._updateVertices();

        gl.useProgram(this.program);

        this.setUniforms(viewMatrix3x3);
        this.updateAttribPointers();

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

const f = 1 / 255;

function hex2rgb(hex, rgb = new RGB()) {
    rgb.r = (hex >> 16 & 255) * f;
    rgb.g = (hex >> 8 & 255) * f;
    rgb.b = (hex & 255) * f;

    return rgb;
}