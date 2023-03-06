import { Component, DisplayObject, Black, MathEx, Vector } from 'black-engine';
import P5Noise from '../libs/p5-noise';
import WorldMesh from './lava-mesh';

let gl = null;

export default class World {
  constructor(gl_context) {
    gl = gl_context;

    this.mesh = new WorldMesh(gl);

    this.perlinNoise = new P5Noise();

    this.width = 0;
    this.height = 0;

    this.points = [];
  }

  render(camera) {
    this.mesh.render(camera);
  }

  onUpdate() {

  }

  onResize(width, height) {
    // const radius = width * 0.9;
    // const vertices = this.mesh.vertices;
    // const indices = this.mesh.indices;

    // this.width = width;
    // this.height = height;

    // this._generatePoints();

    // vertices.splice(0);
    // indices.splice(0);

    // for (let i = 0; i < this.points.length; i++) {
    //   const { x, y } = this.points[i];

    //   vertices.push(
    //     -1 + (2 * x) / width, 1 - (2 * y) / height, 0, 1, 0
    //   );

    //   indices.push(i);
    // }

    // for (let angle = 0; angle < 360; angle++) {
    //   const s = Math.sin(MathEx.DEG2RAD * angle);
    //   const c = Math.cos(MathEx.DEG2RAD * angle);

    //   const x = width * 0.5 + radius * c - 0 * s;
    //   const y = height * 0.5 + radius * s + 0 * c;

    //   vertices.push(
    //     (x - width * 0.5) / width, (y - height * 0.5) / height, 0.8, 0, Math.random()
    //   );

    //   indices.push(angle);
    // }

    this.mesh.drawBuffersData();
  }

  _generatePoints() {
    const pointsOffset = 3;
    const pointsCount = this.width / pointsOffset + 1;

    for (let i = 0, x, y; i < pointsCount; i++) {
      x = i * pointsOffset;
      y = this.height * 0.1 + 400 * this.perlinNoise.noise(i * 0.1);

      if (this.points[i]) {
        this.points[i].set(x, y);
      } else {
        this.points.push(new Vector(x, y));
      }
    }

    this.points.splice(pointsCount);
  }
}