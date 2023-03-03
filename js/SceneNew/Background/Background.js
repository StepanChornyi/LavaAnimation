import BaseRectMesh from "../BaseRectMesh/BaseRectMesh";

const topColor = 0xb13d3d;
const bottomColor = 0x32146e;

export default class Background extends BaseRectMesh {
  constructor(gl) {
    super(gl);

    this.setSize(gl.canvas.width, gl.canvas.height);
    this.setColors(topColor, topColor, bottomColor, bottomColor)
  }

  render(viewMatrix3x3) {
    if (this.gl.canvas.width !== this.width || this.gl.canvas.height !== this.height) 
      this.setSize(this.gl.canvas.width, this.gl.canvas.height);

    super.render(viewMatrix3x3);
  }
}