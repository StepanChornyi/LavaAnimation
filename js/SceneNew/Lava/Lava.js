import { Component, DisplayObject, Black, Vector, Rectangle } from 'black-engine';

import WEBGL_UTILS from '../../scene/utils/webgl-utils';

import vs from "./test.vs.glsl";
import fs from "./test.fs.glsl";

export default class Lava extends DisplayObject {
    constructor(gl) {
        super();

        this.touchable = true;

        this.gl = gl;


        this.testMesh = new RectMesh(gl);

        this._init();
    }

    _init() {

    }

    render(camera) {

        this.testMesh.render();
    }
}

class Mesh {
    constructor(gl, program) {
        this.gl = gl;

        this.program = program;
        this.vertexBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();

        this.vertices = [];
        this.indices = [];
    }

    drawBuffersData() {
        const gl = this.gl;

        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }

    updateAttribPointers() {
        this.bindIndexBuffer();
    }

    bindIndexBuffer() {
        const gl = this.gl;

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    }

    render(camera, count = this.indices.length, offset = 0) {
        const gl = this.gl;

        gl.useProgram(this.program);

        this.updateAttribPointers();

        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, offset);
    }
}

class RectMesh extends Mesh {
    constructor(gl) {
        super(gl, WEBGL_UTILS.createProgram(gl, vs, fs));

        this.gl = gl;

        this.position = new Vector(100, 100);

        this.setSize(500, 500);
    }

    setSize(width, height) {
        this.vertices = [
            0, 0, 1, 0, 0,
            width, 0, 0, 1, 0,
            width, height, 0, 0, 1,
            0, height, 0, 1, 1,
        ];

        this.indices = [
            0, 1, 2,
            2, 3, 0
        ];

        this.drawBuffersData();
    }

    updateAttribPointers() {
        super.updateAttribPointers();

        const gl = this.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        const positionAttribLocation = gl.getAttribLocation(this.program, 'vertPosition');
        const colorAttribLocation = gl.getAttribLocation(this.program, 'vertColor');

        gl.vertexAttribPointer(
            positionAttribLocation,
            2,
            gl.FLOAT,
            gl.FALSE,
            5 * Float32Array.BYTES_PER_ELEMENT,
            0
        );

        gl.vertexAttribPointer(
            colorAttribLocation,
            3,
            gl.FLOAT,
            gl.FALSE,
            5 * Float32Array.BYTES_PER_ELEMENT,
            2 * Float32Array.BYTES_PER_ELEMENT
        );

        gl.enableVertexAttribArray(positionAttribLocation);
        gl.enableVertexAttribArray(colorAttribLocation);

    }

    render() {
        const gl = this.gl;
        const { width, height } = gl.canvas;

        gl.useProgram(this.program);

        const uniformPos = gl.getUniformLocation(this.program, `transform`);

        gl.uniform4f(uniformPos, this.position.x, this.position.y, 1 / width, 1 / height);

        this.updateAttribPointers();

        gl.colorMask(true, true, true, false);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}

