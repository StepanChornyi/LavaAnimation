import { Component, DisplayObject, Black, Vector, Rectangle, Matrix, MathEx, ColorHelper, GameObject } from 'black-engine';
import RectMesh from '../RectMesh/RectMesh';


import vs from './circleMesh.vs.glsl';
import fs from './circleMesh.fs.glsl';
import WEBGL_UTILS from '../WebGL/WebglUtils';
import Mesh from '../WebGL/Mesh';
import Mesh2D from '../Mesh2D/Mesh2D';
import RenderTexture from '../WebGL/RenderTexture';
import FullScreenImage from '../Scene/FullScreenImage/FullScreenImage';


export default class Lava {
    constructor(gl) {
        this.gl = gl;

        this.circle = new SDF_Circle(gl);
        this.circle.setRadius(150);
        this.circle.transform.setTranslation(500, 500);

        this.circle2 = new SDF_Circle(gl);
        this.circle2.setRadius(300);
        this.circle2.transform.setTranslation(300, 400);

        this.circle3 = new SDF_Circle(gl);
        this.circle3.setRadius(250);

        this.circle3Center = new Vector(600, 600);
        this.spinRadius = 300;
        this.angle = -2.5;

        this.circle4 = new SDF_Circle(gl);
        this.circle4.setRadius(300);

        this.circle4Center = new Vector(600, 600);
        this.spinRadius2 = 280;
        this.angle2 = -2.5;


        this.target1 = new RenderTexture(gl);
        this.target2 = new RenderTexture(gl);

        this.image = new FullScreenImage(gl, true);

        window.onmousemove = (evt) => this.circle.transform.setTranslation(evt.x, evt.y)
    }

    onUpdate() {
        this.angle += 0.001;
        this.angle2 += 0.001;

        this.circle3.transform.setTranslation(
            this.circle3Center.x + Math.sin(this.angle) * this.spinRadius,
            this.circle3Center.y + Math.cos(this.angle) * this.spinRadius
        )

        this.circle4.transform.setTranslation(
            this.circle4Center.x + Math.sin(this.angle2) * this.spinRadius2,
            this.circle4Center.y + Math.cos(this.angle2) * this.spinRadius2
        )
    }

    render(viewMatrix3x3) {
        const gl = this.gl;

        this.onUpdate();

        const targets = [
            this.target2.bindFramebuffer(false).clear(),
            this.target1.bindFramebuffer(false).clear()
        ]

        let lastActiveTarget = null;

        const circles = [this.circle, this.circle2, this.circle3,    this.circle4];

        for (let i = 0; i < circles.length; i++) {
            const [currentTarget, prevTarget] = targets;
            
            currentTarget.bindFramebuffer(false).clear();

            this.image.texture = prevTarget.texture;
            this.image.render(viewMatrix3x3);
    
            circles[i].texture = prevTarget.texture;
            circles[i].render(viewMatrix3x3);

            targets.push(targets.shift());

            lastActiveTarget = currentTarget
        }

        // this.target1.bindFramebuffer().clear();


        // this.circle.texture = this.target2.texture;
        // this.circle.render(viewMatrix3x3);

        // this.target2.bindFramebuffer().clear();

        // this.image.texture = this.target1.texture;
        // this.image.render(viewMatrix3x3);

        // this.circle2.texture = this.target1.texture;
        // this.circle2.render(viewMatrix3x3);

        WEBGL_UTILS.bindViewBuffer(gl);

        this.image.texture = lastActiveTarget.texture;
        this.image.render(viewMatrix3x3);
    }

    onResize(width, height) {
        this.target1.setSize(width, height);
        this.target2.setSize(width, height);
    }
}

const myTexUnf = "myTex";

const uniforms = [myTexUnf];

const currentConfig = {
    attribs: [
        {
            name: 'vertPosition',
            size: 3
        }
    ],
    uniforms
};

class SDF_Circle extends Mesh2D {
    constructor(gl) {
        super(gl, WEBGL_UTILS.createProgram(gl, vs, fs), currentConfig);

        this.texture = null;

        this.indices = RectMesh.RECT_INDICES;

        this.dirty = true;
        this.radius = 1;

        this.drawBuffersData();
    }

    setRadius(r) {
        if (this.radius === r)
            return;

        this.radius = r;
        this.dirty = true;
    }

    setUniforms(_) {
        super.setUniforms(_);

        const { gl, uniforms } = this;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.uniform1i(uniforms[myTexUnf].location, 0);
    }

    _updateBuffers() {
        if (!this.dirty)
            return;

        this.vertices = [
            -this.radius, -this.radius, this.radius,
            this.radius, -this.radius, this.radius,
            this.radius, this.radius, this.radius,
            -this.radius, this.radius, this.radius,
        ];

        this.drawBuffersData();

        this.dirty = false;
    }
}