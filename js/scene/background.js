import { ColorHelper } from "black-engine";
import Mesh from "./mesh";
import WEBGL_UTILS from "./utils/webgl-utils";

const vsText = `
precision mediump float;

attribute vec2 vertPosition;
attribute vec3 vertColor;

varying vec3 fragColor;

uniform mat4 mProj;

void main() {
  fragColor = vertColor;

  gl_Position = vec4(vertPosition.xy, 1.0, 1.0);
}
`;

const fsText = `
precision mediump float;

varying vec3 fragColor;

void main() {
  gl_FragColor = vec4(fragColor.xyz, 1.0);
}
`;

let gl = null;

const topColor = normalizeColor(ColorHelper.hex2rgb(0x151111));
const bottomColor = normalizeColor(ColorHelper.hex2rgb(0x2e1607));

export default class Background extends Mesh {
  constructor(gl_context) {
    gl = gl_context;

    super(gl, WEBGL_UTILS.createProgram(gl, vsText, fsText));

    this.vertices.push(
      1, 1, topColor.r, topColor.g, topColor.b,
      -1, 1, topColor.r, topColor.g, topColor.b,
      1, -1, bottomColor.r, bottomColor.g, bottomColor.b,
      -1, -1, bottomColor.r, bottomColor.g, bottomColor.b,
    );

    this.indices.push(0, 1, 2, 1, 2, 3);

    this.drawBuffersData();
  }

  updateAttribPointers() {
    super.updateAttribPointers();

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

  render(camera, count = this.indices.length, offset = 0) {
    gl.useProgram(this.program);

    this.updateAttribPointers();

    gl.colorMask(true, true, true, false);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);

    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, offset);
  }
}

function normalizeColor(rgb) {
  rgb.r = rgb.r / 255;
  rgb.g = rgb.g / 255;
  rgb.b = rgb.b / 255;

  return rgb;
}