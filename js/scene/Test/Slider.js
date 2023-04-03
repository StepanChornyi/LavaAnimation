import { Component, DisplayObject, Black, ColorHelper, Graphics, CapsStyle, Rectangle, TextField, MathEx } from 'black-engine';

export default class Slider extends DisplayObject {
    constructor() {
        super();

        this.touchable = true;
        this.minVal = 0;
        this.maxVal = 100;
        this.isRounded = true;

        const sliderHeight = this._sliderHeight = 5;
        const controllerRadius = this._controllerRadius = sliderHeight;
        const sliderWidth = this._sliderWidth = 200;

        const bg = new Graphics();

        bg.fillStyle(0xff0000, 0)
        bg.beginPath();
        bg.rect(0, 0, sliderWidth, sliderHeight);
        bg.closePath();
        bg.fill();

        bg.lineStyle(sliderHeight, 0x555555, 1, CapsStyle.ROUND);
        bg.beginPath();
        bg.moveTo(sliderHeight * 0.5, sliderHeight * 0.5);
        bg.lineTo(sliderWidth - sliderHeight, sliderHeight * 0.5);
        bg.stroke();
        bg.closePath();

        const controller = this._controller = new Graphics();

        controller.lineStyle(1, 0x000000, 0.5);
        controller.fillStyle(0x4287f5, 1)
        controller.beginPath();
        controller.circle(0, 0, controllerRadius);
        controller.closePath();
        controller.fill();
        controller.stroke();

        const text = this._text = new TextField("1", "Arial", 0xeeeeee, 12);

        text.highQuality = true;

        this.add(bg, controller, text);

        controller.touchable = true;
        bg.touchable = true;

        bg.on("pointerDown", this._onPointerDown.bind(this));
        controller.on("pointerDown", this._onPointerDown.bind(this));

        this._isPressed = false;

        this._setSliderPos();
    }

    _onPointerDown() {
        this._isPressed = true;
        this.onUpdate();
    }

    onUpdate() {
        if (!this._isPressed)
            return;

        if (!Black.input.isPointerDown) {
            this._isPressed = false;
            return;
        }

        const { x } = this.globalToLocal(Black.input.pointerPosition);

        this._setSliderPos(x);
    }

    _setSliderPos(posX = 0) {
        posX = Math.min(this._sliderWidth, Math.max(0, posX));

        this._controller.x = posX;
        this._controller.y = this._sliderHeight * 0.5;

        this._text.alignAnchor(0, 0.5);
        this._text.x = this._sliderWidth + this._controllerRadius;
        this._text.y = this._sliderHeight * 0.5;

        this._text.text = this.isRounded ? `${Math.round(this.value)}` : this.value.toFixed(1);

        this.post("change");
    }

    get value() {
        return MathEx.lerp(this.minVal, this.maxVal, this.valueNormalized);
    }

    get valueNormalized() {
        return this._controller.x / this._sliderWidth;
    }

    onGetLocalBounds(outRect = new Rectangle()) {
        return outRect.set(0, 0, this._sliderWidth, this._sliderHeight);
    }

    get bounds() {
        return this.getBounds();
    }

    getBounds(...args) {
        return super.getBounds(args[0], false, args[2]);
    }
}

