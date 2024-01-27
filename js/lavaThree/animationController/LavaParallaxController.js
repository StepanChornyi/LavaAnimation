import CircleDFMesh from '../distanceFieldMeshes/circleDFMesh/CircleDFMesh';
import SineDFMesh from '../distanceFieldMeshes/sineDFMesh/SineDFMesh';
import { RENDER_CHANNELS } from '../distanceFieldMeshes/DFMesh';
import RectDFMesh from '../distanceFieldMeshes/rectDFMesh/RectDFMesh';
import { Vector2 } from 'three/src/math/Vector2';
import LavaRenderGroup from '../LavaRenderGroup';

export class LavaParallaxController {
    constructor(config) {
        const sineGroup = new SideBarsGroup(config);
        const bubblesGroupBottom = new BubblesGroup(config);
        const bubblesGroupTop = new BubblesGroup(config);

        bubblesGroupTop.texture.flipY = true;

        this.config = config;

        this._renderGroups = [sineGroup, bubblesGroupBottom, bubblesGroupTop];

        this.defaultScroll = -200 * config.parallaxFactor;
        this.scroll = this.defaultScroll;
        this.wheelScroll = 0;

        window.addEventListener('wheel', (event) => {
            this.wheelScroll = event.wheelDelta * config.parallaxFactor * 0.2;
        });
    }

    onUpdate(dt) {
        this.scroll += this.wheelScroll;
        this.scroll = lerp(this.scroll, this.defaultScroll, 0.02);

        this.wheelScroll *= 0.97;

        // this.scroll = -100;

        for (let i = 0; i < this._renderGroups.length; i++) {
            this._renderGroups[i].onUpdate(dt, this.scroll);
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
    constructor(config) {
        super();

        this.config = config;

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

        leftSine0.frequency = rightSine0.frequency = 0.02 * this.config.frequencyFactor;
        leftSine1.frequency = rightSine1.frequency = 0.025 * this.config.frequencyFactor;
        leftSine2.frequency = rightSine2.frequency = 0.01 * this.config.frequencyFactor;

        leftSine0.amplitude = rightSine0.amplitude = 40 * this.config.amplitudeFactor;
        leftSine1.amplitude = rightSine1.amplitude = 30 * this.config.amplitudeFactor;
        leftSine2.amplitude = rightSine2.amplitude = 50 * this.config.amplitudeFactor;

        leftSine0.phaseShift = 100 * Math.random();
        leftSine1.phaseShift = 100 * Math.random();
        leftSine2.phaseShift = 100 * Math.random();
    }

    onUpdate(dt, scroll) {
        // this.myc2.phaseShift += -100 * dt;
        const { leftSine0, leftSine1, leftSine2 } = this;
        const { rightSine0, rightSine1, rightSine2 } = this;

        leftSine0.phaseShift += (-40 + scroll) * dt;
        leftSine1.phaseShift += (20 + scroll) * dt;
        leftSine2.phaseShift += (-30 + scroll) * dt;

        rightSine0.phaseShift += (-40 + scroll) * dt;
        rightSine1.phaseShift += (20 + scroll) * dt;
        rightSine2.phaseShift += (-30 + scroll) * dt;
    }

    onResize(width, height) {
        super.onResize(width, height);

        const { leftSine0, leftSine1, leftSine2 } = this;
        const { rightSine0, rightSine1, rightSine2 } = this;

        leftSine0.x = leftSine1.x = leftSine2.x = width * 0.5;
        leftSine0.y = leftSine1.y = leftSine2.y = this.config.offsetY;
        leftSine0.halfLength = leftSine1.halfLength = leftSine2.halfLength = width;
        leftSine0.angle = leftSine1.angle = leftSine2.angle = Math.PI;

        rightSine0.x = rightSine1.x = rightSine2.x = width * 0.5;
        rightSine0.y = rightSine1.y = rightSine2.y = height - this.config.offsetY;
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

function easeInQuad(x) {
    return x * x;
}

class BubblesGroup extends LavaRenderGroup {
    constructor(config) {
        super();

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.config = config;


        this.scrollOffset = 200;

        let bubbleOffsetX = config.bubbleOffsetX;
        const fullWidth = this.width + this.scrollOffset * 2;
        const bubblesCount = Math.ceil(Math.round(fullWidth / bubbleOffsetX) / 4) * 4;

        bubbleOffsetX = fullWidth / bubblesCount;

        for (let i = 0; i < bubblesCount; i++) {
            const b = new BubbleAnim();

            // b.x = rndPick([-200, this.width + 200]);
            // b.y = this.height * rnd();

            // const isUp = Math.random() < 0.5;

            b.startY = this.height + 300 - config.offsetY;
            b.endY = b.startY - this.height * config.bubbleHeightFactor;

            b.t = rnd();

            // b.x = this.width * rnd();
            // b.y = isUp ? -this.height * rnd() : this.height + this.height * rnd();
            b.y = this.height * 0.5;
            b.x = -this.scrollOffset + bubbleOffsetX * (i + rndBtw(-0.3, 0.3));
            b.radius = rndBtw(20, 60) * config.bubbleScale;

            // b.vx = 0//rndBtw(100, 200) * sign(this.width * 0.5 - b.x);
            // b.vy = isUp ? 100 : -100;
            // b.gravity = isUp ? 50 : -50;

            this.add(b, [RENDER_CHANNELS.RED, RENDER_CHANNELS.GREEN, RENDER_CHANNELS.BLUE, RENDER_CHANNELS.ALPHA][i % 4]);

            // [RENDER_CHANNELS.RED, RENDER_CHANNELS.GREEN, RENDER_CHANNELS.BLUE, RENDER_CHANNELS.ALPHA]
        }
    }

    onUpdate(dt, scroll) {
        for (let i = 0; i < this.channelsArr.length; i++) {
            this.updateBubbles(dt, this.channelsArr[i], scroll);
        }
    }

    updateBubbles(dt, bubbles, scroll) {
        const tmpVec2 = new Vector2();

        for (let i = 0; i < bubbles.length; i++) {
            const b = bubbles[i];

            const speed = lerp(0.1, 0.3, easeInQuad(b.t)) * this.config.parallaxFactor;

            b.t += speed * dt;

            if (b.t >= 1) {
                b.t = 0;
            }

            if (b.x < -this.scrollOffset) {
                b.x = this.width + this.scrollOffset;
            } else if (b.x > this.width + this.scrollOffset) {
                b.x = -this.scrollOffset;
            }


            b.x += scroll * dt;
            b.y = lerp(b.startY, b.endY, b.t);
            b.s = lerp(1, -8, easeInQuad(easeInQuad(b.t)));
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

        this.startY = 0;
        this.endY = 0;
        this.t = 0;

        this.r = 0;
        this._s = 1;
    }

    get s() {
        return this._s;
    }

    set s(val) {
        this._s = val;

        this.radius = this.r;
    }

    get radius() {
        return this.r;
    }

    set radius(val) {
        this.r = val;
        this._dimensions.z = val * this._s;
    }
}
