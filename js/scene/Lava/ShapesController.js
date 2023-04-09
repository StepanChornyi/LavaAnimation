import { Component, DisplayObject, Black, Vector, Rectangle, Matrix, MathEx, ColorHelper, Ease } from 'black-engine';

import Rect from '../../Math/Shapes/Rect';
import Circle from '../../Math/Shapes/Circle';
import UTween from '../../libs/utween';

let isMouseMoved = false;
let prevMousePos = new Vector();
let tmpVec = new Vector();

const colorSideTop = 0xe81e2f;
const colorCenterTop = 0xff0055;
const colorSideBot = 0x0249bd;
const colorCenterBot = 0x8717d1;

export default class ShapesController {
    constructor() {
        this.width = this.height = 1;

        this.ground = new RectBody();
        this.ground2 = new RectBody();
        this.ground3 = new RectBody();
        this.groundCircles = [];
        this.bubbles = [];

        this.renderGroupLeft = new RenderGroup();
        this.renderGroupRight = new RenderGroup();

        this.renderGroupRight.colors = [colorCenterTop, colorSideTop, colorSideBot, colorCenterBot];


        this.animationLeft = new LavaAnimation();
        this.animationLeft.renderGroup.colors = [colorSideTop, colorCenterTop, colorCenterBot, colorSideBot];

        this.animationRight = new LavaAnimation();
        this.animationRight.renderGroup.colors = [colorCenterTop, colorSideTop, colorSideBot, colorCenterBot];


        this.renderGroups = [this.animationLeft.renderGroup, this.animationRight.renderGroup];

        this.updateRenderGroupsDataX();

        for (let i = 0; i < 8; i++) {
            const ground = new CircleBody(0, 0, 50);

            ground.d = Math.random() < 0.5 ? -1 : 1;
            ground.sX = 0.5 + Math.random();

            this.groundCircles.push(ground);

            // this._animateGround(ground);
        }

        for (let i = 0; i < 20; i++) {
            this.bubbles.push(new CircleBody());
        }

        this.shapes =
            this.renderGroupRight.shapes = [
                this.ground,
                this.ground2,
                this.ground3,
                // ...this.groundCircles,
                ...this.bubbles
            ];

        // this._initMouseControl(this.shapes[0]);

        let snappedShape = null;
        const startShapePos = new Vector();
        const startMousePos = new Vector();

        this.activeBoxIndex = -1;
        this.boxes = [];

        window.addEventListener('mousedown', e => {
            const { x, y } = startMousePos.set(e.clientX, e.clientY)//this.transformIvs.transformVector(new Vector(e.clientX, e.clientY));

            for (let i = 0; i < this.shapes.length; i++) {
                if (this.shapes[i].contains(x, y)) {
                    snappedShape = this.shapes[i];
                    startShapePos.copyFrom(snappedShape);
                    return;
                }
            }

            for (let i = 0; i < this.boxes.length; i++) {
                if (this.boxes[i].contains(x, y)) {
                    if (this.activeBoxIndex === i) {
                        this.activeBoxIndex = -1
                    } else {
                        this.activeBoxIndex = i
                    }
                    return;
                }
            }
        });

        window.addEventListener('mouseup', e => {
            snappedShape = null;
        });



        window.addEventListener('mousemove', e => {
            if (!snappedShape)
                return;

            const { x, y } = tmpVec.set(e.clientX, e.clientY)//this.transformIvs.transformVector(new Vector(e.clientX, e.clientY));

            snappedShape.x = startShapePos.x + x - startMousePos.x;
            snappedShape.y = startShapePos.y + y - startMousePos.y;
        });

    }

    _initMouseControl(shape) {
        shape.x = window.innerWidth * 0.5;
        shape.y = window.innerHeight * 0.5;

        window.addEventListener('mousemove', e => {
            const { x, y } = new Vector(e.clientX, e.clientY)//this.transformIvs.transformVector(new Vector(e.clientX, e.clientY));

            shape.x = x - shape.radius;
            shape.y = y - shape.radius;
        });
    }

