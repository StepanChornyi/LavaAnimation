import CircleDFMesh from '../distanceFieldMeshes/circleDFMesh/CircleDFMesh';
import SineDFMesh from '../distanceFieldMeshes/sineDFMesh/SineDFMesh';
import { RENDER_CHANNELS } from '../distanceFieldMeshes/DFMesh';
import RectDFMesh from '../distanceFieldMeshes/rectDFMesh/RectDFMesh';
import { Vector2 } from 'three/src/math/Vector2';
import LavaRenderGroup from '../LavaRenderGroup';

export class LavaController {
    constructor() {
        const sineGroup = new SideBarsGroup();
        const bubblesGroup = new BubblesGroup();

        this._renderGroups = [sineGroup, bubblesGroup];
    }

    onUpdate(dt) {
        for (let i = 0; i < this._renderGroups.length; i++) {
            this._renderGroups[i].onUpdate(dt);
        }
    }

    onResize(width, height) {
        for (let i = 0; i < this._renderGroups.length; i++) {
            this._renderGroups[i].onResize(width, height);
        }
    }

    render(renderer, camera) {
        for (let i = 0; i < this._renderGroups.length; i++) {
            const { scene, renderTarget } = this._renderGroups[i];

            renderer.setClearColor(0x000000, 0)
            renderer.setRenderTarget(renderTarget);
            renderer.render(scene, camera);
        }
    }

    get textures() {
        const textures = [];

        for (let i = 0; i < this._renderGroups.length; i++) {
            textures.push(this._renderGroups[i].texture);
        }

        return textures;
    }
}

class SideBarsGroup extends LavaRenderGroup {
    constructor() {
        super();

        const leftSine0 = this.leftSine0 = new SineDFMesh();
        const leftSine1 = this.leftSine1 = new SineDFMesh();
        const leftSine2 = this.leftSine2 = new SineDFMesh();

        const rightSine0 = this.rightSine0 = new SineDFMesh();
        const rightSine1 = this.rightSine1 = new SineDFMesh();
        const rightSine2 = this.rightSine2 = new SineDFMesh();

        this.add(leftSine0, RENDER_CHANNELS.RED);
        this.add(leftSine1, RENDER_CHANNELS.GREEN);
        this.add(leftSine2, RENDER_CHANNELS.BLUE);

        this.add(rightSine0, RENDER_CHANNELS.RED);
        this.add(rightSine1, RENDER_CHANNELS.GREEN);
        this.add(rightSine2, RENDER_CHANNELS.BLUE);

        leftSine0.frequency = rightSine0.frequency = 0.02
        leftSine1.frequency = rightSine1.frequency = 0.025
        leftSine2.frequency = rightSine2.frequency = 0.01

        leftSine0.amplitude = rightSine0.amplitude = 40
        leftSine1.amplitude = rightSine1.amplitude = 30
        leftSine2.amplitude = rightSine2.amplitude = 50

        leftSine0.phaseShift = 100 * Math.random();
        leftSine1.phaseShift = 100 * Math.random();
        leftSine2.phaseShift = 100 * Math.random();
    }

    onUpdate(dt) {
        // this.myc2.phaseShift += -100 * dt;
        const { leftSine0, leftSine1, leftSine2 } = this;
        const { rightSine0, rightSine1, rightSine2 } = this;

        leftSine0.phaseShift += -40 * dt;
        leftSine1.phaseShift += 20 * dt;
        leftSine2.phaseShift += -30 * dt;

        rightSine0.phaseShift += -40 * dt;
        rightSine1.phaseShift += 20 * dt;
        rightSine2.phaseShift += -30 * dt;
    }

    onResize(width, height) {
        super.onResize(width, height);

        const { leftSine0, leftSine1, leftSine2 } = this;
        const { rightSine0, rightSine1, rightSine2 } = this;

        leftSine0.x = leftSine1.x = leftSine2.x = width * 0.5;
        leftSine0.y = leftSine1.y = leftSine2.y = 0;
        leftSine0.halfLength = leftSine1.halfLength = leftSine2.halfLength = width;
        leftSine0.angle = leftSine1.angle = leftSine2.angle = Math.PI;

        rightSine0.x = rightSine1.x = rightSine2.x = width * 0.5;
        rightSine0.y = rightSine1.y = rightSine2.y = height;
        rightSine0.halfLength = rightSine1.halfLength = rightSine2.halfLength = width;
        rightSine0.angle = rightSine1.angle = rightSine2.angle = Math.PI;
        rightSine0.scaleY = rightSine1.scaleY = rightSine2.scaleY = -1;
    }
}


