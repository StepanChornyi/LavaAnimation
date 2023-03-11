import BaseRectMesh from "../../RectMesh/RectMesh";

// const topColor = 0xb13d3d;
// const bottomColor = 0x32146e;

import vs from "./spriteGl.vs.glsl";
import fs from "./spriteGl.fs.glsl";
import WEBGL_UTILS from "../../WebGL/WebglUtils";

const topColor = 0x151111;
const bottomColor = 0x2e1607;

export default class SpriteGl extends BaseRectMesh {
  constructor(gl, fragment = fs) {
    super(gl, WEBGL_UTILS.createProgram(gl, vs, fragment));

    this.texture = null;

    this.setColors(0xff0000, 0x0000ff, 0xffff00, 0xff00ff)
  }

  setUniforms(viewMatrix3x3) {
    super.setUniforms(viewMatrix3x3);

    const gl = this.gl;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    gl.uniform1i(gl.getUniformLocation(this.program, "spriteTexture"), 0);
  }

  render(viewMatrix3x3) {
    super.render(viewMatrix3x3);
  }
}