import { Vector } from "black-engine";
import SpriteGl from "../SpriteGL/SpriteGl";

// const topColor = 0xb13d3d;
// const bottomColor = 0x32146e;

import fs from "./skipFilterSprite.fs.glsl";

export default class SkipFitterSprite extends SpriteGl {
    constructor(gl) {
        super(gl, fs);

        this.offset = new Vector(0, 0);
    }

    setOffset(x, y) {
        this.offset.x = this.width ? -x / this.width : 0;
        this.offset.y = this.height ? -y / this.height : 0;
    }

    setUniforms(viewMatrix3x3) {
        super.setUniforms(viewMatrix3x3);

        const gl = this.gl;

        gl.uniform2f(gl.getUniformLocation(this.program, "offset"), this.offset.x, this.offset.y);
    }

    render(viewMatrix3x3) {
        super.render(viewMatrix3x3);
    }
}