    onResize(width, height) {
        this.width = width;
        this.height = height;

        this.ground.width = Math.ceil(width / 10) * 10 + 2;
        this.ground.height = height * 0.1;
        this.ground.centerX = width * 0.5;
        this.ground.centerY = height;


        this.ground2.copyFrom(this.ground);


        this.ground2.width = Math.ceil(width / 10) * 10 + 1;

        this.ground3.copyFrom(this.ground);

        this.ground3.width = Math.ceil(width / 10) * 10 + 0.5;


        const offset = 50;
        const step = (this.width + offset * 2) / this.groundCircles.length;

        for (let i = 0; i < this.groundCircles.length; i++) {
            const g = this.groundCircles[i];

            g.x = -offset + step * (i + 0.5);
            g.y = this.ground.top - 100;
            g.r = 10 + 10 * Math.random();

            g.desiredY = g.y;
            g.desiredX = g.x;
            g.timeShift = Math.random() * Math.PI * 2;
            g.timeScale = rndBtw(0.1, 1) * rndSign();
            g.moveAmountX = rndBtw(35, 80);
            g.moveAmountY = rndBtw(10, 35);


            // this._animateGround(g);
        }

        for (let i = 0; i < this.bubbles.length; i++) {
            const bubble = this.bubbles[i];

            bubble.x = this.width * Math.random();
            bubble.y = this.height * Math.random() * 2;

            bubble.desiredX = bubble.x;

            bubble.r = 80 + 60 * Math.random();
            bubble.defaultRadius = bubble.r;
        }

        this.t = 0;

        // this.renderGroupRight.set(this.width * 0.5, 0, this.width * 0.5, this.height);
        // this.renderGroupRight.set(0, 0, this.width, this.height);

        const gw = this.height;
        const gh = this.width * 0.5;

        this.animationLeft.renderGroup.set(0, 0, gw, gh);
        this.animationLeft.renderGroup.meshFlipped = false;


        this.animationLeft.onResize();

        this.animationLeft.transform.identity();
        this.animationLeft.transform.rotate(Math.PI * 0.5);
        this.animationLeft.transform.translate(0, -gh);


        this.animationRight.renderGroup.set(0, 0, gw, gh);
        this.animationRight.renderGroup.meshFlipped = false;

        this.animationRight.onResize();

        this.animationRight.transform.identity();
        this.animationRight.transform.rotate(-Math.PI * 0.5);
        this.animationRight.transform.translate(0, gh);
        this.animationRight.transform.scale(-1, 1);
    }

    updateRenderGroupsDataX() {
        for (let i = 0; i < this.renderGroups.length; i++) {
            this.renderGroups[i].dataX = i;
        }
    }

