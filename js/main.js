import { CanvasDriver, Input, Engine, StageScaleMode } from "black-engine";
import { FPS_METER } from "./animationConfig";
import { Game } from "./game";

document.addEventListener('contextmenu', e => e.preventDefault());

const engine = new Engine('container', Game, CanvasDriver, [Input]);

// Pause simulation when container loses focus
engine.pauseOnBlur = false;
engine.pauseOnHide = false;
engine.viewport.isTransparent = true;
engine.viewport.backgroundColor = 0x222222;
engine.start();
engine.stage.setSize(900, 500);
engine.stage.scaleMode = StageScaleMode.LETTERBOX;

engine.start();

engine.stage.setSize(900, 500);

engine.stage.scaleMode = StageScaleMode.LETTERBOX;

if (FPS_METER) {
    /* jshint ignore:start */
    (function () { var script = document.createElement('script'); script.onload = function () { var stats = new Stats(); document.body.appendChild(stats.dom); requestAnimationFrame(function loop() { stats.update(); requestAnimationFrame(loop) }); }; script.src = '//mrdoob.github.io/stats.js/build/stats.min.js'; document.head.appendChild(script); })()
}