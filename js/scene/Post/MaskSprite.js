import { Vector } from "black-engine";
import SpriteGl from "../SpriteGL/SpriteGl";

// const topColor = 0xb13d3d;
// const bottomColor = 0x32146e;

import fs from "./maskSprite.fs.glsl";

export default class MaskSprite extends SpriteGl {
    constructor(gl) {
        super(gl, fs);

        this.maskTexture = null;
    }

    setUniforms(viewMatrix3x3) {
        super.setUniforms(viewMatrix3x3);

        const gl = this.gl;

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.maskTexture);

        gl.uniform1i(gl.getUniformLocation(this.program, "maskTexture"), 1);
    }

    render(viewMatrix3x3) {
        super.render(viewMatrix3x3);
    }
}