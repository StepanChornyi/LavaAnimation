import { Component, DisplayObject, Black, Graphics, Vector, Ease, Rectangle, CapsStyle } from 'black-engine';
import P5Noise from '../libs/p5-noise';

export default class Test extends DisplayObject {
  constructor() {
    super();

    this.perlinNoise = new P5Noise();

    this.touchable = true;
    this.pressedPoint = null;
    this.pressPos = new Vector();
    this.startPos = new Vector();
    this.currPos = new Vector();

    this.points = [];

    this.groups = [];

    // for (let i = 0; i < 6; i++) {
    //   const point = new LiqPoint();

    //   const x = 200;
    //   const y = 200;
    //   const r = 50;
    //   const angle = Math.PI * 2 * (i / 6);

    //   const s = Math.sin(angle);
    //   const c = Math.cos(angle);

    //   point.x = x + 0 * c - r * s;
    //   point.y = y + 0 * s + r * c;

    //   this.group.push(point);
    // }

    this.droplet = new LiqPoint();

    this._init();
  }

  _init() {
    this._initInput();

    const pointsCount = 100;

    for (let i = 0; i < pointsCount; i++) {
      const point = new LiqPoint();

      point.x = point.startX = 20 + 10 * i;
      point.y = point.startY = 0;


      this.points.push(point);
    }

    this.droplet.index = Math.round(5 + (this.points.length - 10) * Math.random());
    this.droplet.x = this.points[this.droplet.index].x;
    this.droplet.y = this.points[this.droplet.index].y;


    this.g = this.addChild(new Graphics());
    this.g.touchable = true;

    this._slider = this.addChild(new Slider());
    this._slider.tune = Math.random();

    this._slider.on('tune', () => this._updateDroplet());
  }

  _initInput() {
    this.on('pointerDown', (_, pointerInfo) => {
      const pos = this.globalToLocal(pointerInfo);

      let minDist = Infinity;
      let closestPoint = null;

      for (let i = 0, dist; i < this.points.length; i++) {
        dist = pos.distance(this.points[i]);

        if (dist < minDist) {
          minDist = dist;
          closestPoint = this.points[i];
        }
      }

      if (closestPoint && minDist < 100) {
        this.pressPos = pos;
        this.startPos = closestPoint.clone();
        this.pressedPoint = closestPoint;
      }
    });

    window.anim = {
      separationTime: 0.5,
      pointsCount: 5,
      pointsOffset: 1,
      frames: [
        {
          time: 0.33,
          array: [{ "x": 3, "y": 10 }, { "x": 2, "y": 25 }, { "x": -5, "y": 45 }, { "x": 0, "y": 54 }, { "x": 3, "y": 44 }, { "x": -4, "y": 27 }, { "x": -3, "y": 10 }]
        },
        {
          time: 0.5,
          array: [{ "x": 3, "y": 10 }, { "x": 21, "y": 37 }, { "x": -15, "y": 55 }, { "x": -6, "y": 74 }, { "x": 8, "y": 56 }, { "x": -31, "y": 37 }, { "x": -3, "y": 10 }]
        },
        {
          time: 0.505,
          array: [{ "x": 3, "y": 10 }, { "x": 10, "y": 37 }, { "x": 1, "y": 38 }, { "x": -6, "y": 38 }, { "x": -13, "y": 39 }, { "x": -20, "y": 38 }, { "x": -3, "y": 10 }]
        }
      ]
    }

    this.on('pointerUp', () => {
      this.pressedPoint = null;

      const data = [];

      for (let i = 0; i < this.points.length; i++) {
        const point = this.points[i];

        if (point.x === point.startX && point.y === point.startY) {
          continue;
        }

        data.push({
          x: Math.round(point.x - point.startX),
          y: Math.round(point.y - point.startY),
        });
      }

      console.log(JSON.stringify(data));
    });
  }

  onUpdate() {
    // this._updateDroplet();
    for (let i = 0; i < this.groups.length; i++) {
      const group = this.groups[i];

      for (let j = 0; j < group.length; j++) {
        group[j].vy += 0.07;
        group[j].y += group[j].vy;
        group[j].vy *= 0.95;
      }
    }

    this._updateDrag();
    this._drawPoints();
  }

