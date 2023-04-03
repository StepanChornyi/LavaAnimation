import { Component, DisplayObject, Black, ColorHelper, Graphics, CapsStyle, Rectangle, TextField, MathEx } from 'black-engine';
import Slider from './Slider';

export default class Test extends DisplayObject {
    constructor() {
        super();

        this.touchable = true;

        const circle = new Graphics();
        circle.x = 300;
        circle.y = 300;

        const slider = this._slider = new Slider();

        slider.x = 100;
        slider.y = 100;
        slider.maxVal = 100;
        slider.isRounded = false;

        this.add(slider, circle);

        slider.on('change', () => {
            circle.clear();
            circle.lineStyle(1, 0x000000, 0.5);
            circle.fillStyle(0x57f542, 1)
            circle.beginPath();
            circle.circle(0, 0, slider.value);
            circle.closePath();
            circle.fill();
            circle.stroke();
        });

        const a = blend(8, 12, 10)
        const b = blend(10, a, 10)

        console.log(a, b);
    }
}


function blend(a, b, k) {
    const h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);

    return mix(b, a, h) - k * h * (1.0 - h);
}

function clamp(a, min, max) {
    return Math.max(min, Math.min(max, a));
}

function mix(a, b, k) {
    return a + (b - a) * k;
}