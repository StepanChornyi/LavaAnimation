import { Component, DisplayObject, Black, Vector, Rectangle, Matrix, MathEx, ColorHelper, Ease } from 'black-engine';

import Rect from '../../Math/Shapes/Rect';
import Circle from '../../Math/Shapes/Circle';
import UTween from '../../libs/utween';

const colorCenterTop = 0xff1f00;
const colorCenterBot = 0x8717d1;
const colorSideBot = 0x2b17d1;
const colorSideTop = 0xd100ff;

export default class ShapesController {
    constructor() {
        this.width = this.height = 1;

        this.animationLeft = new LavaAnimation();
        this.animationLeft.renderGroup.colors = [colorCenterTop, colorCenterBot, colorSideBot, colorSideTop];

        this.animationRight = new LavaAnimation();
        this.animationRight.renderGroup.colors = [colorCenterTop, colorCenterBot, colorSideBot, colorSideTop];

        this.renderGroups = [this.animationLeft.renderGroup, this.animationRight.renderGroup];

        this.updateRenderGroupsDataX();

        this.speedY = 0;

        addEventListener("wheel", (event) => {
            this.speedY -= event.deltaY * 0.5;
        });
    }

    onResize(width, height) {
        const { animationLeft, animationRight } = this;

        this.width = width;
        this.height = height;

        const gw = height;
        const gh = width * 0.5;

        animationLeft.renderGroup.set(0, 0, gw, gh);
        animationLeft.renderGroup.meshFlipped = true;

        animationLeft.onResize();

        animationLeft.transform.identity();
        animationLeft.transform.rotate(Math.PI * 0.5);
        animationLeft.transform.translate(0, -gh);

        animationRight.renderGroup.set(0, 0, gw, gh);
        animationRight.renderGroup.meshFlipped = true;

        animationRight.onResize();

        animationRight.transform.identity();
        animationRight.transform.rotate(-Math.PI * 0.5);
        animationRight.transform.translate(0, gh);
        animationRight.transform.scale(-1, 1);
    }

    updateRenderGroupsDataX() {
        for (let i = 0; i < this.renderGroups.length; i++) {
            this.renderGroups[i].dataX = i;
        }
    }

    onUpdate(dt) {
        this.speedY *= 0.969;

        this.animationLeft.onUpdate(dt, -this.speedY);
        this.animationRight.onUpdate(dt, -this.speedY);
    }
}

const OFF_X = 150;

class LavaAnimation {
    constructor() {
        this.renderGroup = new RenderGroup();
        this.transform = this.renderGroup.transform;

        this.ground = new RectBody();
        this.ground2 = new RectBody();
        this.ground3 = new RectBody();
        this.circles = [];

        for (let i = 0; i < 25; i++) {
            this.circles.push(new CircleBody());
        }

        this.staticCircle = new CircleBody();

        this.renderGroup.shapes = [
            this.ground,
            this.ground2,
            this.ground3,
            ...this.circles,
            this.staticCircle
        ];
    }

    onResize() {
        const width = this.renderGroup.width;
        const height = this.renderGroup.height;

        this.ground.width = Math.ceil((width * 100) / 10) * 10 + 3;
        this.ground.height = height * 0.05;
        this.ground.centerX = width * 0.5;
        this.ground.centerY = height;

        this.ground2.copyFrom(this.ground);

        this.ground2.width = Math.ceil((width * 100) / 10) * 10 + 1;

        this.ground3.copyFrom(this.ground);

        this.ground3.width = Math.ceil((width * 100) / 10) * 10 + 0.5;

        this.staticCircle.r = 200;
        this.staticCircle.x = width * 0.4;
        this.staticCircle.y = 0;

        for (let i = 0; i < this.circles.length; i++) {
            const circle = this.circles[i];

            circle.r = rndBtw(60, 150);
            circle.x = rndBtw(-OFF_X, width + OFF_X);
            circle.y = rndBtw(0, height * 1.3);
        }
    }