  _updateDroplet() {
    const droplet = this.droplet;
    const points = this.points;

    droplet.visible = false;

    const index = droplet.index;
    const frames = anim.frames;
    const iOffset = Math.floor(frames[0].array.length * 0.5);
    const p = this._slider.tune;

    const [A, B] = this._getData(frames, p);

    if (this.prevFrameP <= anim.separationTime && p > anim.separationTime) {
      this._spawnGroup(this._getData(frames, this.prevFrameP), anim.pointsCount, anim.pointsOffset, index);
    }

    const minT = A ? A.time : 0;
    const maxT = B ? B.time : 1;
    const t = (p - minT) / (maxT - minT);

    this.prevFrameP = p;

    for (let i = -iOffset, point, j; i <= iOffset; i++) {
      point = this.points[index + i];
      j = i + iOffset;

      if (!A) {
        point.x = point.startX + B.array[j].x * t;
        point.y = point.startY + B.array[j].y * t;
      } else if (!B) {
        point.x = lerp(point.startX + A.array[j].x, point.startX, t);
        point.y = lerp(point.startY + A.array[j].y, point.startY, t);
      } else {
        point.x = point.startX + lerp(A.array[j].x, B.array[j].x, t);
        point.y = point.startY + lerp(A.array[j].y, B.array[j].y, t);
      }
    }
  }

  _getData(frames, time) {
    let A = null;
    let B = null;

    for (let i = 0; i < frames.length; i++) {
      if (frames[i].time < time) {
        A = frames[i];
      }

      if (frames[frames.length - i - 1].time > time) {
        B = frames[frames.length - i - 1];
      }
    }

    return [A, B];
  }

  _spawnGroup([_, B], count, offset, pointIndex) {
    const group = [];
    let x = 0;
    let y = 0;

    for (let i = offset; i < count + offset && i < B.array.length; i++) {
      x += this.points[pointIndex + i - 3].x;
      y += this.points[pointIndex + i - 3].y;
    }

    x /= count;
    y /= count;

    for (let i = 0; i < 6; i++) {
      const point = new LiqPoint();

      const r = 15;
      const angle = Math.PI * 2 * (i / 6);

      const s = Math.sin(angle);
      const c = Math.cos(angle);

      point.x = x + 0 * c - r * s;
      point.y = y + 0 * s + r * c;

      group.push(point);
    }

    this.groups.push(group);
  }

