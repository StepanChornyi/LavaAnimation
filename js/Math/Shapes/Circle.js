import Shape from './Shape';

export default class Circle extends Shape {
    constructor(x, y, r = 0) {
        super(x, y);

        this.r = r;
        this.isCircle = true;
    }

    get radius() {
        return this.r;
    }

    set radius(r) {
        this.r = r;
    }

    get left() {
        return this.x - this.r;
    }

    get right() {
        return this.x + this.r;
    }

    get top() {
        return this.y - this.r;
    }

    get bottom() {
        return this.y + this.r;
    }
}
