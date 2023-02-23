import Mesh from './mesh';
import WEBGL_UTILS from './utils/webgl-utils';
import { Black, ColorHelper, Ease, Graphics, Vector } from "black-engine";
import UTween from '../libs/utween';

import vs from "./lava.vs.glsl";
import fs from "./lava.fs.glsl";

let gl = null;

const topColor = normalizeColor(ColorHelper.hex2rgb(0xf0851a));
const glowColor = normalizeColor(ColorHelper.hex2rgb(0xe33246));

let isMouseMoved = false;
let prevMousePos = new Vector();
let tmpVec = new Vector();
let tmpMat43D = { x: [], y: [], z: [] };

const ground = [];
const bubbles = [];
const graphics = [];

export default class WorldMesh extends Mesh {
  constructor(gl_context, container) {
    gl = gl_context;

    super(gl, WEBGL_UTILS.createProgram(gl, vs, fs));

    this.vertices.push(1, 1, -1, 1, 1, -1, -1, -1,);
    this.indices.push(0, 1, 2, 1, 2, 3);

    this.drawBuffersData();

    for (let i = 0; i < 8; i++) {
      ground.push({
        x: (window.innerWidth / 6) * (i + Math.random() * 0.5),
        y: window.innerHeight * (0.9 + 0.1 * Math.random()),
        r: 80 + 90 * Math.random(),
        d: Math.random() < 0.5 ? -1 : 1,
        sX: 0.5 + Math.random()
      });
    }

    for (let i = 0; i < ground.length; i++) {
      this._animateGround(ground[i]);
    }

    for (let i = 0; i < 24; i++) {
      bubbles.push({
        x: window.innerWidth * Math.random(),
        y: window.innerHeight * (Math.random() + 0.8),
        r: 30 + 30 * Math.random(),
        s: 1,
        vx: 0,
        vy: 0,
        tw: null
      });

      const g = new Graphics();

      g.fillStyle(0x00ff00, 0.5);
      g.beginPath();
      g.circle(0, 0, 1);
      g.closePath();
      g.fill();

      container.add(g);

      graphics.push(g);
    }
  }

  _animateGround(g) {
    new UTween(g, { s: 1.3 }, 10 + 5 * Math.random(), {
      ease: Ease.sinusoidalInOut,
      loop: true,
      yoyo: true,
      ease: Ease.sinusoidalInOut,
    });

    new UTween(g, { y: g.y + (Math.random() * 0.5) * 200 }, 5 + 10 * Math.random(), {
      ease: Ease.quarticInOut,
      yoyo: true,
      loop: true
    });
  }

  updateAttribPointers() {
    super.updateAttribPointers();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    const positionAttribLocation = gl.getAttribLocation(this.program, 'vertPosition');

    gl.vertexAttribPointer(
      positionAttribLocation,
      2,
      gl.FLOAT,
      gl.FALSE,
      2 * Float32Array.BYTES_PER_ELEMENT,
      0
    );

    gl.enableVertexAttribArray(positionAttribLocation);
  }

  render(camera, count = this.indices.length, offset = 0) {
    gl.useProgram(this.program);

    this.updateAttribPointers();

    gl.colorMask(true, true, true, true);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.CULL_FACE);

    const sizeUniformLocation = gl.getUniformLocation(this.program, 'size');
    const glowColorBottomUniformLocation = gl.getUniformLocation(this.program, 'glowColorBottom');
    const glowColorTopUniformLocation = gl.getUniformLocation(this.program, 'glowColorTop');

    for (let i = 0; i < ground.length; i++) {
      const { x, y, r, d, sX } = ground[i];

      ground[i].x += sX * d;

      if (d < 0 && ground[i].x < -ground[i].r * 2) {
        ground[i].x = window.innerWidth + ground[i].r * 2;
      } else if (d > 0 && ground[i].x > window.innerWidth + ground[i].r * 2) {
        ground[i].x = -ground[i].r * 2;
      }

      const groundUniformLocation = gl.getUniformLocation(this.program, 'ground' + i);

      gl.uniform3f(groundUniformLocation, x, y, r);
    }