    onUpdate(dt, speedX) {
        this.ground.x += 1
        this.ground2.x -= 0.5;

        this.ground.x += speedX;
        this.ground2.x += speedX;
        this.ground3.x += speedX;

        this.staticCircle.x -= speedX;

        if (this.staticCircle.x < -this.staticCircle.r) {
            this.staticCircle.x = this.renderGroup.width + this.staticCircle.r;
        }

        if (this.staticCircle.x > this.renderGroup.width + this.staticCircle.r) {
            this.staticCircle.x = -this.staticCircle.r;
        }

        for (let i = 0; i < this.circles.length; i++) {
            const circle = this.circles[i];

            const { dist, closest } = this._getClosest(circle);//todo optimize this

            if (closest && dist < (closest.radius + circle.radius)) {
                const d = new Vector(circle.x, circle.y).subtract(closest);

                d.multiplyScalar(0.001);

                circle.x += d.x;
                circle.y += d.y;
            }

            circle.y -= lerp(0.5, 1, 1 - (circle.y) / this.renderGroup.height);

            const p = (circle.y) / this.renderGroup.height;

            circle.x += speedX * p;
            circle.x += -5 * (1 - p) * (1 - p);

            const scaleY = Math.min(1, Ease.cubicOut(p - 0.2));
            const scaleX = Math.min(1, 1 - Math.abs(this.renderGroup.width * 0.5 - circle.x) / (OFF_X + this.renderGroup.width));

            circle.s = Math.min(scaleY, scaleX);


            if (circle.y < 0) {
                circle.y = this.renderGroup.height * 1.3;
            }


            if (circle.x < -OFF_X) {
                circle.x = this.renderGroup.width + OFF_X;
                circle.y = rndBtw(0, this.renderGroup.height * 1.3);
            }

            if (circle.x > this.renderGroup.width + OFF_X) {
                circle.x = -OFF_X;
                circle.y = rndBtw(0, this.renderGroup.height * 1.3);
            }

            // if (circle.x < ) {
            //     circle.y = this.renderGroup.height * 1.3;
            // }
        }
    }

    _getClosest(circle) {
        let minDist = Infinity, closest = null;

        for (let i = 0; i < this.circles.length; i++) {
            if (this.circles[i] === circle) {
                continue;
            }

            const dist = MathEx.distance(circle.x, circle.y, this.circles[i].x, this.circles[i].y);

            if (dist < minDist) {
                minDist = dist;
                closest = this.circles[i];
            }
        }

        return { dist: minDist, closest };
    }
}

class RenderGroup extends Rect {
    constructor(...args) {
        super(...args);

        this.dataX = 0;
        this.colors = [];
        this.shapes = [];
        this.meshFlipped = false;
        this.transform = new Matrix();
    }
}

class CircleBody extends Circle {
    constructor(...args) {
        super(...args);

        this.d = 1;
        this.sX = 1;

        this.s = 1;
        this.vx = 0;
        this.vy = 0;
        this.tw = [];
    }

    get radius() {
        return this.r * this.s;
    }

    contains(x, y) {
        const dx = Math.abs(this.x - x)
        const dy = Math.abs(this.y - y)

        if (dx > this.radius || dy > this.radius) {
            return false;
        }

        return Math.sqrt(dx * dx, dy * dy) <= this.radius;
    }
}

class RectBody extends Rect {
    constructor(...args) {
        super(...args);
    }

    contains(x, y) {
        const dx = Math.abs(this.centerX - x)
        const dy = Math.abs(this.centerY - y)

        if (dx < this.width && dy < this.height) {
            return true;
        }

        return false;
    }

    copyFrom(rect) {
        this.x = rect.x;
        this.y = rect.y;

        this.width = rect.width;
        this.height = rect.height;
    }
}

class CircleAnimObj {
    constructor(circle) {
        this.circle = circle;

        this.d = 1;
        this.sX = 1;

        this.s = 1;
        this.vx = 0;
        this.vy = 0;
        this.tw = [];
    }

    get shape() {
        return this.circle;
    }

    set shape(circle) {
        this.circle = circle;
    }
}

function rndBtw(a, b) {
    return lerp(a, b, Math.random());
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function rndSign() {
    return Math.random() < 0.5 ? -1 : 1;
}