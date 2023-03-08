import { Component, DisplayObject, Black, Vector, Rectangle, Matrix, MathEx, ColorHelper, Ease } from 'black-engine';

import Rect from '../../Math/Shapes/Rect';
import Circle from '../../Math/Shapes/Circle';
import UTween from '../../libs/utween';

let isMouseMoved = false;
let prevMousePos = new Vector();
let tmpVec = new Vector();

export default class ShapesController {
    constructor() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.ground = new Rect();
        this.groundCircles = [];
        this.bubbles = [];

        for (let i = 0; i < 8; i++) {
            const ground = new CircleBody(0, 0, 50);

            ground.x = (window.innerWidth / 6) * (i + Math.random() * 0.5);
            ground.y = window.innerHeight * (0.9 + 0.1 * Math.random());
            ground.r = 50 + 90 * Math.random();
            ground.d = Math.random() < 0.5 ? -1 : 1;
            ground.sX = 0.5 + Math.random();

            this.groundCircles.push(ground);

            this._animateGround(ground);
        }

        for (let i = 0; i < (32 - 8 - 1); i++) {
            const bubble = new CircleBody();

            bubble.x = window.innerHeight * Math.random();
            bubble.y = window.innerHeight * Math.random();

            bubble.r = 30 + 30 * Math.random();

            this.bubbles.push(bubble);
        }

        this.shapes = [
            this.ground,
            ...this.groundCircles,
            ...this.bubbles
        ];

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


    onResize(width, height) {
        this.width = width;
        this.height = height;

        this.ground.width = width;
        this.ground.height = height * 0.1;
        this.ground.centerX = width * 0.5;
        this.ground.centerY = height;
    }

    onUpdate() {
        for (let i = 0; i < this.groundCircles.length; i++) {
            const groundCircle = this.groundCircles[i];
            const { d, sX } = groundCircle;

            groundCircle.x += sX * d;

            if (d < 0 && groundCircle.x < -groundCircle.r * 2) {
                groundCircle.x = window.innerWidth + groundCircle.r * 2;
            } else if (d > 0 && groundCircle.x > window.innerWidth + groundCircle.r * 2) {
                groundCircle.x = -groundCircle.r * 2;
            }
        }

        ///////////////////////

        // isMouseMoved = !prevMousePos.equals(tmpVec.set(Black.input.pointerX, Black.input.pointerY), 0.5);
        // prevMousePos.set(Black.input.pointerX, Black.input.pointerY);

        for (let i = 0; i < this.bubbles.length; i++) {
            const bubble = this.bubbles[i];

            if (isMouseMoved) {
                this._updateBubbleToMouse(bubble);
            }

            bubble.vy -= 0.2 / bubble.radius;

            bubble.vx *= 0.98;
            bubble.vy *= 0.98;

            bubble.x += bubble.vx;
            bubble.y += bubble.vy;
            bubble.s = bubble.y / (this.height);

            if (bubble.y < -bubble.radius * 2 || bubble.s <= 0.0001) {
                bubble.x = this.width * Math.random();
                bubble.y = this.height + bubble.radius * 2 + 100;
                bubble.s = 1;
                bubble.vy = 0;
            }
        }
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

    // _initMouseControl(shape) {
    //     shape.x = window.innerWidth - shape.width;
    //     shape.y = window.innerHeight - shape.height;

    //     window.addEventListener('mousemove', e => {
    //         const { x, y } = this.transformIvs.transformVector(new Vector(e.clientX, e.clientY));

    //         shape.x = x - shape.width * 0.5;
    //         shape.y = y - shape.height * 0.5;
    //     });
    // }

}

class CircleBody extends Circle {
    constructor(...args) {
        super(...args);

        this.d = 1;
        this.sX = 1;

        this.s = 1;
        this.vx = 0;
        this.vy = 0;
        this.tw = null;
    }

    get radius() {
        return this.r * this.s;
    }
}

class RectBody extends Rect {
    constructor(...args) {
        super(...args);
    }
}

function rndBtw(a, b) {
    return a + (b - a) * Math.random();
}

function rndSign() {
    return Math.random() < 0.5 ? -1 : 1;
}