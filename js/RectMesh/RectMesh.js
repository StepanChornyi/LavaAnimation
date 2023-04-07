import { Matrix, RGB, Vector } from "black-engine";
import WEBGL_UTILS from '../WebGL/WebglUtils';
import Mesh from "../WebGL/Mesh";

import vs from "./baseRect.vs.glsl";
import fs from "./baseRect.fs.glsl";
import Mesh2D from "../Mesh2D/Mesh2D";

const currentConfig = {
    attribs: [
        {
            name: 'vertPosition',
            size: 2
        },
        {
            name: 'vertColor',
            size: 3
        },
        {
            name: 'vertUv',
            size: 2
        }
    ]
};

const RECT_INDICES = [0, 1, 2, 2, 3, 0];
const RECT_INDICES_FLIPPED = [0, 1, 3, 1, 2, 3];

export default class RectMesh extends Mesh2D {
    constructor(gl, program = WEBGL_UTILS.createProgram(gl, vs, fs), config = currentConfig) {
        super(gl, program, config);

        this.width = 0;
        this.height = 0;
        this.colors = [new RGB(), new RGB(), new RGB(), new RGB()];
        this.dirty = true;

        this.indices = [...RECT_INDICES];
    }

    initUniformsAndAttribs(config) {
        super.initUniformsAndAttribs(Mesh.mergeConfigs(config, currentConfig));
    }

    setSize(width = this.width, height = width) {
        this.width = width;
        this.height = height;

        this.dirty = true;

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

    _updateBuffers() {
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

    static get vs() {
        return vs;
    }

    static get RECT_INDICES() {
        return RECT_INDICES;
    }

    static get RECT_INDICES_FLIPPED() {
        return RECT_INDICES_FLIPPED;
    }
}

const f = 1 / 255;

function hex2rgb(hex, rgb = new RGB()) {
    rgb.r = (hex >> 16 & 255) * f;
    rgb.g = (hex >> 8 & 255) * f;
    rgb.b = (hex & 255) * f;

    return rgb;
}