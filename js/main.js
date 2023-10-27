// import { CanvasDriver, Input, Engine, StageScaleMode } from "black-engine";
// import { FPS_METER } from "./animationConfig";
// import { Game } from "./game";
import { LavaThree } from "./lavaThree/LavaThree";

document.addEventListener('contextmenu', e => e.preventDefault());

const lavaThree = new LavaThree(document.getElementById('lava'));

let startTime = null;
let raf = null;
let cachedSizeW = -1, cachedSizeH = -1;

const loop = (time) => {
    if (startTime === null) {
        startTime = time;
        raf = requestAnimationFrame(loop);
        return;
    }

    const dt = time - startTime;

    startTime = time;

    if (cachedSizeW !== window.innerWidth || cachedSizeW !== window.innerHeight) {
        cachedSizeW = window.innerWidth;
        cachedSizeH = window.innerHeight;

        lavaThree.resize(window.innerWidth, window.innerHeight);
    }

    lavaThree.update(dt * 0.001, time * 0.001);
    lavaThree.render();

    raf = requestAnimationFrame(loop);
}

raf = requestAnimationFrame(loop);

if (true) {
    /* jshint ignore:start */
    (function () { var script = document.createElement('script'); script.onload = function () { var stats = new Stats(); document.body.appendChild(stats.dom); requestAnimationFrame(function loop() { stats.update(); requestAnimationFrame(loop) }); }; script.src = '//mrdoob.github.io/stats.js/build/stats.min.js'; document.head.appendChild(script); })()
}