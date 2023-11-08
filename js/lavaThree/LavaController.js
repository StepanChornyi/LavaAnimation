import CircleDFMesh from './distanceFieldMeshes/circleDFMesh/CircleDFMesh';
import SineDFMesh from './distanceFieldMeshes/sineDFMesh/SineDFMesh';
import { RENDER_CHANNELS } from './distanceFieldMeshes/DFMesh';
import RectDFMesh from './distanceFieldMeshes/rectDFMesh/RectDFMesh';
import LavaRenderGroup from './LavaRenderGroup';

export class LavaController {
    constructor() {
        const sineGroup = new SideBarsGroup();
        const bubblesGroup = new BubblesGroup();

        this._renderGroups = [sineGroup, bubblesGroup];

        const sun = this.sun = new CircleDFMesh();

        this.sun.radius = 300;

        sineGroup.add(sun, RENDER_CHANNELS.ALPHA);
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

        this.sun.x = width * 0.5;
        this.sun.y = 0;
        this.sun.radius = width * 0.2;
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

        leftSine0.x = leftSine1.x = leftSine2.x = 100;
        leftSine0.y = leftSine1.y = leftSine2.y = height * 0.5;
        leftSine0.halfLength = leftSine1.halfLength = leftSine2.halfLength = height;
        leftSine0.angle = leftSine1.angle = leftSine2.angle = Math.PI * 0.5;

        rightSine0.x = rightSine1.x = rightSine2.x = width - 100;
        rightSine0.y = rightSine1.y = rightSine2.y = height * 0.5;
        rightSine0.halfLength = rightSine1.halfLength = rightSine2.halfLength = height;
        rightSine0.angle = rightSine1.angle = rightSine2.angle = Math.PI * 0.5;
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

        this.bubbles = [];

        setInterval(() => {
            const b = new BubbleAnim();

            b.x = rndPick([-200, this.width + 200]);
            b.y = this.height * rnd();
            b.r = rndBtw(5, 20);

            b.vx = rndBtw(100, 200) * sign(this.width * 0.5 - b.x);
            b.vy = rndBtw(200, 400);

            this.bubbles.push(b);
            this.add(b.mesh, rndPick([RENDER_CHANNELS.RED, RENDER_CHANNELS.GREEN, RENDER_CHANNELS.BLUE, RENDER_CHANNELS.ALPHA]));
        }, 100);
    }

    onUpdate(dt) {
        for (let i = 0; i < this.bubbles.length; i++) {
            const b = this.bubbles[i];

            b.vy -= 100 * dt;

            // b.vx *= 0.99;
            b.vy *= 0.99;


            b.x += b.vx * dt;
            b.y += b.vy * dt;

            b.applyToMesh();
        }
    }

    onResize(width, height) {
        super.onResize(width, height);

        this.width = width;
        this.height = height;
    }
}

class BubbleAnim {
    constructor() {
        this.mesh = new CircleDFMesh();

        this.x = 0;
        this.y = 0;
        this.r = 0;
        this.vx = 0;
        this.vy = 0;

        this.applyToMesh();
    }

    applyToMesh() {
        this.mesh.x = this.x;
        this.mesh.y = this.y;
        this.mesh.radius = this.r;
    }
}
