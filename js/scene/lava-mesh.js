import Mesh from './mesh';
import WEBGL_UTILS from './utils/webgl-utils';
import { Black, ColorHelper, Ease, Vector } from "black-engine";
import UTween from '../libs/utween';

const vsText = `
precision mediump float;

attribute vec2 vertPosition;
attribute vec3 vertColor;

varying vec2 vertPos;
varying vec3 fragColor;

void main() {
  fragColor = vertColor;
  vertPos = vertPosition.xy;
  gl_Position = vec4(vertPosition.xy, 1.0, 1.0);
}
`;

const fsText = `
precision mediump float;

uniform vec2 size;
uniform vec3 glowColorBottom;
uniform vec3 glowColorTop;

uniform vec3 ground0;
uniform vec3 ground1;
uniform vec3 ground2;
uniform vec3 ground3;
uniform vec3 ground4;
uniform vec3 ground5;
uniform vec3 ground6;
uniform vec3 ground7;

uniform mat4 bubble0X;
uniform mat4 bubble0Y;
uniform mat4 bubble0R;

uniform mat4 bubble1X;
uniform mat4 bubble1Y;
uniform mat4 bubble1R;

uniform mat4 bubble2X;
uniform mat4 bubble2Y;
uniform mat4 bubble2R;

varying vec2 vertPos;
varying vec3 fragColor;

float lerp(float a, float b, float k){
  return a + (b - a) * k;
}

vec3 lerp3(vec3 a, vec3 b, float k){
  return vec3(lerp(a.x, b.x, k), lerp(a.y, b.y, k), lerp(a.z, b.z, k));
}

float quadraticOutEase(float k) {
  return k * (2.0 - k);
}

float blendDist( float a, float b, float k ){
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return lerp( b, a, h ) - k*h*(1.0-h);
}

float distToCircle(vec3 circle, vec2 p) {
  return distance(p, circle.xy) - circle.z;
}

float distToRect( vec4 rect, vec2 p) {
  vec2 o = abs(p-rect.xy) - rect.zw;
  float ud = length(max(o,0.0));
  float n = max(min(o.x,0.0),min(o.y,0.0));

  return ud+n;
}

void main() {
  vec2 pos = vec2(
    (vertPos.x*0.5 +0.5)*size.x,
    (-vertPos.y*0.5 +0.5)*size.y
  );

  vec4 baseRect = vec4(size.x * 0.5, size.y, size.x, 50);

  float baseDist = distToRect(baseRect, pos);

  float g1 = blendDist(distToCircle(ground0, pos), distToCircle(ground1, pos), 100.0);
  float g2 = blendDist(distToCircle(ground2, pos), distToCircle(ground3, pos), 100.0);
  float g3 = blendDist(distToCircle(ground4, pos), distToCircle(ground5, pos), 100.0);
  float g4 = blendDist(distToCircle(ground6, pos), distToCircle(ground7, pos), 100.0);
  float g5 = blendDist(g1, g2, 100.0);
  float g6 = blendDist(g3, g4, 100.0);
  float g7 = blendDist(g5, g6, 100.0);

  float bubble;

  for(float i = 0.0 ; i < 4.0; i++){
    for(float j = 0.0 ; j < 4.0; j++){
      bubble = distToCircle(vec3(bubble0X[int(i)][int(j)], bubble0Y[int(i)][int(j)], bubble0R[int(i)][int(j)]), pos);
      baseDist = blendDist(baseDist, bubble, 100.0);
    }
  }

  for(float i = 0.0 ; i < 4.0; i++){
    for(float j = 0.0 ; j < 4.0; j++){
      bubble = distToCircle(vec3(bubble1X[int(i)][int(j)], bubble1Y[int(i)][int(j)], bubble1R[int(i)][int(j)]), pos);
      baseDist = blendDist(baseDist, bubble, 100.0);
    }
  }

  for(float i = 0.0 ; i < 4.0; i++){
    for(float j = 0.0 ; j < 4.0; j++){
      bubble = distToCircle(vec3(bubble2X[int(i)][int(j)], bubble2Y[int(i)][int(j)], bubble2R[int(i)][int(j)]), pos);
      baseDist = blendDist(baseDist, bubble, 100.0);
    }
  }

  baseDist = blendDist(g7, baseDist, 100.0);

  float glowSize = 1.5;
  float bloomSize = 3.0;
  float colorMixFactor = (pos.y/size.y)-0.3;

  if(baseDist < 0.0){
      gl_FragColor = vec4(lerp3(glowColorBottom, glowColorTop, colorMixFactor), 1.0);
  } else if(baseDist <= glowSize){
    vec3 colTop = vec3(0.85098,  0.03921, 0.08627);
    vec3 colBot= vec3(0.9490, 0.7960, 0.03921);

    float glowFactor = quadraticOutEase(1.0 - baseDist/glowSize);
    vec3 glowColor = lerp3(lerp3( colTop,colTop, colorMixFactor), lerp3(glowColorBottom, glowColorTop, colorMixFactor), glowFactor);

    gl_FragColor = vec4(glowColor, glowFactor);
  }else if(baseDist <= bloomSize){
    vec3 col = vec3(0.8313, 0.05882, 0.3921);

    float glowFactor = quadraticOutEase(1.0 - baseDist/bloomSize)*0.3;

    gl_FragColor = vec4(col, glowFactor);
  }else{
    gl_FragColor = vec4(0.9, 0.9, 0.9, 0.0);
  }
}
`;

let gl = null;

const topColor = normalizeColor(ColorHelper.hex2rgb(0xf0851a));
const glowColor = normalizeColor(ColorHelper.hex2rgb(0xe33246));

let isMouseMoved = false;
let prevMousePos = new Vector();
let tmpVec = new Vector();
let tmpMat43D = { x: [], y: [], z: [] };

const ground = [];
const bubbles = [];

export default class WorldMesh extends Mesh {
  constructor(gl_context) {
    gl = gl_context;

    super(gl, WEBGL_UTILS.createProgram(gl, vsText, fsText));

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

    for (let i = 0; i < 48; i++) {
      bubbles.push({
        x: window.innerWidth * Math.random(),
        y: window.innerHeight * (Math.random() + 0.8),
        r: 30 + 30 * Math.random(),
        s: 1,
        vx: 0,
        vy: 0,
        tw: null
      });
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