const lerp = (a, b, t) => (a + (b - a) * t);
const rnd = () => Math.random();
const sign = (v) => (v < 0 ? -1 : 1);
const rndSign = () => sign(rnd() - 0.5);
const rndBtw = (a, b) => lerp(a, b, rnd());
const rndPick = (arr) => arr[Math.round(arr.length * rnd()) % arr.length];

class BubblesGroup extends LavaRenderGroup {
    constructor() {
        super();

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // this.bubbles = [];

        for (let i = 0; i < 50; i++) {
            const b = new BubbleAnim();

            // b.x = rndPick([-200, this.width + 200]);
            // b.y = this.height * rnd();

            const isUp = Math.random() < 0.5;

            b.x = this.width * rnd();
            b.y = isUp ? -this.height * rnd() : this.height + this.height * rnd();
            b.radius = rndBtw(20, 60);

            b.vx = 0//rndBtw(100, 200) * sign(this.width * 0.5 - b.x);
            b.vy = isUp ? 100 : -100;
            b.gravity = isUp ? 100 : -100;

            // this.bubbles.push(b);
            this.add(b, rndPick([RENDER_CHANNELS.RED, RENDER_CHANNELS.GREEN, RENDER_CHANNELS.BLUE, RENDER_CHANNELS.ALPHA]));
        }

        // setInterval(() => {
        //     const b = new BubbleAnim();

        //     b.x = rndPick([-200, this.width + 200]);
        //     b.y = this.height * rnd();
        //     b.r = rndBtw(5, 20);

        //     b.vx = rndBtw(100, 200) * sign(this.width * 0.5 - b.x);
        //     b.vy = rndBtw(200, 400);

        //     this.bubbles.push(b);
        //     this.add(b.mesh, rndPick([RENDER_CHANNELS.RED, RENDER_CHANNELS.GREEN, RENDER_CHANNELS.BLUE, RENDER_CHANNELS.ALPHA]));
        // }, 100);
    }

    onUpdate(dt) {
        for (let i = 0; i < this.channelsArr.length; i++) {
            this.updateBubbles(dt, this.channelsArr[i]);
        }
    }

    updateBubbles(dt, bubbles) {
        for (let i = 0; i < bubbles.length; i++) {
            bubbles[i].force.setScalar(0);
        }

        const tmpVec2 = new Vector2();

        for (let i = 0; i < bubbles.length; i++) {
            const bubbleA = bubbles[i];

            for (let j = i + 1; j < bubbles.length; j++) {
                const bubbleB = bubbles[j];

                if (bubbleA.radius <= 0 || bubbleB.radius <= 0)
                    continue;

                const forceDist = (bubbleA.radius + bubbleB.radius) * 2;

                tmpVec2.x = bubbleA.x - bubbleB.x;
                tmpVec2.y = bubbleA.y - bubbleB.y;

                if (Math.abs(tmpVec2.x) > forceDist || Math.abs(tmpVec2.y) > forceDist)
                    continue;

                const dist = tmpVec2.length();

                if (dist > forceDist)
                    continue;

                tmpVec2.x /= dist;
                tmpVec2.y /= dist;

                const forceVal = (1 - (dist / forceDist));

                tmpVec2.multiplyScalar(forceVal * forceVal);

                bubbleA.force.add(tmpVec2);
                bubbleB.force.add(tmpVec2.negate());
            }
        }

        for (let i = 0; i < bubbles.length; i++) {
            const b = bubbles[i];

            b.vy += b.gravity * dt;

            b.vx *= 0.98;
            b.vy *= 0.98;

            b.vx += b.force.x * b.mass;
            b.vy += b.force.y * b.mass;

            b.radius -= 2*dt;

            b.x += b.vx * dt;
            b.y += b.vy * dt;
        }
    }

    onResize(width, height) {
        super.onResize(width, height);

        this.width = width;
        this.height = height;
    }
}

class BubbleAnim extends CircleDFMesh {
    constructor() {
        super();

        this.vx = 0;
        this.vy = 0;
        this.gravity = 0;
        this.force = new Vector2();
        this.mass = 0;
        this.density = 0.03;
    }

    get radius() {
        return this._dimensions.z;
    }

    set radius(val) {
        this._dimensions.z = val;

        this.mass = Math.PI * val * val * this.density;
    }
}
