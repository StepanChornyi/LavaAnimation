export default class Shape {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
    }

    get left() {
        return this.x;
    }

    get right() {
        return this.x;
    }

    get top() {
        return this.y;
    }

    get bottom() {
        return this.y;
    }
}