  _drawPoints() {
    const g = this.g;
    const points = this.points;

    g.clear();

    g.fillStyle(0x000000, 0);
    g.beginPath();
    g.rect(0, 0, Black.stage.bounds.width, Black.stage.bounds.height);
    g.closePath();
    g.fill();

    g.lineStyle(3, 0x105e47);
    g.fillStyle(0x105e47);
    g.beginPath();

    g.moveTo(points[0].x, points[0].y);

    let i;

    for (i = 0; i < points.length - 2; i++) {
      let xc = (points[i].x + points[i + 1].x) * 0.5;
      let yc = (points[i].y + points[i + 1].y) * 0.5;

      g.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    g.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    g.stroke();
    g.closePath();
    g.fill();

    g.lineStyle(1, 0x8a6604);
    g.fillStyle(0xdec909);
    g.beginPath();
    g.circle(this.droplet.x, this.droplet.y, 7);
    g.closePath();
    g.fill();
    g.stroke();

    // for (let i = 0; i < points.length; i++) {
    //   const { x, y } = points[i];

    //   const colorName = this.pressedPoint === points[i] ? COLOR_NAME.PRESSED : COLOR_NAME.DEFAULT;
    //   const { fill, stroke } = COLOR_PALETTE[colorName];

    //   g.lineStyle(1, stroke);
    //   g.fillStyle(fill);
    //   g.beginPath();
    //   g.circle(x, y, 1);
    //   g.closePath();
    //   g.fill();
    //   g.stroke();
    // }

    for (let i = 0; i < this.groups.length; i++) {
      const group = this.groups[i];

      if (group.length < 2)
        continue;

      const p1 = group[0];
      const p2 = group[group.length - 1];

      g.lineStyle(3, 0x105e47, 1, CapsStyle.NONE);
      g.fillStyle(0x105e47);
      g.beginPath();

      g.moveTo((p1.x + p2.x) * 0.5, (p1.y + p2.y) * 0.5);

      for (let i = 0; i < group.length; i++) {
        const p1 = group[i];
        const p2 = group[(i + 1) % group.length];

        let xc = (p1.x + p2.x) * 0.5;
        let yc = (p1.y + p2.y) * 0.5;

        g.quadraticCurveTo(p1.x, p1.y, xc, yc);
      }

      // g.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
      g.closePath();
      g.fill();

      g.stroke();

      // for (let j = 0; j < group.length; j++) {
      //   const { x, y } = group[j];

      //   const { fill, stroke } = COLOR_PALETTE[COLOR_NAME.PRESSED];

      //   g.lineStyle(1, stroke);
      //   g.fillStyle(fill);
      //   g.beginPath();
      //   g.circle(x, y, 2);
      //   g.closePath();
      //   g.fill();
      //   g.stroke();
      // }
    }
  }

  _updateDrag() {
    if (!this.pressedPoint)
      return;

    const currPos = this.globalToLocal(this.currPos.set(Black.input.pointerX, Black.input.pointerY), this.currPos);

    this.pressedPoint.x = this.startPos.x + currPos.x - this.pressPos.x;
    this.pressedPoint.y = this.startPos.y + currPos.y - this.pressPos.y;
  }

  onResize() {
    this.x = Black.stage.bounds.left;
    this.y = Black.stage.bounds.top;

    const screenBounds = new Rectangle(
      this.x,
      this.y,
      Black.stage.bounds.width,
      Black.stage.bounds.height,
    );

    this._slider.alignAnchor();
    this._slider.x = screenBounds.center().x;
    this._slider.y = screenBounds.center().y + 200;
  }
}

class LiqPoint extends Vector {
  constructor() {
    super();

    this.startX = 0;
    this.startY = 0;

    this.index = 0;

    this.vy = 0;
    this.maxOffset = 150;
  }
}

const COLOR_NAME = {
  DEFAULT: 'DEFAULT',
  PRESSED: 'PRESSED',
};

const COLOR_PALETTE = {};

COLOR_PALETTE[COLOR_NAME.DEFAULT] = {
  fill: 0xd66f20,
  stroke: 0x571e02
};

COLOR_PALETTE[COLOR_NAME.PRESSED] = {
  fill: 0x20d63e,
  stroke: 0x02570c
};

function bezier2D(a, b, c, d, t) {
  return new Vector(
    bezier(a.x, b.x, c.x, d.x, t),
    bezier(a.y, b.y, c.y, d.y, t)
  );
}

function bezier(a, b, c, d, t) {
  const v = lerp(b, c, t);

  return lerp(lerp(lerp(a, b, t), v, t), lerp(v, lerp(c, d, t), t), t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

class Slider extends DisplayObject {
  constructor() {
    super();

    const width = this._width = 300;

    const line = this._line = this.addChild(new Graphics());
    const lw = 4;

    line.lineStyle(lw, 0x121212, 1, CapsStyle.ROUND);
    line.beginPath();
    line.moveTo(lw * 0.5, lw * 0.5);
    line.lineTo(width - lw, lw * 0.5);
    line.stroke();
    line.closePath();

    const pointer = this._pointer = this.addChild(new Graphics());

    pointer.y = lw * 0.5;

    pointer.lineStyle(lw * 0.5, 0x121212);
    pointer.fillStyle(0x16b83c);
    pointer.beginPath();
    pointer.circle(0, 0, 9);
    pointer.closePath();
    pointer.fill();
    pointer.stroke();

    pointer.fillStyle(0x000000, 0);
    pointer.beginPath();
    pointer.circle(0, 0, 50);
    pointer.closePath();
    pointer.fill();

    this.touchable = true;
    pointer.touchable = true;

    let isPressed = false;
    const pressPos = new Vector();
    const startPos = new Vector();
    const currPos = new Vector();
    const prevPos = new Vector();
    const pointerVelocity = this.pointerVelocity = new Vector();

    pointer.on('pointerDown', (_, pointerInfo) => {
      this.globalToLocal(pointerInfo, pressPos);

      startPos.copyFrom(pointer);

      isPressed = true;
    });

    pointer.on('pointerUp', () => {
      isPressed = false;
    });

    pointer.onUpdate = () => {
      const prevX = pointer.x;

      if (isPressed) {
        prevPos.copyFrom(currPos);

        this.globalToLocal(currPos.set(Black.input.pointerX, Black.input.pointerY), currPos);

        prevPos.multiplyScalar(-1).add(currPos);
        pointerVelocity.lerp(prevPos, 0.5);

        pointer.x = Math.min(width, Math.max(0, startPos.x + currPos.x - pressPos.x));
      } else {
        pointerVelocity.x *= 0.8;

        pointer.x += pointerVelocity.x;
        pointer.x = Math.min(width, Math.max(0, pointer.x));
      }

      if (Math.abs(prevX - pointer.x) > 0.1) {
        this.post('tune');
      }
    };
  }

  get tune() {
    return this._pointer.x / this._width;
  }

  set tune(val) {
    this.pointerVelocity.x = 0;
    this._pointer.x = this._width * val;

    this.post('tune');
  }

  onUpdate() {
    const s = 0.01;

    if (this.tune + s > 1) {
      this.tune = 0;
    }

    this.tune += s;
  }

  getBounds(...args) {
    return super.getBounds(args[0], false, args[2]);
  }

  get bounds() {
    return this.getBounds();
  }

  onGetLocalBounds(outRect = new Rectangle()) {
    return outRect.set(0, 0, this._line.width, this._line.height);
  }
}