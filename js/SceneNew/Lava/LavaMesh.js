import { Component, DisplayObject, Black, Vector, Rectangle, Matrix, Circle, MathEx } from 'black-engine';

import WEBGL_UTILS from '../../scene/utils/webgl-utils';

import BaseRectMesh from '../BaseRectMesh/BaseRectMesh';

import vs from "./lava.vs.glsl";
import fs from "./lava.fs.glsl";

export default class LavaMesh extends BaseRectMesh {
    constructor(gl) {
        super(gl, WEBGL_UTILS.createProgram(gl, vs, fs));

        // WEBGL_UTILS.createProgram()

        this.setSize(gl.canvas.width, gl.canvas.height);
        this.setColors(0x9d0000, 0xffff25, 0xcc0bcc, 0x1b1b7f)

        this.x = gl.canvas.width * Math.random();
        this.y = gl.canvas.height * Math.random();

        this.sx = (0.5 + Math.random() * 2) * (Math.random() < 0.5 ? -1 : 1);
        this.sy = (0.5 + Math.random() * 2) * (Math.random() < 0.5 ? -1 : 1);

        this.circle1 = new Circle(gl.canvas.width * 0.5, gl.canvas.height * 0.5, 20);
        this.circle2 = new Circle(gl.canvas.width * 0.5 + 150, gl.canvas.height * 0.5, 100);


        window.addEventListener('mousemove', e => {
            this.circle2.x = e.clientX;
            this.circle2.y = e.clientY;
        })


        // this.transform.skew(2, 1);
    }

    setUniforms(viewMatrix3x3) {
        super.setUniforms(viewMatrix3x3);

        const g0UniformPos = this.gl.getUniformLocation(this.program, `ground0`);
        const g1UniformPos = this.gl.getUniformLocation(this.program, `ground1`);

        let dist = MathEx.distance(this.circle1.x, this.circle1.y, this.circle2.x, this.circle2.y) - this.circle1.r - this.circle2.r;
        let f1 = 1;
        let f2 = 1;

        // if (dist < 0) {
        //     f1 = ((this.circle1.r+dist) / this.circle1.r)*0.5;
        //     f2 = ((this.circle2.r+dist) / this.circle2.r)*0.5;
        // }

        this.gl.uniform3f(g0UniformPos,
            this.circle1.x,
            this.circle1.y,
            this.circle1.r * f1
        );
        this.gl.uniform3f(g1UniformPos,
            this.circle2.x,
            this.circle2.y,
            this.circle2.r * f2
        );
    }

    render(viewMatrix3x3) {
        super.render(viewMatrix3x3);
    }
}