    tmpMat43D.x.splice(0);
    tmpMat43D.y.splice(0);
    tmpMat43D.z.splice(0);

    isMouseMoved = !prevMousePos.equals(tmpVec.set(Black.input.pointerX, Black.input.pointerY), 0.5);
    prevMousePos.set(Black.input.pointerX, Black.input.pointerY);


    for (let i = 0; i < bubbles.length; i++) {
      const bubble = bubbles[i];

      if (isMouseMoved) {
        this._updateBubbleToMouse(bubble);
      }

      bubbles[i].vy -= 1 / bubble.r;

      bubbles[i].vx *= 0.98;
      bubbles[i].vy *= 0.98;

      bubbles[i].x += bubbles[i].vx;
      bubbles[i].y += bubbles[i].vy;
      bubbles[i].s = 0.5 + bubbles[i].y / window.innerHeight;

      if (bubble.y < -bubble.r * 2 || bubble.s <= 0.0001) {
        bubble.x = window.innerWidth * Math.random();
        bubble.y = window.innerHeight + bubble.r * 2 + 100;
        bubble.s = 1;
      }

      graphics[i].x = bubbles[i].x;
      graphics[i].y = bubbles[i].y;
      graphics[i].scale = bubbles[i].r * bubbles[i].s;

      const matIndex = i % 16;

      tmpMat43D.x[matIndex] = bubble.x;
      tmpMat43D.y[matIndex] = bubble.y;
      tmpMat43D.z[matIndex] = bubble.r * bubble.s;

      if (matIndex === 15) {
        const bubblesXUniformLocation = gl.getUniformLocation(this.program, `bubble${Math.floor(i / 16)}X`);
        const bubblesYUniformLocation = gl.getUniformLocation(this.program, `bubble${Math.floor(i / 16)}Y`);
        const bubblesRUniformLocation = gl.getUniformLocation(this.program, `bubble${Math.floor(i / 16)}R`);

        gl.uniformMatrix4fv(bubblesXUniformLocation, gl.FALSE, tmpMat43D.x);
        gl.uniformMatrix4fv(bubblesYUniformLocation, gl.FALSE, tmpMat43D.y);
        gl.uniformMatrix4fv(bubblesRUniformLocation, gl.FALSE, tmpMat43D.z);
      }
    }

    gl.uniform2f(sizeUniformLocation, window.innerWidth, window.innerHeight);
    gl.uniform3f(glowColorBottomUniformLocation, glowColor.r, glowColor.g, glowColor.b);
    gl.uniform3f(glowColorTopUniformLocation, topColor.r, topColor.g, topColor.b);

    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, offset);

    gl.colorMask(true, true, true, false);
  }

  _updateBubbleToMouse(bubble) {
    tmpVec.set(Black.input.pointerX, Black.input.pointerY);

    const snapRange = 200;

    const dx = tmpVec.x - bubble.x;
    const dy = tmpVec.y - bubble.y;

    if (Math.abs(dx) > snapRange || Math.abs(dy) > snapRange) {
      return;
    }

    tmpVec.set(dx, dy);

    const length = tmpVec.length();

    if (length > snapRange) {
      return;
    }

    tmpVec.x /= length;
    tmpVec.y /= length;

    const distMul = Ease.sinusoidalInOut(length / snapRange);

    bubble.vx += tmpVec.x * 0.2 * distMul;
    bubble.vy += tmpVec.y * 0.2 * distMul;

    bubble.x += tmpVec.x * 0.5 * distMul;
    bubble.y += tmpVec.y * 0.5 * distMul;
  }
}

function normalizeColor(rgb) {
  rgb.r = rgb.r / 255;
  rgb.g = rgb.g / 255;
  rgb.b = rgb.b / 255;

  return rgb;
}