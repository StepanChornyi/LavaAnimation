import vs from "./fullScreenImage.vs.glsl";
import fs from "./fullScreenImage.fs.glsl";
import WEBGL_UTILS from "../../WebGL/WebglUtils";
import Mesh from "../../WebGL/Mesh";
import RectMesh from "../../RectMesh/RectMesh";

const currentConfig = {
    attribs: [
        {
            name: 'vertPosition',
            size: 2
        },
        {
            name: 'vertUv',
            size: 2
        }
    ]
};

export default class FullScreenImage extends Mesh {
  constructor(gl) {
    super(gl, WEBGL_UTILS.createProgram(gl, vs, fs), currentConfig);

    this.texture = null;

    this.indices = RectMesh.RECT_INDICES;

    this.vertices = [
        -1, 1, 0, 1,
        1, 1, 1, 1,
        1, -1, 1, 0,
        -1, -1, 0, 0,
    ];

    this.drawBuffersData();
  }

  setUniforms() {
    const gl = this.gl;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // gl.uniform1i(gl.getUniformLocation(this.program, "spriteTexture"), 0);
  }

  render(viewMatrix3x3) {
    this.setUniforms();

    super.render(viewMatrix3x3);
  }
}