    onUpdate() {
        this.t += 0.01666666;
        this.ground.x += 1
        this.ground2.x -= 0.5;

        this.animationLeft.onUpdate();
        this.animationRight.onUpdate();

        for (let i = 0; i < this.groundCircles.length; i++) {
            const g = this.groundCircles[i];

            const sin = Math.sin((this.t + g.timeShift) * g.timeScale);
            const cos = Math.cos((this.t + g.timeShift) * g.timeScale);

            g.x = g.desiredX + sin * g.moveAmountX;
            g.y = g.desiredY + cos * g.moveAmountY;
            g.s = 1 + sin * cos * 0.5;
        }

        ///////////////////////

        // isMouseMoved = !prevMousePos.equals(tmpVec.set(Black.input.pointerX, Black.input.pointerY), 0.5);
        // prevMousePos.set(Black.input.pointerX, Black.input.pointerY);

        for (let i = 0; i < this.bubbles.length; i++) {
            const bubble = this.bubbles[i];

            // if (isMouseMoved) {
            //     this._updateBubbleToMouse(bubble);
            // }

            bubble.vy -= 0.01;

            bubble.vx *= 0.98;
            // bubble.vy *= 0.98;

            bubble.x += (bubble.desiredX - bubble.x) * 0.01;
            bubble.y += bubble.vy;
            bubble.r += -0.1;

            if (bubble.x < -bubble.radius * 2) {
                bubble.x = this.width + bubble.radius * 1.5;
                bubble.desiredX = bubble.x;
            }

            if (bubble.x > this.width + bubble.radius * 2) {
                bubble.x = -bubble.radius * 1.5;
                bubble.desiredX = bubble.x;
            }

            if (bubble.y < -bubble.radius * 2 || bubble.r <= -10) {
                bubble.x = this.width * Math.random();
                bubble.y = this.height + bubble.defaultRadius * 2 + 100;
                bubble.r = bubble.defaultRadius;
                bubble.vy = 0;
                bubble.desiredX = bubble.x;

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
}

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

        this.renderGroup.shapes = [
            this.ground,
            this.ground2,
            this.ground3,
            ...this.circles
        ];

        this.t = 0;
    }

    onResize() {
        const width = this.renderGroup.width;
        const height = this.renderGroup.height;

        this.ground.width = Math.ceil((width * 2) / 10) * 10 + 3;
        this.ground.height = height * 0.05;
        this.ground.centerX = width * 0.5;
        this.ground.centerY = height;

        this.ground2.copyFrom(this.ground);

        this.ground2.width = Math.ceil((width * 2) / 10) * 10 + 1;

        this.ground3.copyFrom(this.ground);

        this.ground3.width = Math.ceil((width * 2) / 10) * 10 + 0.5;

        for (let i = 0; i < this.circles.length; i++) {
            const circle = this.circles[i];

            circle.r = 60;
            circle.x = width * Math.random();
            circle.y = height * 1.3 * Math.random();
        }
    }

    onUpdate(dt) {
        this.t += 0.01666666;
        this.ground.x += 1
        this.ground2.x -= 0.5;


        for (let i = 0; i < this.circles.length; i++) {
            const circle = this.circles[i];

            const { dist, closest } = this._getClosest(circle);

            if (closest && dist < (closest.radius + circle.radius)) {
                const d = new Vector(circle.x, circle.y).subtract(closest);

                d.multiplyScalar(0.001);

                circle.x += d.x;
                circle.y += d.y;
            }

            circle.y -= 1;

            const p = (circle.y) / this.renderGroup.height;

            circle.s = Math.min(1, Ease.cubicOut(p - 0.2));

            if (circle.y < 0) {

                circle.y = this.renderGroup.height * 1.3;
            }
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
    return a + (b - a) * Math.random();
}

function rndSign() {
    return Math.random() < 0.5 ? -1 : 1;
}

// window.addEventListener("wheel", (e) => {
//     // for (let i = 0; i < this.bubbles.length; i++) {
//     //     const y = this.bubbles[i].y / this.height;


//     //     this.bubbles[i].desiredX += e.deltaY * (this.mirrored ? 1 : -1) * y;
//     // }

//     for (let i = 0; i < this.groundCircles.length; i++) {
//         const startR = this.groundCircles[i].r;

//         let tw = new UTween(this.groundCircles[i], { r: 1000 }, 1.5, {
//             ease: Ease.backIn,
//         })

//         tw.on("update", () => {
//             if (i) return;

//             document.body.style.filter = `brightness(${1 - Math.max(0, MathEx.lerp(-1, 1, tw.elapsed))})`;

//             // this.grd.style.opacity = `${1 - Math.max(0, MathEx.lerp(-1, 1, tw.elapsed))}`;
//         });

//         tw.once("complete", () => {
//             tw = new UTween(this, { a: 0 }, 2, {
//                 ease: Ease.cubicInOut,
//             })

//             tw.on("update", () => {
//                 if (i) return;

//                 document.body.style.filter = `brightness(${tw.elapsed})`;
//                 // this.grd.style.opacity = `${tw.elapsed}`;
//             });

//             new UTween(this.groundCircles[i], { r: startR, delay: 0.3 }, 2, {
//                 ease: Ease.cubicInOut,
//             })
//         });


//     }
// });
