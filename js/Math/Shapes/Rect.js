import Shape from './Shape';

export default class Rect extends Shape {
    constructor(x, y, r) {
        super(x, y);

        this.w = r;
        this.h = r;

        this.isRect = true;
    }

    get width() {
        return this.w;
    }

    get height() {
        return this.h;
    }

    get halfWidth() {
        return this.w * 0.5;
    }

    get halfHeight() {
        return this.h * 0.5;
    }

    get centerX() {
        return this.x + this.halfWidth;
    }

    get centerY() {
        return this.y + this.halfHeight;
    }

    set centerX(cx) {
        this.x = cx - this.halfWidth;
    }

    set centerY(cy) {
        this.y = cy - this.halfHeight;
    }

    get left() {
        return this.x;
    }

    get right() {
        return this.x + this.w;
    }

    get top() {
        return this.y;
    }

    get bottom() {
        return this.y + this.h;
    }
}